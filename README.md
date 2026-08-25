# Spec Kit Workshop

> **このブランチ（`002-document-management-uratachihaya`）の独自実装について**
>
> Day 2 のサンプル実装を起点に、E2E テストと独自機能を追加しています。詳細は [独自実装](#-独自実装-uratachihaya) を参照してください。
>
> - 🌙 **ダークテーマ + 切替機能** — Raycast 風の配色。選択は `localStorage` に保存
> - ⌘ **コマンドパレット（⌘K / Ctrl+K）** — どの画面からでもファイルを検索。キーボードのみで操作可能
> - 🧪 **E2E テスト 9 件を新規追加** — 文書一覧 6 件 + コマンドパレット 3 件（全 15 件パス）
> - 📓 **学習ノート** — [Day 0〜2](./docs/learning-note-day0-2.html) / [Day 3](./docs/learning-note-day3.html)

## 📖 概要

このプロジェクトは、モダンな感じを目指したReact + TypeScript + Material-UI (MUI)を使用したWebアプリケーションです。認証機能、多言語対応、テスト環境、MSW（Mock Service Worker）を使ったモックAPI、Figma MCPサーバーとの連携などの機能を含んでいます。

## ✨ 主な特徴

- 🔐 **認証システム**: 認証とセッション管理
- 🌍 **多言語対応**: 日本語・英語対応（react-i18next）
- 🧪 **包括的テスト**: Vitest + React Testing Library + Playwright E2E
- 🎭 **モックAPI**: MSW による開発時のAPIモック
- 🎨 **Figma連携**: MCP サーバーによるデザインアセット取得
- 📱 **レスポンシブデザイン**: モバイル・デスクトップ対応（そんなにできてない）

## 🚀 独自実装 (uratachihaya)

Day 2 のサンプル実装（`002-document-management-day2`）を起点に追加した機能です。

### 🌙 ダークテーマ

Raycast 風の配色でアプリ全体をダークテーマ化し、ヘッダーのボタンでライト/ダークを切り替えられるようにしました。選択したモードは `localStorage` に保存され、リロード後も維持されます。既存の言語切替（i18n）と同じ構造で実装しています。

| ファイル | 役割 |
| --- | --- |
| `src/app/providers/ThemeProvider/config.ts` | ライト/ダーク 2 つのテーマ定義 |
| `src/app/providers/ThemeProvider/context.ts` | モードと切替関数の Context |
| `src/app/providers/ThemeProvider/hooks/useThemeMode.ts` | モード取得・切替フック |

### ⌘ コマンドパレット

`⌘K`（Mac）/ `Ctrl+K`（Windows・Linux）で開く検索モーダルです。どの画面からでも呼び出せ、キーボードだけで文書を探して開けます。

- `↑` `↓` で候補を移動、`Enter` で詳細を表示、`Esc` で閉じる
- 検索は既存の `useFiles` フックを流用（新規 API なし）
- 既存レイアウトには手を入れず、`AppLayout` にオーバーレイとして追加

実装は `src/presentations/components/CommandPalette/` にあります。

### 🧪 E2E テスト

Playwright MCP で実画面を調査しながら、マークダウン仕様書 → Page Object → テストコードの順に作成しました。

| 仕様書 | テスト | 件数 |
| --- | --- | --- |
| `playwright/tests/specs/files/file-list.md` | `file-list.spec.ts` | 6 |
| `playwright/tests/specs/command-palette/command-palette.md` | `command-palette.spec.ts` | 3 |

既存の 6 件と合わせて **15 件すべてパス**します。

```bash
PLAYWRIGHT_WORKERS=2 pnpm test:e2e:chromium
```

> **Note**
> 並列ワーカー数を指定しないと、WSL 環境では Chromium の多重起動で dev サーバーが詰まりタイムアウトすることがあります。

### 🔧 本体側の改修

E2E テストの安定性のため、以下を追加しています（プロジェクト憲法 IV「`data-testid` を使用する」に準拠）。

- `AppHeader.tsx` の検索フィールドに `data-testid="searchField"`
- 検索クリアボタンに `data-testid="searchClearButton"`
  - MUI がアイコンに自動付与する `data-testid` は `NODE_ENV !== 'production'` の時のみで本番ビルドでは消えるため、明示的に付与

### 📓 学習ノート

3 日間の内容を初学者向けにまとめた HTML ドキュメントです。ブラウザで直接開けます。

- [Day 0〜2: 仕様書からアプリを作る Spec Kit ワークフロー](./docs/learning-note-day0-2.html)
- [Day 3: 誰が、なぜ、何をしたのか — E2E テストができるまで](./docs/learning-note-day3.html)

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
