# API Contracts: ユーザー認証とログイン

**Feature**: 001-user-auth  
**Date**: 2025-10-25  
**OpenAPI Spec**: `schema/auth/openapi.yaml` v1.0.0

## 概要

この機能で使用するAPI契約を定義します。すべてのAPI仕様は既存の `schema/auth/openapi.yaml` に記載されています。

認証は **JWT（Bearer）方式** です。ログイン成功時にサーバーが JWT アクセストークンを発行し、クライアントはそれを保存して以降の保護されたリクエストに `Authorization: Bearer <JWT>` ヘッダーで付与します。セッションCookie / CSRF は使用しません。

**OpenAPI仕様ファイル**: `/schema/auth/openapi.yaml`  
**自動生成コード**: `src/adapters/generated/auth.ts` (Orval使用)  
**認証サービスベースURL**: `http://localhost:8081/api/v1`

---

## エンドポイント一覧

| Endpoint          | Method | Operation ID     | Description                        | 使用ユーザーストーリー |
| ----------------- | ------ | ---------------- | ---------------------------------- | ---------------------- |
| `/auth/register`  | POST   | `registerUser`   | ユーザー登録（今回UIなし）         | -                      |
| `/auth/login`     | POST   | `loginUser`      | ログイン（JWT発行）                | US1, US2, US5          |
| `/auth/me`        | GET    | `getCurrentUser` | 認証中ユーザーの情報を取得         | US3                    |

> **ログアウト（US4）**: JWT はステートレスなためサーバーAPIはありません。クライアント側で保存済みトークンを破棄することで実現します（`src/adapters/repositories/auth/logoutUser.ts`）。

> **`/auth/register`**: OpenAPI 仕様上は存在しますが、今回のイテレーションでは対応するUI・画面はありません。

---

## セキュリティスキーム

| Scheme       | Type | Format | 適用                              |
| ------------ | ---- | ------ | --------------------------------- |
| `bearerAuth` | http | JWT    | `Authorization: Bearer <JWT>`     |

- `bearerAuth` は `GET /auth/me` に適用されます。
- Cookie 認証・CSRF トークンは使用しません。

---

## エンドポイント詳細

### 1. POST /auth/register

**操作ID**: `registerUser`  
**説明**: ユーザー登録  
**認証**: 不要  
**備考**: 今回のイテレーションでは対応UIなし。

#### リクエスト

**Content-Type**: `application/json`

**Body Schema** (`RegisterRequest`):

```typescript
{
  email: string;    // メールアドレス (Email形式, 最大255文字)
  password: string; // パスワード (8-128文字)
  name: string;     // 氏名 (1-100文字)
}
```

**バリデーション**:

- `email`: 必須、Email形式、最大255文字
- `password`: 必須、8-128文字
- `name`: 必須、1-100文字

**例**:

```json
{
  "email": "taro@example.com",
  "password": "P@ssw0rd!",
  "name": "田中 太郎"
}
```

#### レスポンス

##### 201 Created - 登録成功

**Body Schema** (`UserResponse`):

```typescript
{
  user: {
    id: string;        // UUID
    email: string;     // Email形式
    name: string;
    createdAt: string; // ISO 8601 date-time
    updatedAt: string; // ISO 8601 date-time
  };
}
```

##### 400 Bad Request - 不正なリクエスト

**Body Schema** (`ErrorResponse`):

```typescript
{
  message: string; // エラーメッセージ
  code: string;    // エラーコード
}
```

##### 409 Conflict - メールアドレス重複

**Body Schema** (`ErrorResponse`):

```typescript
{
  message: string;
  code: string;
}
```

---

### 2. POST /auth/login

**操作ID**: `loginUser`  
**説明**: ユーザー認証と JWT アクセストークン発行  
**認証**: 不要

#### リクエスト

**Content-Type**: `application/json`

**Body Schema** (`LoginRequest`):

```typescript
{
  email: string;    // メールアドレス (Email形式)
  password: string; // パスワード
}
```

**バリデーション**:

- `email`: 必須、Email形式
- `password`: 必須

> `rememberMe` はクライアント側のみのフラグでありAPIには送信しません（トークンの保存先を選択するために使用）。

**例**:

```json
{
  "email": "taro@example.com",
  "password": "P@ssw0rd!"
}
```

#### レスポンス

##### 200 OK - ログイン成功

**Body Schema** (`LoginResponse`):

```typescript
{
  accessToken: string; // JWT アクセストークン
  tokenType: 'Bearer'; // トークン種別（固定: Bearer）
  expiresIn: number;   // トークンの有効期限（秒）
  user: {
    id: string;        // UUID
    email: string;     // Email形式
    name: string;
    createdAt: string; // ISO 8601 date-time
    updatedAt: string; // ISO 8601 date-time
  };
}
```

**例**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "taro@example.com",
    "name": "田中 太郎",
    "createdAt": "2026-05-07T10:30:00Z",
    "updatedAt": "2026-05-07T10:30:00Z"
  }
}
```

##### 400 Bad Request - 不正なリクエスト

**Body Schema** (`ErrorResponse`):

```typescript
{
  message: string; // エラーメッセージ
  code: string;    // エラーコード
}
```

##### 401 Unauthorized - 認証失敗

**Body Schema** (`ErrorResponse`):

```typescript
{
  message: string;
  code: string;
}
```

**例**:

```json
{
  "message": "認証に失敗しました",
  "code": "AUTH_FAILED"
}
```

---

### 3. GET /auth/me

**操作ID**: `getCurrentUser`  
**説明**: 認証中ユーザーの情報を取得（JWT検証付き）。  
**認証**: `bearerAuth` 必須（`Authorization: Bearer <JWT>`）

#### リクエスト

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters**: なし  
**Body**: なし

> JWT の付与は axios の interceptor が保存済みトークンから自動で行います（`src/adapters/axios.ts` / `src/adapters/authToken.ts`）。

#### レスポンス

##### 200 OK - 取得成功

**Body Schema** (`UserResponse`):

```typescript
{
  user: {
    id: string;        // UUID
    email: string;     // Email形式
    name: string;
    createdAt: string; // ISO 8601 date-time
    updatedAt: string; // ISO 8601 date-time
  };
}
```

**例**:

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "taro@example.com",
    "name": "田中 太郎",
    "createdAt": "2026-05-07T10:30:00Z",
    "updatedAt": "2026-05-07T10:30:00Z"
  }
}
```

> `expiresIn` は `/auth/me` では返りません。トークン有効期限（`AuthSession.sessionInfo.expiresAt`）はログイン時の `LoginResponse.expiresIn` から算出して保持します。

##### 401 Unauthorized - 未認証

**Body Schema** (`ErrorResponse`):

```typescript
{
  message: string;
  code: string;
}
```

---

## エラーハンドリング仕様

### レスポンス構造

すべてのエラーレスポンスは `ErrorResponse`（`{ message, code }`）で返されます。

### HTTPステータスとフロントエンド対応

| HTTP Status | 対象エンドポイント | Description        | フロントエンド対応                                 |
| ----------- | ------------------ | ------------------ | -------------------------------------------------- |
| 400         | register / login   | 不正なリクエスト   | フォームエラーとして表示                           |
| 401         | login              | 認証失敗           | フォームエラー（`INVALID_CREDENTIALS`）として表示  |
| 401         | me                 | 未認証             | ログイン画面にリダイレクト（`NO_SESSION`）         |
| 409         | register           | メールアドレス重複 | エラーメッセージ表示（今回UIなし）                 |
| N/A         | -                  | ネットワークエラー | 再試行プロンプト表示（`NETWORK_ERROR`）            |

### エラーハンドリング戦略

**階層構造**:

```
1. NetworkException (AxiosError, no response)
   ↓ catch
2. WebApiException (response.status >= 400)
   ↓ transform
3. AuthException (domain layer error)
   ↓ display
4. UI Error Message (presentations layer)
```

- 401 は `login` では `INVALID_CREDENTIALS`、`me` では `NO_SESSION` の `AuthException` に変換されます。
- 変換処理: `src/adapters/repositories/auth/utils/authErrorHandler.ts`

---

## 認証フロー図

### ログインフロー

```
[Client]                       [Auth API :8081/api/v1]
   │                                   │
   ├─ POST /auth/login ───────────────►│
   │  Body: { email, password }        │
   │                              ◄────┤ 認証チェック
   │                                   │ JWT 発行
   ◄─ 200 OK ─────────────────────────┤
   │  Body: { accessToken, tokenType,  │
   │          expiresIn, user }        │
   │                                   │
   ├─ トークンを保存                   │
   │  (localStorage / sessionStorage)  │
   │                                   │
```

### 認証ユーザー取得フロー

```
[Client]                       [Auth API :8081/api/v1]
   │                                   │
   ├─ GET /auth/me ───────────────────►│
   │  Authorization: Bearer <JWT>      │
   │                              ◄────┤ JWT 検証
   ◄─ 200 OK ─────────────────────────┤
   │  Body: { user }                   │
   │                                   │
```

### ログアウトフロー（クライアント側のみ）

```
[Client]
   │
   ├─ ログアウトボタンクリック
   │
   ├─ 保存済みトークンを破棄
   │  clearAccessToken() (localStorage / sessionStorage)
   │
   ├─ ログイン画面へ遷移
   │
```

> サーバーAPIなし。JWT はステートレスなためサーバー側のセッション無効化は行いません。

---

## Orval自動生成コード参照

### 生成コマンド

```bash
pnpm run gen:api:auth
```

### 生成ファイル

`src/adapters/generated/auth.ts`

### 生成される型とAPI関数

```typescript
// 型定義（OpenAPIスキーマから自動生成）
export interface RegisterRequest { ... }
export interface LoginRequest { ... }
export interface LoginResponse { ... }
export interface User { ... }
export interface UserResponse { ... }
export interface ErrorResponse { ... }

// API関数（operationIdから自動生成）
export const registerUser = (registerRequest: RegisterRequest) =>
  customInstance<UserResponse>({ url: `/auth/register`, method: 'POST', data: registerRequest });

export const loginUser = (loginRequest: LoginRequest) =>
  customInstance<LoginResponse>({ url: `/auth/login`, method: 'POST', data: loginRequest });

export const getCurrentUser = () =>
  customInstance<UserResponse>({ url: `/auth/me`, method: 'GET' });
```

---

## テスト用MSWハンドラー

**生成場所**: `src/adapters/generated/auth.ts`（Orval が MSW ハンドラーを自動生成）

Orval は各エンドポイントに対応する MSW ハンドラーとモックを生成します。

```typescript
// src/adapters/generated/auth.ts（抜粋・自動生成）
export const getRegisterUserMockHandler = (...) =>
  http.post('*/auth/register', async () => HttpResponse.json(getRegisterUserResponseMock(), { status: 201 }));

export const getLoginUserMockHandler = (...) =>
  http.post('*/auth/login', async () => HttpResponse.json(getLoginUserResponseMock(), { status: 200 }));

export const getGetCurrentUserMockHandler = (...) =>
  http.get('*/auth/me', async () => HttpResponse.json(getGetCurrentUserResponseMock(), { status: 200 }));

export const getAuthenticationServiceAPIMock = () => [
  getRegisterUserMockHandler(),
  getLoginUserMockHandler(),
  getGetCurrentUserMockHandler(),
];
```

- `getLoginUserResponseMock()` は `{ accessToken, tokenType: 'Bearer', expiresIn, user }` を返します。
- `getGetCurrentUserResponseMock()` は `{ user }` を返します。

---

## セキュリティ考慮事項

### JWT アクセストークン

| 項目           | 内容                                                          |
| -------------- | ------------------------------------------------------------- |
| 発行           | `POST /auth/login` 成功時に `accessToken`（JWT）を発行        |
| 送信           | `Authorization: Bearer <JWT>` ヘッダー                        |
| 有効期限       | `expiresIn`（秒）から `expiresAt` を算出してクライアントが保持 |
| 保存先         | `rememberMe` により localStorage / sessionStorage を切替      |
| 破棄           | ログアウト時にクライアント側で削除（`clearAccessToken()`）    |

### パスワードセキュリティ

- HTTPS暗号化通信（平文送信なし）
- バックエンド側でハッシュ化
- フロントエンドは検証のみ

> Cookie・CSRF は使用しません（JWT ベースのステートレス認証）。

---

## Next Steps

✅ Phase 1 (API Contracts)完了 → **クイックスタートガイド（quickstart.md）に進む**
