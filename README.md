# Spec Kit Workshop

## 📖 概要

このプロジェクトは、モダンな感じを目指したReact + TypeScript + Material-UI (MUI)を使用したWebアプリケーションです。認証機能、多言語対応、テスト環境、MSW（Mock Service Worker）を使ったモックAPI、Figma MCPサーバーとの連携などの機能を含んでいます。

## ✨ 主な特徴

- 🔐 **認証システム**: 認証とセッション管理
- 🌍 **多言語対応**: 日本語・英語対応（react-i18next）
- 🧪 **包括的テスト**: Vitest + React Testing Library + Playwright E2E
- 🎭 **モックAPI**: MSW による開発時のAPIモック
- 🎨 **Figma連携**: MCP サーバーによるデザインアセット取得
- 📱 **レスポンシブデザイン**: モバイル・デスクトップ対応（そんなにできてない）

## 🛠 技術スタック

- **Frontend**: React 19, TypeScript
- **UI Framework**: Material-UI (MUI)
- **Build Tool**: Vite
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router
- **Testing**: Vitest, React Testing Library, Playwright
- **Mocking**: MSW (Mock Service Worker)
- **Internationalization**: react-i18next
- **Code Generation**: Orval (OpenAPI)
- **Package Manager**: pnpm

## 🚀 クイックスタート

### 前提条件

- Node.js (v22) ※プロジェクトにより自動管理
- pnpm (v10.12.4) ※プロジェクトにより自動管理

> **バージョン管理**:
>
> - **Node.js**: `.npmrc` により v22.17.0 が自動ダウンロード・使用
> - **pnpm**: `packageManager` フィールドにより v10.12.4 を推奨
>
> 開発者が手動でバージョンを管理する必要はありません。

### インストールと実行

```bash
# 依存関係のインストール
pnpm install

# E2Eテスト用ブラウザのインストール（初回のみ）
pnpm test:e2e:install

# 環境変数の設定（オプション）
cp .env.sample .env
# .envファイルを編集してAPI URLなどを設定

# OpenAPIスキーマからコードとモックを生成（初回またはスキーマ更新時）
pnpm gen:api

# 開発サーバーの起動
pnpm dev
```

アプリケーションは http://localhost:5173 で起動します。

## 📁 プロジェクト構成

```
src/
├── adapters/          # 外部サービスとの接続層
│   ├── axios.ts       # HTTP クライアント設定
│   ├── generated/     # OpenAPI から生成されたコード
│   ├── mocks/         # MSW モック定義
│   └── repositories/  # データアクセス層
├── app/               # アプリケーション設定
│   ├── providers/     # Context Providers
│   ├── router/        # ルーティング設定
│   └── types/         # アプリケーション型定義
├── domain/            # ビジネスロジック層
│   ├── constants/     # 定数定義
│   ├── errors/        # エラー型定義
│   ├── models/        # ドメインモデル
│   └── utils/         # ユーティリティ関数
├── i18n/              # 国際化設定
│   ├── config.ts      # i18n 設定
│   ├── hooks/         # 翻訳フック
│   └── locales/       # 言語ファイル
└── presentations/     # プレゼンテーション層
    ├── components/    # 共通コンポーネント
    ├── hooks/         # カスタムフック
    ├── layouts/       # レイアウトコンポーネント
    └── pages/         # ページコンポーネント
```

### アーキテクチャの特徴

- **Clean Architecture**: ドメイン駆動設計の原則に基づいた層分離
- **Repository Pattern**: データアクセスの抽象化
- **Provider Pattern**: 依存性注入とコンテキスト管理
- **Custom Hooks**: ビジネスロジックの再利用性

## 🔧 主要機能

### 認証システム

- JWT ベースの認証
- セッション管理と自動更新
- ログイン/ログアウト機能
- 認証状態に基づくルーティング

### 多言語対応

- 日本語・英語対応
- react-i18next による動的言語切替
- 型安全な翻訳キー

### API通信

- Axios ベースのHTTPクライアント
- OpenAPI スキーマからの自動生成
- エラーハンドリングとリトライ機能

## 🧪 テスト

### テスト実行

```bash
# 単体テスト（Vitest）
pnpm test                # 全テスト実行
pnpm test:watch          # ウォッチモード
pnpm test:coverage       # カバレッジ付き実行
pnpm test:related src/path/to/changed-file.tsx  # 関連テストのみ実行

# E2Eテスト（Playwright）
pnpm test:e2e:install    # ブラウザインストール（初回のみ）
pnpm test:e2e            # 全E2Eテスト実行
pnpm test:e2e:ui         # インタラクティブモード
pnpm test:e2e:debug      # デバッグモード
```

> **E2Eテストの詳細**: `playwright/README.md` を参照してください。
>
> **初回実行時**: `pnpm test:e2e:install` でPlaywrightブラウザ（Chromium、Firefox、WebKit）をインストールしてください。

### テスト戦略

- **単体テスト**: コンポーネント、フック、ユーティリティ関数のテスト
- **統合テスト**: ページレベルでのユーザーインタラクションテスト
- **E2Eテスト**: Playwright による実際のブラウザでのエンドツーエンドテスト
- **関連テスト実行**: `test:related` コマンドによる効率的なテスト実行
  - 変更されたファイルに関連するテストファイルのみを自動検出・実行
  - CI/CD環境での高速なフィードバックループを実現
  - 並列実行（shard）によるテスト時間の短縮
- **モック戦略**:
  - MSW による API レスポンスのモック
  - Repository レベルでの部分的なモック
  - テストユーティリティによる共通化

### テスト構成

- `src/__fixtures__/`: テスト用のヘルパーとモックデータ
- `src/__tests__/`: アプリケーションレベルのテスト
- 各ディレクトリの `__tests__/`: コンポーネント・フック単体のテスト

## 🔌 MCP (Model Context Protocol) 連携

このプロジェクトでは、MCP サーバーを使用して AI ツールと連携し、開発を効率化できます。

### 設定ファイル

プロジェクトでは、各 AI ツールに対応した MCP 設定ファイルを使用します：

- **`.mcp.json`**: Claude Code プロジェクト単位の MCP 設定
- **`.vscode/mcp.json`**: VSCode / GitHub Copilot 用の MCP 設定
- **`.cline/mcp.json`**: Cline プロジェクト単位の MCP 設定
- **`.gemini/settings.json`**: Gemini CLI プロジェクト単位の MCP 設定
- **`.agents/mcp_config.json`**: Antigravity (agy) プロジェクト単位の MCP 設定

これらのファイルは同じ MCP サーバーを設定していますが、異なるツールで使用されます。

### 利用可能なMCPサーバー

#### 1. Figma MCP サーバー

Figma デザインファイルから直接アセットを取得できます。

**セットアップ:**

Figma の Personal Access Token を設定に追加してください：

```json
{
  "servers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

**利用方法:**

AI ツールで Figma デザインからコンポーネントを実装：

```
Figma URL: https://www.figma.com/file/YOUR_FILE_KEY/...

このFigmaデザインを参考に、LoginButtonコンポーネントを実装してください。
- styled.tsx にスタイル定義をまとめる
- Material-UIベースで実装
- レスポンシブ対応
- Figmaの色・サイズ・余白を反映
```

**利用可能な機能:**

- Figma ファイルのレイアウト情報取得
- Figma からの画像・アイコンダウンロード

#### 2. Playwright MCP サーバー

E2Eテストの自動生成とブラウザ操作を支援します。

**セットアップ:**

既に設定済みです。`.vscode/playwright-config.json` で設定をカスタマイズできます。

```json
{
  "servers": {
    "playwright": {
      "type": "stdio",
      "command": "pnpm",
      "args": [
        "dlx",
        "@playwright/mcp@latest",
        "--config",
        ".vscode/playwright-config.json"
      ]
    }
  }
}
```

**利用方法:**

AI ツールで Playwright テストを生成・実行：

```
ログインページのE2Eテストを作成してください。
- メールとパスワードを入力
- ログインボタンをクリック
- ダッシュボードにリダイレクトされることを確認
```

**利用可能な機能:**

- Playwright テストコードの自動生成
- ブラウザ操作のスクリプト作成支援
- Page Object Model パターンの実装支援

## 🔧 開発ツール詳細

### MSW (Mock Service Worker) セットアップ

開発時のAPIモックを使用するための設定：

```bash
# MSWの初期化（公開ディレクトリにService Workerファイルを生成）
pnpm msw:init
```

このコマンドにより `public/mockServiceWorker.js` が生成され、ブラウザでのAPIモックが有効になります。

### 利用可能なスクリプト

```bash
pnpm dev           # 開発サーバー起動
pnpm build         # プロダクションビルド
pnpm type-check    # 型チェック
pnpm lint          # ESLint実行
pnpm format:check  # Prettierによるフォーマットチェック（チェックのみ）
pnpm format:fix    # Prettierによるコードフォーマット（コードを自動整形）
pnpm preview       # ビルド結果をプレビュー
pnpm test          # テスト実行
pnpm test:run      # watch モードなしで実行
pnpm test:coverage # カバレッジ付きテスト
pnpm test:related  # 関連テストのみ実行（指定ファイルに関連するテストを検出）
pnpm gen:api       # OpenAPIからコードとモックを生成
pnpm msw:init      # MSW Service Worker初期化
```

### コード生成 (Orval)

OpenAPI スキーマからAPIクライアントとMSWモックを自動生成：

```bash
# OpenAPI スキーマから型とAPIクライアント、MSWモックを生成
pnpm gen:api
```

Orvalにより以下が自動生成されます：

- **APIクライアント**: `src/adapters/generated/` に型安全なAPIクライアント
- **TypeScript型定義**: OpenAPIスキーマに基づいた型定義
- **MSWモック**: `src/adapters/mocks/handlers/` にモックハンドラー

設定ファイル: `schema/orval.config.ts`

### 環境変数設定

プロジェクトでは環境変数を使用してAPI URLなどを設定できます：

```bash
# .env.sampleをコピーして.envファイルを作成
cp .env.sample .env
```

**利用可能な環境変数:**

- `VITE_API_BASE_URL`: API のベースURL（デフォルト: `http://localhost:3000/api`）

**環境別の設定例:**

```bash
# 開発環境
VITE_API_BASE_URL=http://localhost:3000/api

# 本番環境
VITE_API_BASE_URL=https://api.your-domain.com/api

# ステージング環境
VITE_API_BASE_URL=https://staging-api.your-domain.com/api
```

環境変数は自動的にAxiosのbaseURLとMSWモックハンドラーの両方に適用されます。

### 開発環境の設定

- **ESLint**: コード品質の維持
- **TypeScript**: 型安全性の確保
- **Vite**: 高速な開発体験
- **pnpm**: 効率的なパッケージ管理
