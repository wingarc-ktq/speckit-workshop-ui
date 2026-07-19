# Implementation Plan: ユーザー認証とログイン

**Branch**: `001-user-auth` | **Date**: 2025-10-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-user-auth/spec.md`

## Summary

ユーザー認証とログイン機能の実装。JWT（Bearer）ベース認証を使用し、ログイン画面からの認証、保護されたページへのアクセス制御、ログアウト、Remember Me機能を提供します。既存のOpenAPI仕様（`schema/auth/openapi.yaml`）を使用し、Figmaデザイン（`/login`画面）に基づいたUIを実装します。

**技術アプローチ**:

- FigmaデザインからMUIコンポーネントを使用してログイン画面を構築
- OpenAPI仕様から自動生成されたAPI clientを使用
- MSWでAPIモックを作成してテスト環境を構築
- React Router v7のProtectedRouteパターンで認証制御
- 認証状態管理にTanStack Query使用（認証状態の確認は `/auth/me`）
- JWT アクセストークンは Remember Me の選択に応じて localStorage / sessionStorage に保存
- Axios リクエストインターセプターで `Authorization: Bearer <token>` を付与
- ログアウトはクライアント側でトークン破棄 + クエリキャッシュのクリア
- 単一の `/api/v1` オリジン経由で auth（:8081）/ files（:8082）にルーティング（開発時は Vite dev proxy、本番はゲートウェイ）

## Technical Context

**Language/Version**: TypeScript 5.x + React 19  
**Primary Dependencies**:

- React 19 (UI framework)
- TypeScript 5.x (型安全性)
- Material-UI v6+ (UIコンポーネントライブラリ)
- React Router v7 (ルーティング・保護されたルート)
- TanStack Query v5 (サーバー状態管理)
- Axios (HTTPクライアント、リクエストインターセプターで Bearer トークン付与)
- React Hook Form + Zod (フォーム管理・バリデーション)
- Orval (OpenAPIからTypeScriptコード生成)
- MSW (Mock Service Worker - APIモック)

**Storage**: ブラウザの localStorage / sessionStorage（JWT アクセストークン、Remember Me により保存先を切替）  
**Testing**:

- Vitest + React Testing Library (単体テスト・コンポーネントテスト)
- Playwright (E2Eテスト)
- MSW (APIモック)

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - 最新2バージョン)  
**Project Type**: Single page web application (frontend only)  
**Performance Goals**:

- ログインAPI応答: 3秒以内
- 画面初期表示: 2秒以内
- ページ遷移: 500ms以内

**Constraints**:

- セキュリティ: JWT（Bearer）認証、トークンの署名・検証・有効期限管理はバックエンドで担保
- アクセシビリティ: WCAG 2.1 AA準拠
- レスポンシブ対応: モバイル（360px〜）、タブレット、デスクトップ

**Scale/Scope**:

- 想定ユーザー数: 1,000人規模
- 同時接続: 100接続程度
- 画面数: 1画面（ログイン）+ 認証フロー改修

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Principle I: TypeScript Strict Mode (NON-NEGOTIABLE)

- **Status**: PASS
- **Details**: strict mode有効、すべての型定義明示

### ✅ Principle II: Component Architecture

- **Status**: PASS
- **Details**: 関数コンポーネント使用、Props型定義、独立テスト可能

### ✅ Principle III: Material-UI First

- **Status**: PASS
- **Details**: MUIコンポーネント（TextField, Button, Checkbox, Typography）を使用

### ✅ Principle IV: Test-Driven Development

- **Status**: PASS
- **Details**:
  - 単体テスト: フォームバリデーション、カスタムフック
  - コンポーネントテスト: LoginPageコンポーネント
  - E2Eテスト: ログイン・ログアウト・リダイレクトフロー（Playwright）

### ✅ Principle V: API-First with OpenAPI

- **Status**: PASS
- **Details**: `schema/auth/openapi.yaml`既存、Orvalで自動生成

### ✅ Principle VI: Clean Architecture & Separation of Concerns

- **Status**: PASS
- **Details**:
  - Domain: 認証モデル、エラー定義
  - Adapters: API client、Repository
  - Application: 認証プロバイダー、ProtectedRoute
  - Presentation: LoginPage、フォームコンポーネント

### ✅ Principle VII: Accessibility & Responsive Design (NON-NEGOTIABLE)

- **Status**: PASS
- **Details**:
  - MUIのアクセシビリティ機能活用
  - aria-label、フォームラベル適切に設定
  - キーボードナビゲーション対応
  - レスポンシブレイアウト（Figmaデザイン基準）

**Constitution Check Result**: ✅ **ALL GATES PASSED** - Phase 0に進行可能

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md              # このファイル
├── spec.md              # 機能仕様書
├── research.md          # Phase 0: 技術調査結果
├── data-model.md        # Phase 1: データモデル定義
├── quickstart.md        # Phase 1: 実装ガイド
├── contracts/           # Phase 1: API契約定義（既存OpenAPI参照）
│   └── openapi-ref.md   # 既存schema/auth/openapi.yamlへの参照
├── checklists/
│   └── requirements.md  # 要件品質チェックリスト
└── tasks.md             # Phase 2: タスクリスト（/speckit.tasksで生成）
```

### Source Code (repository root)

```text
src/
├── domain/                          # ドメイン層
│   ├── models/
│   │   └── auth/
│   │       ├── User.ts              # ユーザーモデル（{ id, email, name }）
│   │       ├── AuthToken.ts         # JWT トークン保存モデル（localStorage/sessionStorage）
│   │       └── LoginForm.ts         # ログインフォームモデル
│   ├── errors/
│   │   └── AuthException.ts         # 認証エラー（既存WebApiException拡張）
│   └── constants/
│       └── authConstants.ts         # 認証関連定数
│
├── adapters/                        # アダプター層
│   ├── generated/
│   │   └── auth.ts                  # Orval自動生成（schema/auth/openapi.yamlから）
│   ├── repositories/
│   │   └── auth/
│   │       ├── AuthRepository.ts           # 認証リポジトリインターフェース
│   │       ├── AuthRepositoryImpl.ts       # 認証リポジトリ実装
│   │       └── __tests__/
│   │           └── AuthRepositoryImpl.test.ts
│   └── mocks/
│       └── handlers/
│           └── authHandlers.ts      # MSWハンドラー（認証API）
│
├── app/                             # アプリケーション層
│   ├── providers/
│   │   └── AuthProvider/
│   │       ├── AuthProvider.tsx     # 認証プロバイダー
│   │       ├── AuthContext.ts       # 認証コンテキスト
│   │       ├── useAuth.ts           # 認証カスタムフック
│   │       ├── index.ts
│   │       └── __tests__/
│   │           └── useAuth.test.ts
│   └── router/
│       ├── components/
│       │   ├── ProtectedRoute.tsx   # 保護されたルート（既存、改修）
│       │   └── __tests__/
│       │       └── ProtectedRoute.test.tsx
│       └── routes.tsx                # ルート定義（既存、改修）
│
├── presentations/                   # プレゼンテーション層
│   ├── pages/
│   │   └── LoginPage/
│   │       ├── LoginPage.tsx        # ログインページ
│   │       ├── styled.tsx           # スタイル定義（MUI styled）
│   │       ├── index.ts
│   │       ├── hooks/
│   │       │   └── useLoginForm.ts  # ログインフォームロジック
│   │       └── __tests__/
│   │           ├── LoginPage.test.tsx
│   │           └── useLoginForm.test.ts
│   ├── components/
│   │   └── forms/
│   │       ├── LoginForm/
│   │       │   ├── LoginForm.tsx           # ログインフォームコンポーネント
│   │       │   ├── styled.tsx
│   │       │   ├── index.ts
│   │       │   └── __tests__/
│   │       │       └── LoginForm.test.tsx
│   │       └── RememberMeCheckbox/
│   │           ├── RememberMeCheckbox.tsx  # トークン保存先切替（localStorage/sessionStorage）チェックボックス
│   │           ├── index.ts
│   │           └── __tests__/
│   │               └── RememberMeCheckbox.test.tsx
│   └── layouts/
│       └── AppLayout/
│           └── components/
│               └── AppHeader/
│                   └── AppHeader.tsx # ヘッダー（ログアウトボタン追加）
│
├── i18n/                            # 国際化
│   └── locales/
│       ├── ja/
│       │   └── auth.json            # 認証関連の翻訳（日本語）
│       └── en/
│           └── auth.json            # 認証関連の翻訳（英語）
│
└── __fixtures__/
    └── auth.ts                      # テスト用フィクスチャ（既存、拡張）

playwright/                          # E2Eテスト
├── tests/
│   ├── pages/
│   │   └── LoginPage.ts             # LoginPage Page Object
│   ├── fixtures/
│   │   └── testUsers.ts             # テストユーザーデータ
│   └── specs/
│       └── auth/
│           ├── login.md     　　　   # ログインE2Eテスト仕様
│           └── login.spec.ts        # ログインE2Eテスト実装
└── playwright.config.ts             # Playwright設定（既存）

schema/
└── auth/
    └── openapi.yaml                 # OpenAPI仕様（既存）
```

**Structure Decision**: Web application (frontend only)構造を採用。Clean Architectureに基づき、domain/adapters/app/presentationsの4層に分離。既存のプロジェクト構造を維持しながら、認証機能を追加。

## Complexity Tracking

> **該当なし**: Constitution Checkですべてのゲートをパス。違反なし。

---

## Implementation Status

### ✅ Phase 0: Research & Planning (完了)

- ✅ Technical research completed (`research.md`)
- ✅ 8 technical decisions documented
- ✅ Constitution Check passed (7/7 principles)

### ✅ Phase 1: Supporting Artifacts (完了)

- ✅ Data model defined (`data-model.md`)
  - 6 entities documented (User, LoginFormData, LoginRequest, LoginResponse, UserResponse, RegisterRequest, AuthError)
  - TypeScript interfaces with Zod schemas
  - Entity relationships and data flows
  - Validation rules and security considerations
- ✅ API contracts documented (`contracts/openapi-ref.md`)
  - 3 endpoints detailed (POST /auth/login, GET /auth/me, POST /auth/register)
  - Error handling specifications
  - MSW mock handler examples
  - Security considerations (JWT / Bearer token)
- ✅ Quickstart guide created (`quickstart.md`)
  - Step-by-step implementation guide
  - 40+ files to implement across 7 phases
  - Development commands and troubleshooting
  - Constitution compliance verification
- ✅ Agent context updated
  - GitHub Copilot instructions updated
  - Technologies documented (React Hook Form, Zod, TanStack Query)

### ⏳ Phase 2: Task Generation (次のステップ)

### ✅ Phase 2: Task Generation (完了)

- ✅ Task list generated (`tasks.md`)
  - 48 tasks organized across 10 phases
  - Mapped to User Stories 1-5 (P1-P3 priorities)
  - Foundation phase (9 tasks) marked as BLOCKING
  - US1 (6 tasks) marked as MVP target
  - E2E testing phase (6 tasks) for comprehensive coverage
  - Polish and final integration phases included

**Task Summary**:

- **Total**: 48 tasks
- **Critical Path**: Setup → Foundation (9) → US1 MVP (6) → US3 (4) → US4 (3) → E2E → Final
- **Parallel Opportunities**: 15+ tasks can run in parallel
- **Estimated Time**: 3-5 days for single developer

---

## Summary

**Phase 1-2完了**: すべての計画ドキュメントが作成され、実装準備が完全に整いました。

**成果物**:

1. ✅ `research.md` - 8つの技術決定とその根拠
2. ✅ `data-model.md` - 6つのエンティティとバリデーション仕様
3. ✅ `contracts/openapi-ref.md` - 3つのAPIエンドポイント詳細
4. ✅ `quickstart.md` - 40+ファイルの実装ガイド
5. ✅ `.github/copilot-instructions.md` - Agentコンテキスト更新
6. ✅ `tasks.md` - 48タスクの実装計画

**次のステップ**: Phase 2 (Foundational) のタスク実装を開始します。T003からT011までの9タスクを完了させることで、すべてのUser Storyの実装基盤が整います。
