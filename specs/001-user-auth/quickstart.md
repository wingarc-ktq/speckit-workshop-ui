# Quickstart Guide: ユーザー認証とログイン

**Feature**: 001-user-auth  
**Date**: 2025-10-25  
**Target**: 開発者向け実装ガイド

## 概要

このガイドでは、ユーザー認証機能の実装手順を段階的に説明します。各ユーザーストーリー（US1-US5）を独立したタスクとして実装できるよう設計されています。

**前提条件**:

- Phase 0 (Research)完了
- OpenAPI仕様 (`schema/auth/openapi.yaml`) 確認済み
- Figmaデザイン構造分析済み

---

## 実装フェーズ

### Phase 0: セットアップ ✅

**完了済み**: 技術調査、データモデル定義、API契約定義

### Phase 1: 基盤実装（Foundational）

ドメイン層、アダプター層の基盤コードを実装します。

#### Task 1.1: エラー定義

**目的**: 認証エラーの型定義とエラークラス作成

**ファイル**:

- `src/domain/errors/AuthException.ts`

**実装内容**:

```typescript
// src/domain/errors/AuthException.ts
import { WebApiException } from './WebApiException';

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'NETWORK_ERROR';

export class AuthException extends WebApiException {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
    statusCode: number
  ) {
    super(message, statusCode);
    this.name = 'AuthException';
  }
}
```

**検証**:

```bash
pnpm test src/domain/errors/__tests__/AuthException.test.ts
```

---

#### Task 1.2: Orvalでコード生成

**目的**: OpenAPI仕様からTypeScript型とAPI関数を自動生成

**コマンド**:

```bash
pnpm run gen:api:auth
```

**生成ファイル**:

- `src/adapters/generated/auth.ts`

**生成される内容**:

- `LoginRequest`, `LoginResponse`, `UserResponse`, `RegisterRequest`, `User`, `ErrorResponse` 型
- `loginUser()`, `getCurrentUser()`（`GET /auth/me`）, `registerUser()` API関数
  - `LoginResponse` は `{ accessToken, tokenType: 'Bearer', expiresIn, user }`
  - ログアウト用のサーバー API は存在しない（JWT はステートレス）

**検証**:

```bash
# 生成ファイルの確認
cat src/adapters/generated/auth.ts | grep "export interface"
cat src/adapters/generated/auth.ts | grep "export const"
```

---

#### Task 1.3: MSWモックハンドラー作成

**目的**: API開発前にフロントエンド開発を進めるためのモック実装

**ファイル**:

- `src/adapters/mocks/handlers/auth.ts`

**実装内容**:

```typescript
// src/adapters/mocks/handlers/auth.ts
import { http, HttpResponse, delay } from 'msw';

export const getCustomAuthAPIMock = () => {
  // POST /auth/login - JSON ボディを検証し、成功時に JWT を返す
  const login = http.post('*/auth/login', async ({ request }) => {
    await delay(1000); // ネットワーク遅延シミュレーション

    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    // 認証失敗（{ message, code } 形式で 401）
    if (body.password === 'wrong_password') {
      return HttpResponse.json(
        {
          message: 'メールアドレスまたはパスワードが正しくありません',
          code: 'AUTH_FAILED',
        },
        { status: 401 }
      );
    }

    // 成功: accessToken / tokenType(Bearer) / expiresIn / user を返す
    return HttpResponse.json({
      accessToken: 'mock.jwt.token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    });
  });

  // GET /auth/me - Authorization: Bearer が無ければ 401
  const me = http.get('*/auth/me', async ({ request }) => {
    await delay(1000);

    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: '未認証です', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    });
  });

  // ログアウトはサーバー API を持たない（JWT はステートレス）。
  // クライアント側でトークンを破棄するため、モックは不要。
  return [login, me];
};
```

**ハンドラー登録**:

```typescript
// src/adapters/mocks/handlers/index.ts
import { getCustomAuthAPIMock } from './auth';

export const handlers = [
  ...getCustomAuthAPIMock(),
  // 他のハンドラー...
];
```

**検証**:

```bash
# 開発サーバー起動してブラウザでMSWログ確認
pnpm dev
```

---

#### Task 1.4: AuthRepository実装

**目的**: API呼び出しとエラー変換のリポジトリ層実装

**ファイル**:

- `src/adapters/repositories/auth/AuthRepository.ts`
- `src/adapters/repositories/auth/IAuthRepository.ts`

**実装内容**:

```typescript
// src/adapters/repositories/auth/IAuthRepository.ts
import type { LoginCredentials, LoginResult, AuthSession } from '@/domain/models/auth';

export interface IAuthRepository {
  // ログイン: JWT を取得し、rememberMe に応じて保存する
  login(credentials: LoginCredentials): Promise<LoginResult>;
  // ログアウト: クライアント側で保存済みトークンを破棄する（サーバー API なし）
  logout(): Promise<void>;
  // 認証状態確認: GET /auth/me に Bearer トークンを付与して現在のユーザーを取得
  getCurrentSession(): Promise<AuthSession>;
}
```

> **📝 実装パターン**: 実際のコードでは class ではなく、責務ごとに分割した関数ベースのリポジトリで実装しています（`loginUser.ts` / `getCurrentSession.ts` / `logoutUser.ts`）。以下は JWT の要点を示す擬似コードです。

```typescript
// src/adapters/repositories/auth/loginUser.ts
import { setAccessToken } from '@/adapters/authToken';
import { loginUser as loginUserApi } from '@/adapters/generated/auth';
import type { LoginCredentials, LoginResult } from '@/domain/models/auth';
import { handleLoginError } from './utils/authErrorHandler';

export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResult> => {
  try {
    // JSON ボディ { email, password } を送信し、JWT を受け取る
    const { accessToken, expiresIn, user } = await loginUserApi({
      email: credentials.email,
      password: credentials.password,
    });

    // rememberMe に応じて localStorage / sessionStorage にトークンを保存
    setAccessToken(accessToken, credentials.rememberMe ?? false);

    return {
      session: {
        user: { id: user.id, email: user.email, name: user.name },
        sessionInfo: { expiresAt: new Date(Date.now() + expiresIn * 1000) },
      },
    };
  } catch (error) {
    // エラーレスポンス { message, code } を AuthException / NetworkException に変換
    handleLoginError(error);
  }
};
```

```typescript
// src/adapters/repositories/auth/getCurrentSession.ts
import { getCurrentUser as getCurrentUserApi } from '@/adapters/generated/auth';
import type { AuthSession } from '@/domain/models/auth';
import { handleSessionError } from './utils/authErrorHandler';

// 認証状態確認: GET /auth/me（axios interceptor が Authorization: Bearer を付与）
export const getCurrentSession = async (): Promise<AuthSession> => {
  try {
    const { user } = await getCurrentUserApi();
    return { user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    handleSessionError(error);
  }
};
```

```typescript
// src/adapters/repositories/auth/logoutUser.ts
import { clearAccessToken } from '@/adapters/authToken';

// JWT はステートレスなためサーバー API は無い。クライアント側でトークンを破棄する。
export const logoutUser = (): Promise<void> => {
  clearAccessToken();
  return Promise.resolve();
};
```

**リポジトリ登録**:

```typescript
// src/adapters/repositories/repositoryComposition.ts
import { loginUser } from './auth/loginUser';
import { getCurrentSession } from './auth/getCurrentSession';
import { logoutUser } from './auth/logoutUser';

export const repositories = {
  auth: { login: loginUser, getCurrentSession, logout: logoutUser },
  // 他のリポジトリ...
} as const;
```

**検証**:

```bash
pnpm test src/adapters/repositories/auth/__tests__/AuthRepository.test.ts
```

---

#### Task 1.5: i18n翻訳キー追加

**目的**: エラーメッセージとUI文言の多言語対応

**ファイル**:

- `src/i18n/locales/ja/translation.json`
- `src/i18n/locales/en/translation.json`

**実装内容**:

```json
// src/i18n/locales/ja/translation.json
{
  "auth": {
    "login": {
      "title": "ログイン",
      "email": "メールアドレス",
      "password": "パスワード",
      "rememberMe": "ログイン状態を記録する",
      "submit": "ログイン",
      "errors": {
        "invalidCredentials": "メールアドレスまたはパスワードが正しくありません",
        "networkError": "ネットワークエラーが発生しました。再度お試しください",
        "tokenExpired": "認証の有効期限が切れました。再度ログインしてください",
        "unauthorized": "ログインが必要です"
      }
    },
    "logout": {
      "button": "ログアウト",
      "success": "ログアウトしました"
    }
  },
  "validation": {
    "required": "{{field}}を入力してください",
    "minLength": "{{field}}は{{min}}文字以上必要です",
    "maxLength": "{{field}}は{{max}}文字以内で入力してください"
  }
}
```

```json
// src/i18n/locales/en/translation.json
{
  "auth": {
    "login": {
      "title": "Login",
      "email": "Email Address",
      "password": "Password",
      "rememberMe": "Remember me",
      "submit": "Login",
      "errors": {
        "invalidCredentials": "Invalid email or password",
        "networkError": "Network error occurred. Please try again",
        "tokenExpired": "Your session has expired. Please login again",
        "unauthorized": "Login required"
      }
    },
    "logout": {
      "button": "Logout",
      "success": "Logged out successfully"
    }
  },
  "validation": {
    "required": "{{field}} is required",
    "minLength": "{{field}} must be at least {{min}} characters",
    "maxLength": "{{field}} must be at most {{max}} characters"
  }
}
```

**検証**:

```bash
pnpm test src/i18n/__tests__/translation.test.ts
```

---

### Phase 2: User Story 1 (P1) - 基本的なログイン機能

#### Task 2.1: LoginFormスキーマ定義

**目的**: フォームバリデーションスキーマ作成

**ファイル**:

- `src/presentations/pages/LoginPage/schemas/loginFormSchema.ts`

**実装内容**:

```typescript
// src/presentations/pages/LoginPage/schemas/loginFormSchema.ts
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export const createLoginFormSchema = (
  t: (key: string, params?: any) => string
) =>
  z.object({
    email: z
      .string()
      .min(1, t('validation.required', { field: t('auth.login.email') }))
      .email(t('validation.invalidEmail')),
    password: z
      .string()
      .min(
        8,
        t('validation.minLength', { field: t('auth.login.password'), min: 8 })
      )
      .max(
        36,
        t('validation.maxLength', { field: t('auth.login.password'), max: 36 })
      ),
    // rememberMe はトークンの保存先を切り替えるフラグ（true=localStorage / false=sessionStorage）
    rememberMe: z.boolean().optional(),
  });

export type LoginFormData = z.infer<ReturnType<typeof createLoginFormSchema>>;
```

---

#### Task 2.2: useAuthフック実装

**目的**: TanStack Queryでセッション状態管理

**ファイル**:

- `src/presentations/hooks/useAuth.ts`

**実装内容**:

```typescript
// src/presentations/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRepositories } from '../../app/providers/RepositoryProvider';
import type { LoginCredentials } from '@/domain/models/auth';

const AUTH_QUERY_KEY = ['auth', 'session'];

export const useAuth = () => {
  const { auth: authRepository } = useRepositories();
  const queryClient = useQueryClient();

  // 認証状態取得: GET /auth/me（axios interceptor が Bearer トークンを付与）
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authRepository.getCurrentSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });

  // ログインミューテーション（成功時にトークンが保存済み）
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authRepository.login(credentials),
    onSuccess: (result) => {
      // 認証状態キャッシュ更新
      queryClient.setQueryData(AUTH_QUERY_KEY, result.session);
    },
  });

  // ログアウトミューテーション（クライアント側でトークンを破棄）
  const logoutMutation = useMutation({
    mutationFn: () => authRepository.logout(),
    onSuccess: () => {
      // 認証状態キャッシュクリア
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });

  return {
    user: session?.user ?? null,
    sessionInfo: session?.sessionInfo ?? null,
    isAuthenticated: !!session?.user,
    isLoading,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
  };
};
```

**検証**:

```bash
pnpm test src/presentations/hooks/__tests__/useAuth.test.tsx
```

---

#### Task 2.3: LoginFormコンポーネント実装

**目的**: ログインフォームUI実装

**ファイル**:

- `src/presentations/pages/LoginPage/components/LoginForm.tsx`

**実装内容**:

```typescript
// src/presentations/pages/LoginPage/components/LoginForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Alert,
} from '@mui/material';
import { createLoginFormSchema, type LoginFormData } from '../schemas/loginFormSchema';
import { AuthException } from '../../../../domain/errors/AuthException';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  error: Error | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const { t } = useTranslation();
  const loginFormSchema = createLoginFormSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const getErrorMessage = (error: Error | null): string => {
    if (!error) return '';

    if (error instanceof AuthException) {
      switch (error.code) {
        case 'INVALID_CREDENTIALS':
          return t('auth.login.errors.invalidCredentials');
        case 'NETWORK_ERROR':
          return t('auth.login.errors.networkError');
        default:
          return error.message;
      }
    }

    return error.message;
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(error)}
        </Alert>
      )}

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="email"
            type="email"
            label={t('auth.login.email')}
            autoComplete="email"
            autoFocus
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isLoading}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="password"
            label={t('auth.login.password')}
            type="password"
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isLoading}
          />
        )}
      />

      <Controller
        name="rememberMe"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value} color="primary" />}
            label={t('auth.login.rememberMe')}
            disabled={isLoading}
          />
        )}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? '...' : t('auth.login.submit')}
      </Button>
    </Box>
  );
};
```

**検証**:

```bash
pnpm test src/presentations/pages/LoginPage/components/__tests__/LoginForm.test.tsx
```

---

#### Task 2.4: LoginPageコンポーネント実装

**目的**: ログインページ全体のレイアウトとロジック

**ファイル**:

- `src/presentations/pages/LoginPage/LoginPage.tsx`

**実装内容**:

```typescript
// src/presentations/pages/LoginPage/LoginPage.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Box, Typography, Paper } from '@mui/material';
import { LoginForm } from './components/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import type { LoginFormData } from './schemas/loginFormSchema';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoginPending, loginError } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        navigate(from, { replace: true });
      },
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            {t('auth.login.title')}
          </Typography>

          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isLoginPending}
            error={loginError}
          />
        </Paper>
      </Box>
    </Container>
  );
};
```

**検証**:

```bash
pnpm test src/presentations/pages/LoginPage/__tests__/LoginPage.test.tsx
```

---

#### Task 2.5: ルート登録

**目的**: ログインページのルート設定

**ファイル**:

- `src/app/router/routes.tsx`

**実装内容**:

```typescript
// src/app/router/routes.tsx
import { lazy } from 'react';

const LoginPage = lazy(() =>
  import('../../presentations/pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage }))
);

export const routes = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  // 他のルート...
];
```

**検証**:

```bash
# 開発サーバー起動
pnpm dev

# ブラウザで http://localhost:5173/login にアクセス
```

---

### Phase 3: User Story 3 (P1) - 保護されたページへのアクセス制御

#### Task 3.1: ProtectedRouteコンポーネント実装

**目的**: 認証チェックとリダイレクト処理

**ファイル**:

- `src/app/router/components/ProtectedRoute.tsx`

**実装内容**:

```typescript
// src/app/router/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../../presentations/hooks/useAuth';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
```

**検証**:

```bash
pnpm test src/app/router/components/__tests__/ProtectedRoute.test.tsx
```

---

#### Task 3.2: ProtectedRoute適用

**目的**: 保護が必要なルートにProtectedRoute適用

**ファイル**:

- `src/app/router/routes.tsx`

**実装内容**:

```typescript
// src/app/router/routes.tsx
import { ProtectedRoute } from './components/ProtectedRoute';

export const routes = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      // 他の保護されたルート...
    ],
  },
];
```

**検証**:

```bash
# E2Eテスト実行
pnpm test:e2e tests/specs/login/protected-route.spec.ts
```

---

### Phase 4: User Story 4 (P2) - ログアウト機能

#### Task 4.1: LogoutButtonコンポーネント実装

**目的**: ログアウトボタンUI

**ファイル**:

- `src/presentations/components/LogoutButton/LogoutButton.tsx`

**実装内容**:

```typescript
// src/presentations/components/LogoutButton/LogoutButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

export const LogoutButton: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, isLogoutPending } = useAuth();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate('/login', { replace: true });
      },
    });
  };

  return (
    <Button
      variant="outlined"
      onClick={handleLogout}
      disabled={isLogoutPending}
      startIcon={isLogoutPending ? <CircularProgress size={16} /> : null}
    >
      {t('auth.logout.button')}
    </Button>
  );
};
```

**検証**:

```bash
pnpm test src/presentations/components/LogoutButton/__tests__/LogoutButton.test.tsx
```

---

### Phase 5: User Story 2 (P1) - エラーハンドリング

**Task 2.1-2.5で実装済み**: `LoginForm`コンポーネントでエラー表示実装

**追加検証**:

```bash
# エラーシナリオテスト
pnpm test src/presentations/pages/LoginPage/__tests__/LoginPage.error.test.tsx
```

---

### Phase 6: User Story 5 (P3) - Remember Me機能

**Task 2.1-2.5で実装済み**: `LoginForm`にチェックボックス実装済み

**トークン保存先の確認**:

- `rememberMe: true` でログイン時に JWT が `localStorage` に保存され、リロード後も認証状態が維持されることを確認
- `rememberMe: false` の場合は `sessionStorage` に保存され、タブを閉じると破棄されることを確認
- 保存先の切り替えは `src/adapters/authToken.ts`（`setAccessToken(token, remember)`）で実装

---

### Phase 7: E2Eテスト実装

#### Task 7.1: Playwrightテスト作成

**ファイル**:

- `playwright/tests/specs/login/login.spec.ts`

**実装内容**:

```typescript
// playwright/tests/specs/login/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('ログイン', () => {
  test('有効な認証情報でログインできること', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');

    // ホーム画面にリダイレクトされることを確認
    await expect(page).toHaveURL('/');
  });

  test('無効な認証情報でエラーメッセージが表示されること', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrong_password');

    // エラーメッセージ表示確認
    await expect(
      page.getByText('メールアドレスまたはパスワードが正しくありません')
    ).toBeVisible();
  });

  test('ログイン状態を記録するチェックボックスが機能すること', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.checkRememberMe();
    await loginPage.login('test@example.com', 'password123');

    // rememberMe=true の場合、JWT が localStorage に保存されることを確認
    const token = await page.evaluate(() =>
      localStorage.getItem('accessToken')
    );
    expect(token).toBeTruthy();
  });
});
```

**Page Object**:

```typescript
// playwright/tests/pages/LoginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('#email', email);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
  }

  async checkRememberMe() {
    await this.page.check('input[type="checkbox"][name="rememberMe"]');
  }
}
```

**検証**:

```bash
pnpm test:e2e tests/specs/login/login.spec.ts
```

---

## 実装順序まとめ

```
Phase 1: 基盤実装
├─ Task 1.1: AuthException
├─ Task 1.2: Orvalコード生成
├─ Task 1.3: MSWハンドラー
├─ Task 1.4: AuthRepository
└─ Task 1.5: i18n翻訳キー

Phase 2: US1 (基本ログイン) ← 最優先
├─ Task 2.1: LoginFormスキーマ
├─ Task 2.2: useAuthフック
├─ Task 2.3: LoginFormコンポーネント
├─ Task 2.4: LoginPageコンポーネント
└─ Task 2.5: ルート登録

Phase 3: US3 (保護されたページ)
├─ Task 3.1: ProtectedRoute実装
└─ Task 3.2: ProtectedRoute適用

Phase 4: US4 (ログアウト)
└─ Task 4.1: LogoutButton実装

Phase 5: US2 (エラーハンドリング)
└─ Phase 2で実装済み

Phase 6: US5 (Remember Me)
└─ Phase 2で実装済み

Phase 7: E2Eテスト
└─ Task 7.1: Playwrightテスト
```

---

## 開発コマンド

### 日常開発

```bash
# 開発サーバー起動 (MSW有効)
pnpm dev

# ユニット/コンポーネントテスト
pnpm test

# ユニットテスト (watch mode)
pnpm test:watch

# カバレッジ確認
pnpm test:coverage

# E2Eテスト
pnpm test:e2e

# E2Eテスト (UI mode)
pnpm test:e2e:ui
```

### コード生成

```bash
# OpenAPIからコード生成
pnpm run gen:api:auth

# すべてのOpenAPI仕様から生成
pnpm run gen:api
```

### リンター/フォーマッター

```bash
# ESLint
pnpm lint

# Prettier (自動修正)
pnpm format
```

---

## トラブルシューティング

### MSWが動作しない

**症状**: API呼び出しが実際のエンドポイントに飛ぶ

**解決策**:

```bash
# MSW Service Worker再生成
pnpm exec msw init public/ --save
```

### Orval生成エラー

**症状**: `pnpm run gen:api:auth` でエラー

**解決策**:

```bash
# OpenAPI仕様の検証
pnpm exec orval --input schema/auth/openapi.yaml --output /tmp/test.ts
```

### TypeScript型エラー

**症状**: `LoginRequest` 型が見つからない

**解決策**:

```bash
# 再生成
pnpm run gen:api:auth

# VS Code再起動
# Cmd+Shift+P → "Reload Window"
```

---

## Constitution Check

すべてのタスクは以下の原則に従います:

1. ✅ **TypeScript Strict Mode**: `strict: true`, 型安全性確保
2. ✅ **Component Architecture**: 機能的凝集性、単一責任の原則
3. ✅ **Material-UI First**: MUIコンポーネント優先、カスタムCSS最小化
4. ✅ **Test-Driven Development**: テストファースト、カバレッジ80%以上
5. ✅ **API-First with OpenAPI**: Orval自動生成、手動APIコード禁止
6. ✅ **Clean Architecture**: 4層分離、依存関係逆転
7. ✅ **Accessibility**: WCAG 2.1 AA、セマンティックHTML、aria属性

---

## Next Steps

✅ Phase 1 (Quickstart)完了 → **Agentコンテキスト更新に進む**

**コマンド**:

```bash
.specify/scripts/bash/update-agent-context.sh copilot
```

その後、`/speckit.tasks` コマンドで `tasks.md` を生成し、実装を開始します。
