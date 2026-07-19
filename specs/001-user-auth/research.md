# Research: ユーザー認証とログイン

**Feature**: 001-user-auth  
**Date**: 2025-10-25  
**Purpose**: 技術選定、ベストプラクティス、実装パターンの調査

## 技術決定事項

### 1. フォーム管理とバリデーション

**Decision**: React Hook Form + Zod を使用

**Rationale**:

- React Hook Formは高性能で再レンダリングを最小化
- Zodによる型安全なスキーマバリデーション（TypeScriptと統合）
- MUIとの統合が容易（Controller component）
- OpenAPI仕様の型定義と統合可能

**Alternatives Considered**:

- Formik: 人気だが、React Hook Formより低速
- 素のReact state: バリデーションロジックが複雑化

**Implementation Pattern**:

```typescript
// useLoginForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('メールアドレスの形式が正しくありません'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
  // rememberMe はトークンの保存先を切り替えるためのフラグ
  // （true=localStorage / false=sessionStorage）
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function useLoginForm() {
  return useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });
}
```

---

### 2. 認証方式と認証状態管理

**Decision**: JWT（Bearer トークン）認証を採用し、認証状態は TanStack Query (React Query) で管理

**Rationale**:

- バックエンドの OpenAPI が JWT（bearerAuth）認証に変更され、API がトークン方式を規定
  - サーバー側のセッション状態を持たない（ステートレス）。ブラウザの自動送信に依存しないため
    クロスサイトリクエストフォージェリ対策も不要
- ログインで受け取った JWT アクセストークンをクライアント側に保存し、以降のリクエストは
  `Authorization: Bearer <token>` ヘッダーで送信する
- 認証状態の確認は `GET /auth/me` にトークンを付与して行い、成功すればログイン中と判定する
- サーバー状態とキャッシュ管理は TanStack Query に集約（自動再取得、エラーハンドリング）
- ログアウトはサーバー API を持たず、クライアント側でトークンを破棄する（ステートレス）

**トークン保存方針**:

- `rememberMe: true` → `localStorage`（リロード後も保持）
- `rememberMe: false` → `sessionStorage`（タブを閉じるまで保持）
- 保存先の切り替え・付与は `src/adapters/authToken.ts` と `src/adapters/axios.ts`（request interceptor）で実装

**Alternatives Considered**:

- サーバーセッション方式: API が JWT（Bearer）に変更されたため採用不可
- Context API単体: キャッシュとリフレッシュロジックを自前実装する必要
- Zustand: グローバル状態管理だが、サーバー状態には不向き

**Implementation Pattern**:

```typescript
// authToken.ts — JWT アクセストークンのクライアント側ストア
const TOKEN_KEY = 'accessToken';

export function setAccessToken(token: string, remember: boolean): void {
  clearAccessToken();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

// axios.ts — 保存済みトークンを Authorization ヘッダーに付与
axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AUTH_QUERY_KEY = ['auth', 'session'] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  // 認証状態確認: GET /auth/me（Authorization: Bearer <token>）
  const { data: session, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authRepository.getCurrentSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分
  });

  // ログイン（成功時にトークンを保存し、認証状態を更新）
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormData) =>
      authRepository.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });

  // ログアウト（クライアント側でトークンを破棄）
  const logoutMutation = useMutation({
    mutationFn: () => authRepository.logout(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
    },
  });

  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
  };
}
```

---

### 3. ProtectedRouteパターン

**Decision**: React Router v7のloader + コンポーネントラッパー

**Rationale**:

- React Router v7の新しいデータローディングパターンを活用
- 認証チェックをルート定義レベルで実装
- リダイレクト先URL（redirect param）の保存が容易

**Alternatives Considered**:

- HOC (Higher Order Component): React Hooksと相性悪い
- 各ページで個別チェック: DRY原則違反、漏れのリスク

**Implementation Pattern**:

```typescript
// ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // またはスケルトン
  }

  if (!isAuthenticated) {
    // ログイン画面にリダイレクト（元のURLを保存）
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
```

---

### 4. エラーハンドリング戦略

**Decision**: 階層的エラーハンドリング（Network → API → UI）

**Rationale**:

- ネットワークエラー、認証エラー、バリデーションエラーを区別
- ユーザーに適切なフィードバックを提供
- 既存のエラーシステム（WebApiException）を拡張

**Implementation Pattern**:

```typescript
// AuthException.ts
import { WebApiException } from '@/domain/errors';

export class AuthException extends WebApiException {
  constructor(
    // JWT: トークンが無効/失効した場合の認証失敗を表す
    public readonly code: 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'UNAUTHORIZED',
    message: string,
    statusCode: number
  ) {
    super(message, statusCode);
    this.name = 'AuthException';
  }
}

// loginUser.ts — 成功時に JWT を保存し、失敗時はドメイン例外へ変換
// エラーレスポンスは { message, code } 形式
async function login(credentials: LoginFormData): Promise<LoginResult> {
  try {
    const { accessToken, expiresIn, user } = await loginUser({
      email: credentials.email,
      password: credentials.password,
    });
    // rememberMe に応じて localStorage / sessionStorage に保存
    setAccessToken(accessToken, credentials.rememberMe ?? false);
    return { session: { user, sessionInfo: { expiresAt: new Date(Date.now() + expiresIn * 1000) } } };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { message, code } = error.response.data;
      throw new AuthException(code, message, error.response.status);
    }
    throw new NetworkException('ネットワークエラーが発生しました');
  }
}
```

---

### 5. Figmaデザインの実装方針

**Decision**: MUIコンポーネント優先、Figmaトークンは参考程度

**Rationale**:

- MUIのデフォルトスタイルとテーマシステムを活用
- Figmaのピクセル単位の細かい調整は再現しない
- レイアウトと配色構造はFigmaに合わせる
- Constitution原則III（Material-UI First）に準拠

**Figma構造分析**:

```
/login (Frame)
└── Frame 11 (Container)
    ├── icon 1 (Logo)
    ├── <Typography> (h3) - "Login"
    ├── <Typography> (body1) - "Please sign in..."
    ├── *Custom / Forms / Email & Password (Form)
    │   ├── <TextField> - "Email Address"
    │   ├── Spacing
    │   ├── <TextField> - "Password" (with eye icon)
    │   ├── Spacing
    │   ├── <FormControlLabel> - "Remember me"
    │   ├── Spacing
    │   └── <Button> - "Login"
    └── <Link> - "Forgot Password?"
```

**Component Mapping**:
| Figma Component | MUI Component | Props |
|----------------|---------------|-------|
| `<Typography>` h3 | `Typography` | `variant="h3"` |
| `<Typography>` body1 | `Typography` | `variant="body1"` |
| `<TextField>` | `TextField` | `variant="outlined"`, `size="medium"` |
| `<FormControlLabel>` | `FormControlLabel` + `Checkbox` | `label="Remember me"` |
| `<Button>` | `Button` | `variant="contained"`, `size="large"`, `color="primary"` |
| `<Link>` | `Link` | `underline="hover"`, `color="primary"` |

**Spacing Strategy**:

- Figmaの`Spacing | Vertical`（16px）を`theme.spacing(2)`に変換
- MUIのGrid/Stackコンポーネントでレイアウト
- カードコンテナは`Paper`コンポーネント（`padding: theme.spacing(4)`）

---

### 6. MSWモック戦略

**Decision**: シナリオベースのハンドラー（成功・失敗・エッジケース）

**Rationale**:

- 開発環境とテスト環境で同じモックを使用
- OpenAPI仕様に基づいたレスポンス
- エラーケースのテストが容易

**Implementation Pattern**:

```typescript
// auth.ts（JWT 認証APIのモックハンドラー）
import { http, HttpResponse, delay } from 'msw';

export const getCustomAuthAPIMock = () => [
  // POST /auth/login — JSON ボディを検証し、成功時に JWT を返す
  http.post('*/auth/login', async ({ request }) => {
    await delay(1000);

    const body = (await request.json()) as { email?: string; password?: string };

    // 認証失敗ケース（{ message, code } 形式で 401）
    if (body.password === 'wrong_password') {
      return HttpResponse.json(
        {
          message: 'メールアドレスまたはパスワードが正しくありません',
          code: 'AUTH_FAILED',
        },
        { status: 401 }
      );
    }

    // 成功ケース: accessToken / tokenType(Bearer) / expiresIn / user を返す
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
  }),

  // GET /auth/me — Authorization: Bearer が無ければ 401
  http.get('*/auth/me', async ({ request }) => {
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
  }),

  // ログアウトはサーバー API を持たない（JWT はステートレス）。
  // クライアント側でトークンを破棄するため、モックハンドラーは不要。
];
```

---

### 7. 国際化（i18n）対応

**Decision**: react-i18next（既存システム）を使用

**Rationale**:

- プロジェクトで既に使用中
- 型安全な翻訳キー（useTypedTranslation）
- Constitution指示に準拠

**Translation Keys**:

```json
// locales/ja/auth.json
{
  "login": {
    "title": "ログイン",
    "subtitle": "アカウントにサインインしてください",
    "emailLabel": "メールアドレス",
    "passwordLabel": "パスワード",
    "rememberMe": "ログイン状態を保持",
    "loginButton": "ログイン",
    "forgotPassword": "パスワードをお忘れですか？",
    "errors": {
      "required": "{field}を入力してください",
      "invalidEmail": "メールアドレスの形式が正しくありません",
      "invalidCredentials": "メールアドレスまたはパスワードが正しくありません",
      "networkError": "ネットワークエラーが発生しました。再度お試しください",
      "unauthorized": "認証の有効期限が切れました。再度ログインしてください"
    }
  }
}
```

---

### 8. テスト戦略

**Decision**: 3層テスト（Unit → Component → E2E）

**Test Coverage**:

| Layer         | What to Test                                                                     | Tools                          | Files                                   |
| ------------- | -------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------- |
| **Unit**      | - カスタムフック（useLoginForm）<br>- Repository実装<br>- バリデーションロジック | Vitest + React Testing Library | `*.test.ts`, `*.test.tsx`               |
| **Component** | - LoginPageコンポーネント<br>- LoginFormコンポーネント<br>- ProtectedRoute       | Vitest + RTL + MSW             | `*.test.tsx`                            |
| **E2E**       | - ログインフロー<br>- ログアウトフロー<br>- リダイレクトフロー<br>- エラーケース | Playwright + MSW               | `playwright/tests/specs/auth/*.spec.ts` |

**Priority Testing Scenarios**:

1. ✅ **P1**: 有効な認証情報でログイン成功
2. ✅ **P1**: 無効な認証情報でエラー表示
3. ✅ **P1**: 保護されたページへのリダイレクト
4. ✅ **P2**: ログアウト機能
5. ✅ **P3**: Remember Me機能

---

## ベストプラクティス参照

### React Hook Form + MUI Integration

- [React Hook Form with MUI](https://react-hook-form.com/get-started#IntegratingwithUIlibraries)
- [MUI TextField Controller](https://mui.com/material-ui/react-text-field/#integration-with-3rd-party-input-libraries)

### TanStack Query Authentication Pattern

- [Authentication pattern](https://tanstack.com/query/latest/docs/framework/react/guides/authentication)
- [Optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

### React Router v7 Protected Routes

- [Protecting Routes](https://reactrouter.com/en/main/start/tutorial#protecting-routes)
- [Redirects](https://reactrouter.com/en/main/fetch/redirect)

### MSW Best Practices

- [MSW with React](https://mswjs.io/docs/integrations/browser)
- [Testing with MSW](https://mswjs.io/docs/getting-started/integrate/node)

---

## 未解決の技術的課題

**なし**: すべての技術的決定事項が確定。Phase 1（設計）に進行可能。

---

## Next Phase

✅ Phase 0完了 → **Phase 1: データモデルとAPI契約定義に進む**
