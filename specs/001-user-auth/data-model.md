# Data Model: ユーザー認証とログイン

**Feature**: 001-user-auth  
**Date**: 2025-10-25  
**Source**: `schema/auth/openapi.yaml` + 機能仕様

認証は **JWT（Bearer）方式** です。ログイン成功時に発行された JWT アクセストークンをクライアント側に保存し、`Authorization: Bearer <JWT>` として送信します。セッションCookie・CSRF は使用しません。

## エンティティ定義

### 1. User（ユーザー）

ログイン済みユーザーの情報を表すエンティティ（API スキーマ）。

**属性**:

| Field       | Type                | Required | Description          | Validation |
| ----------- | ------------------- | -------- | -------------------- | ---------- |
| `id`        | `string (UUID)`     | ✅       | ユーザーの一意識別子 | UUID形式   |
| `email`     | `string`            | ✅       | メールアドレス       | Email形式  |
| `name`      | `string`            | ✅       | 氏名                 | 1-100文字  |
| `createdAt` | `string (ISO 8601)` | ✅       | 作成日時             | date-time  |
| `updatedAt` | `string (ISO 8601)` | ✅       | 更新日時             | date-time  |

**TypeScript型定義**（Orval自動生成）:

```typescript
// adapters/generated/auth.ts
export interface User {
  id: string; // UUID
  email: string;
  name: string;
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
}
```

**状態遷移**: なし（読み取り専用）

**関連エンティティ**: LoginResponse（1:1）、UserResponse（1:1）

> ドメインモデルの `User` は `{ id, email, name }` のみを保持します（`createdAt` / `updatedAt` はドメインへ持ち込みません）。後述の「ドメインモデル」を参照。

---

### 2. LoginResponse（ログインレスポンス / JWT）

ログインAPI成功時のレスポンス。JWT アクセストークンとユーザー情報を含みます。

**属性**:

| Field         | Type            | Required | Description                | 対応 OpenAPI Schema        |
| ------------- | --------------- | -------- | -------------------------- | -------------------------- |
| `accessToken` | `string (JWT)`  | ✅       | JWT アクセストークン       | `LoginResponse.accessToken`|
| `tokenType`   | `'Bearer'`      | ✅       | トークン種別（固定 Bearer）| `LoginResponse.tokenType`  |
| `expiresIn`   | `number`        | ✅       | 有効期限（秒）             | `LoginResponse.expiresIn`  |
| `user`        | `User`          | ✅       | ユーザー情報               | `LoginResponse.user`       |

**TypeScript型定義**（Orval自動生成）:

```typescript
// adapters/generated/auth.ts
export const LoginResponseTokenType = { Bearer: 'Bearer' } as const;
export type LoginResponseTokenType =
  (typeof LoginResponseTokenType)[keyof typeof LoginResponseTokenType];

export interface LoginResponse {
  accessToken: string; // JWT アクセストークン
  tokenType: LoginResponseTokenType; // 'Bearer'
  expiresIn: number; // 有効期限（秒）
  user: User;
}
```

**関連エンティティ**: User（1:1）

---

### 3. トークンストレージ（クライアント側 JWT 永続化）

発行された JWT アクセストークンのクライアント側保存。`rememberMe` により保存先を切り替えます。

**属性**:

| Field         | Type            | Required | Description                        | Validation                     |
| ------------- | --------------- | -------- | ---------------------------------- | ------------------------------ |
| `accessToken` | `string (JWT)`  | ✅       | 保存する JWT アクセストークン      | キー: `accessToken`            |
| 保存先        | `Storage`       | ✅       | `rememberMe` により保存先を選択    | true→localStorage / false→sessionStorage |

**TypeScript実装参照**:

```typescript
// adapters/authToken.ts
// remember=true → localStorage（リロード後も保持）
// remember=false → sessionStorage（タブを閉じるまで保持）
export function setAccessToken(token: string, remember: boolean): void;
export function getAccessToken(): string | null;
export function clearAccessToken(): void;
```

**状態遷移**:

```
[未認証] --login (setAccessToken)--> [認証済み] --logout/期限切れ (clearAccessToken)--> [未認証]
```

**ライフサイクル**:

- **作成**: ログイン成功時に `setAccessToken(accessToken, rememberMe)` で保存
- **送信**: axios interceptor が `Authorization: Bearer <JWT>` として付与
- **削除**: ログアウト時に `clearAccessToken()`（サーバーAPIなし）

---

### 4. LoginCredentials（ログイン認証情報 / フォーム入力）

ログインフォームの入力データを表すドメインモデル。API へは `email` / `password` のみ送信します。

**属性**:

| Field        | Type      | Required | Description                                   | Validation             |
| ------------ | --------- | -------- | --------------------------------------------- | ---------------------- |
| `email`      | `string`  | ✅       | メールアドレス                                | 必須 / Email形式       |
| `password`   | `string`  | ✅       | パスワード                                    | 必須 / 8-36文字        |
| `rememberMe` | `boolean` | ❌       | トークン保存先を選択（APIへは送信しない）     | true→localStorage / false→sessionStorage |

**TypeScript型定義**:

```typescript
// domain/models/auth/type.ts
export const loginCredentialsSchema = z.object({
  email: z
    .string()
    .min(1, { error: () => i18n.t(tKeys.validations.require) })
    .pipe(z.email({ error: () => i18n.t(tKeys.validations.invalidEmail) })),
  password: z
    .string()
    .min(1, { error: () => i18n.t(tKeys.validations.require) })
    .min(8, { error: () => i18n.t(tKeys.validations.minLength, { min: 8 }) })
    .max(36, { error: () => i18n.t(tKeys.validations.maxLength, { max: 36 }) }),
  rememberMe: z.boolean().optional(),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
```

> `rememberMe` はクライアント側専用フラグです。API リクエスト（`LoginRequest`）には含めず、`setAccessToken` の保存先選択にのみ使用します。

**関連エンティティ**: LoginRequest（`email` / `password` を送信）

---

### 5. LoginRequest（ログインリクエスト）

APIに送信するログインリクエストデータ。`LoginCredentials` から `email` / `password` を抽出して生成。

**属性**:

| Field      | Type     | Required | Description    | 対応 OpenAPI Schema     |
| ---------- | -------- | -------- | -------------- | ----------------------- |
| `email`    | `string` | ✅       | メールアドレス | `LoginRequest.email`    |
| `password` | `string` | ✅       | パスワード     | `LoginRequest.password` |

**TypeScript型定義**（Orval自動生成）:

```typescript
// adapters/generated/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}
```

---

### 6. RegisterRequest / UserResponse（登録API スキーマ）

`POST /auth/register`（今回UIなし）と `POST /auth/login` / `GET /auth/me` のレスポンスラッパー。

**RegisterRequest 属性**:

| Field      | Type     | Required | Description    | Validation             |
| ---------- | -------- | -------- | -------------- | ---------------------- |
| `email`    | `string` | ✅       | メールアドレス | Email形式 / 最大255文字 |
| `password` | `string` | ✅       | パスワード     | 8-128文字              |
| `name`     | `string` | ✅       | 氏名           | 1-100文字              |

**UserResponse 属性**:

| Field  | Type   | Required | Description  | 対応 OpenAPI Schema |
| ------ | ------ | -------- | ------------ | ------------------- |
| `user` | `User` | ✅       | ユーザー情報 | `UserResponse.user` |

**TypeScript型定義**（Orval自動生成）:

```typescript
// adapters/generated/auth.ts
export interface RegisterRequest {
  email: string; // 最大255文字
  password: string; // 8-128文字
  name: string; // 1-100文字
}

export interface UserResponse {
  user: User;
}
```

> `GET /auth/me` のレスポンスも `UserResponse`（`{ user }`）です。

---

### 7. AuthError（認証エラー）

認証エラー情報を表すエンティティ。API は `ErrorResponse`（`{ message, code }`）を返します。

**ErrorResponse 属性**:

| Field     | Type     | Required | Description      | 対応 OpenAPI Schema   |
| --------- | -------- | -------- | ---------------- | --------------------- |
| `message` | `string` | ✅       | エラーメッセージ | `ErrorResponse.message` |
| `code`    | `string` | ✅       | エラーコード     | `ErrorResponse.code`    |

**ドメインのエラーコード一覧**:

| Code                  | HTTP Status | Description            | ユーザー表示メッセージ                                     |
| --------------------- | ----------- | ---------------------- | ---------------------------------------------------------- |
| `INVALID_CREDENTIALS` | 401         | 認証情報が無効         | メールアドレスまたはパスワードが正しくありません           |
| `NO_SESSION`          | 401         | 未認証（`/auth/me`）   | ログインが必要です                                         |
| `SESSION_EXPIRED`     | 401         | トークン期限切れ       | 有効期限が切れました。再度ログインしてください             |
| `NETWORK_ERROR`       | N/A         | ネットワークエラー     | ネットワークエラーが発生しました。再度お試しください       |

**TypeScript型定義**:

```typescript
// domain/errors/AuthException.ts
export const AuthErrorCode = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NO_SESSION: 'NO_SESSION',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;
export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

export class AuthException extends WebApiException {
  readonly code: AuthErrorCode;
  // ...
}
```

---

## ドメインモデル

`adapters/repositories/auth/*` で API 型からドメイン型へマッピングします。

### User（ドメイン）

```typescript
// domain/models/auth/type.ts
export interface User {
  readonly id: string; // ユーザーID
  readonly email: string; // メールアドレス
  readonly name: string; // 氏名
}
```

### AuthSession（ドメイン）

`sessionInfo.expiresAt` はログイン時に `LoginResponse.expiresIn`（秒）から算出します。`GET /auth/me` では有効期限が返らないため `sessionInfo` は省略されます（オプショナル）。

```typescript
// domain/models/auth/type.ts
export interface SessionInfo {
  readonly expiresAt: Date; // アクセストークンの有効期限
}

export interface AuthSession {
  readonly user: User;
  readonly sessionInfo?: SessionInfo; // ログイン時のみ有効期限を保持
}
```

> ログイン時: `expiresAt = new Date(Date.now() + expiresIn * 1000)` を設定。  
> `/auth/me` 取得時: `sessionInfo` なし（`user` のみ）。

---

## エンティティ関係図（ER図）

```
┌──────────────────┐
│ LoginCredentials │ (フォーム入力)
│  - email         │
│  - password      │
│  - rememberMe?   │──────────────┐
└────────┬─────────┘              │ rememberMe（クライアント側のみ）
         │ email/password 送信    │
         ▼                        ▼
┌──────────────────┐      ┌──────────────────────┐
│   LoginRequest   │      │  トークンストレージ    │
│  - email         │      │  localStorage /       │
│  - password      │      │  sessionStorage       │
└────────┬─────────┘      └──────────────────────┘
         │ POST /auth/login              ▲
         ▼                               │ setAccessToken
┌──────────────────┐                     │
│  LoginResponse   │                     │
│  - accessToken ──┼─────────────────────┘
│  - tokenType     │
│  - expiresIn ────┼──► AuthSession.sessionInfo.expiresAt を算出
│  - user ─────────┼──► User { id, email, name }
└──────────────────┘
```

---

## データフロー

### ログインフロー

```
1. [User Input]
   ユーザーがフォームに入力（email, password, rememberMe）
   ↓
2. [Validation]
   React Hook Form + Zod（loginCredentialsSchema）でバリデーション
   ↓
3. [API Request]
   POST /auth/login
   Body: { email, password }   ※ rememberMe は送信しない
   ↓
4. [API Response]
   200 OK: LoginResponse { accessToken, tokenType, expiresIn, user }
   400 / 401: ErrorResponse { message, code }
   ↓
5. [Token Store]
   setAccessToken(accessToken, rememberMe)
   （rememberMe: true→localStorage / false→sessionStorage）
   ↓
6. [State Update / Redirect]
   AuthSession を生成しホーム画面または元のページに遷移
```

### 認証ユーザー取得フロー

```
1. [Page Load]
   保護されたページにアクセス
   ↓
2. [User Query]
   GET /auth/me
   Authorization: Bearer <JWT>（axios interceptor が付与）
   ↓
3. [Response Check]
   200 OK: UserResponse → AuthSession { user } を生成しページ表示
   401 Unauthorized: ログイン画面にリダイレクト（NO_SESSION）
```

### ログアウトフロー（クライアント側のみ）

```
1. [User Action]
   ログアウトボタンクリック
   ↓
2. [Token Clear]
   clearAccessToken()（localStorage / sessionStorage から削除）
   ※ サーバーAPIなし（JWT はステートレス）
   ↓
3. [State Clear / Redirect]
   キャッシュをクリアしログイン画面に遷移
```

---

## データ永続化

| Data                 | Storage Location                | Lifetime                              | Security                              |
| -------------------- | ------------------------------- | ------------------------------------- | ------------------------------------- |
| JWT アクセストークン | localStorage or sessionStorage  | localStorage: 永続 / sessionStorage: タブを閉じるまで | `rememberMe` で保存先を選択 |
| ユーザー情報         | TanStack Query Cache            | staleTime: 5分                        | メモリのみ、ページリロードで消失      |

**セキュリティ考慮事項**:

- JWT は `Authorization: Bearer` ヘッダーで送信（Cookie・CSRF は使用しない）
- トークン有効期限（`expiresIn` / `expiresAt`）で失効管理
- パスワードは平文送信しない（HTTPS暗号化）
- ログアウトはクライアント側でトークン破棄（ステートレス）

---

## バリデーション仕様

### クライアント側バリデーション

| Field    | Rule       | Error Message                                    |
| -------- | ---------- | ------------------------------------------------ |
| email    | 必須       | "入力してください"                               |
| email    | Email形式  | "メールアドレスの形式が正しくありません"         |
| password | 必須       | "入力してください"                               |
| password | 8-36文字   | "8文字以上 / 36文字以内で入力してください"        |

### サーバー側バリデーション

OpenAPI仕様（`schema/auth/openapi.yaml`）に定義:

- **LoginRequest**: `email`（Email形式）、`password`（必須）
- **RegisterRequest**: `email`（Email形式 / 最大255文字）、`password`（8-128文字）、`name`（1-100文字）

> クライアント側 `password` は 8-36文字（`loginCredentialsSchema`）、サーバー側 `RegisterRequest.password` は 8-128文字と範囲が異なる点に注意。

---

## マイグレーション計画

**該当なし**: 既存データなし。新規機能実装。

---

## Next Steps

✅ Phase 1 (Data Model)完了 → **API契約定義（contracts/）に進む**
