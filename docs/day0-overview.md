# Day 0: Speckit開発ワークフロー全体像

## 🎯 この資料について

この資料は、3日間のインターンシップで使用する **Speckit** という開発ワークフローの全体像を理解するためのガイドです。Day 1〜3の詳細な実習に入る前に、まずこの資料で全体の流れと各ツールの役割を把握してください。

**読了目安**: 10分

**この資料でわかること**

- Speckitとは何か、なぜ使うのか
- 7つのスキルコマンドの役割と使い方
- 自然言語の要求から動作するコードまでの流れ
- 3日間のワークショップでどう進めるか

---

## 📖 Spec Kitとは

**Spec Kit** は、AI支援による仕様駆動開発ワークフローシステムです。

従来のAI開発支援ツールは「コードを書く」ことに特化していましたが、Spec Kitは **仕様の作成 → 設計 → タスク分解 → 実装 → テスト** という開発ライフサイクル全体をオーケストレーションします。

### 🌟 Spec Kitの特徴

1. **仕様駆動**: すべての起点は仕様書（spec.md）。仕様がコード品質を決定する
2. **AIオーケストレーション**: 7つの専用スキルコマンドで段階的に開発を進める
3. **型安全な自動生成**: OpenAPI → TypeScript → テストまで一貫した型安全性
4. **品質の制約**: プロジェクト憲法（Constitution）による開発原則の強制
5. **テンプレート**: 標準化されたMarkdownテンプレートで一貫性を保つ

### なぜSpec Kit?

## 従来の開発では「コードを書く」ことに時間がかかっていましたが、AI時代では **「何を作るかを明確にする」** ことが最も重要になります。Spec Kitは、仕様を正しく定義すれば、設計・実装・テストを効率的に生成できる仕組みを提供します。

## 🏗 プロジェクト憲法（Constitution）

Spec Kitプロジェクトには、すべての機能開発で守るべき **原則** があります。これを「プロジェクト憲法」と呼びます。

**主要な原則**

- TypeScript strict mode（必須）
- Functional React components with Hooks
- Material-UI first approach
- Test-Driven Development
- API-first with OpenAPI specifications
- Clean Architecture（層分離）
- WCAG 2.1 AA accessibility compliance

この憲法により、チーム全体で一貫した品質を保ちます。

---

## 🛠 主要なSpec Kit コマンド

Spec Kitでは、以下の専用コマンドを順番に使って開発を進めます。
このワークショップでは、実際に使用する **4つのコマンド** を中心に説明します。

### 1️⃣ `/speckit.specify` - 仕様書作成

**目的**: 自然言語の機能説明から、構造化された仕様書を生成する

**入力**: ユーザーの機能説明（日本語でOK）

**出力**: `specs/[番号-機能名]/spec.md`

**使用例**:

```
/speckit.specify

ユーザー認証機能を作りたいです。
- メール・パスワードでログイン
- セッション管理
- 保護されたルート
```

**生成される内容**:

- ユーザーストーリー（優先度付き: P1, P2, P3...）
- 受け入れシナリオ（Gherkin形式）
- 要件詳細
- エッジケース
- キーエンティティ

**いつ使う**: 新機能を作り始めるとき（最初のステップ）

---

### 2️⃣ `/speckit.clarify` - 要件の明確化

**目的**: 仕様書の曖昧な部分を特定し、質問を通じて解決する

**入力**: 現在の `spec.md`

**出力**: 明確化された `spec.md`

**使用例**:

```
/speckit.clarify
ログインはメールアドレスとパスワードで行います。
```

**処理内容**:

- 仕様書をスキャンして不完全・曖昧な箇所を検出
- 修正内容を仕様書に反映

**いつ使う**: `/speckit.plan` の前に、仕様の抜け漏れを防ぎたいとき（今回は使用しません）

---

### 3️⃣ `/speckit.plan` - 実装計画作成

**目的**: 仕様書を元に、技術的な実装計画を立てる

**入力**: `spec.md` + α

**出力**:

- `plan.md` - 実装計画書
- `research.md` - 技術調査結果
- `data-model.md` - データモデル定義
- `quickstart.md` - 統合ガイド

**使用例**:

```
/speckit.plan
実装プランを作成してください。

仕様書: specs/002-document-management/spec.md
OpenAPI: schema/files/openapi.yaml
Figma URL: https://figma.com/file/...

```

**処理フェーズ**:

1. **Phase 0: 調査** - 不明点の解決、技術選定
2. **Phase 1: 設計** - エンティティ抽出、API設計、憲法検証

**いつ使う**: Day 1のデザイン作成後、実装に入る前

---

### 4️⃣ `/speckit.tasks` - タスク分解

**目的**: 実装計画を、実行可能な具体的タスクに分解する

**入力**:

- `spec.md`（ユーザーストーリー）
- `plan.md`（技術アプローチ）
- `data-model.md`（エンティティ）
- `contracts/`（API仕様）

**出力**: `tasks.md` - 50〜150個のタスクリスト

**タスクの構成**:

```markdown
- [ ] T012 [P] [US1] Create ログインフォームスキーマ in src/presentations/pages/LoginPage/schemas/loginFormSchema.ts
- [ ] T013 [US1] Implement useAuth hook in src/presentations/hooks/useAuth.ts
- [ ] T014 [P] [US1] Create LoginPage component in src/presentations/pages/LoginPage/LoginPage.tsx
```

**フェーズ分け**:

- **Phase 1**: セットアップ（プロジェクト初期化）
- **Phase 2**: 基礎（ブロッキングとなる前提条件）
- **Phase 3+**: ユーザーストーリーごと（優先度順）
- **Final Phase**: 磨き上げ・横断的関心事

**並列実行マーク**: `[P]` がついたタスクは並列実行可能

**いつ使う**: Day 2の実装開始前

---

### 5️⃣ `/speckit.implement` - コード生成と実装

**目的**: タスクリストを実行し、実際のコードを生成する

**入力**:

- `tasks.md`（タスクリスト）
- `plan.md`（アーキテクチャ）
- すべての先行成果物
- チェックリスト状態

**実行モード**:

**モード1: 特定タスクの実装**

```
/speckit.implement

T001を実装してください。
```

**モード2: フェーズ単位の実装**

```
/speckit.implement

Phase 1の全タスクを実装してください。
```

**モード3: Figma連携**

```
/speckit.implement

T005を実装してください。
以下のFigma URLからデザイン情報を参照してください。

Figma URL: https://figma.com/design/...
```

**生成されるもの**:

- Reactコンポーネント（TypeScript）
- 単体テスト（Vitest + React Testing Library）
- 統合APIクライアント（OpenAPIから生成）
- MSWモックハンドラー
- 完全に動作する機能

**憲法チェック**: すべての生成コードはプロジェクト憲法に準拠しているか自動検証される

**いつ使う**: Day 2の実装フェーズ全体

---

## 🔄 ワークショップで使うワークフローの流れ

```
自然言語の機能説明
    ↓
/speckit.specify → spec.md（仕様書）は作成ずみ
    ↓
/speckit.plan → plan.md + research.md + data-model.md + contracts/
    ↓
/speckit.tasks → tasks.md（タスク分解）
    ↓
/speckit.implement → 生成されたコード + テスト
    ↓
動作する機能 ✅
```

---

## 📂 プロジェクト構成の例

実際の機能開発では、以下のようなファイル構成になります。

```
specs/001-user-auth/              # 機能ディレクトリ
├── spec.md                       # 仕様書（ユーザーストーリー）
├── plan.md                       # 実装計画（アーキテクチャ）
├── research.md                   # 技術調査結果
├── data-model.md                 # エンティティ定義
├── tasks.md                      # タスク分解
├── quickstart.md                 # 統合ガイド
├── checklists/
│   └── requirements.md           # 要件品質チェックリスト
└── contracts/
    └── openapi-ref.md            # API仕様
```

---

## 🔍 実例: ユーザー認証機能

このプロジェクトには `specs/001-user-auth/` に実例があります。

**実装された機能**:

- メール・パスワードでのログイン
- TanStack Queryによるセッション管理
- React Routerによる保護されたルート
- 自動セッション検証
- MSW APIモック
- フルE2Eテストカバレッジ

**ワークフロー概要**:

1. **spec.md** で認証要件を定義（各ストーリーに3つの受け入れシナリオ）
2. **plan.md** でTanStack Query + React Routerを技術選定
3. **tasks.md** で40以上の具体的タスクに分解（セットアップ → 基礎 → ユーザーストーリー）
4. **implement** ですべてのコンポーネント、フック、リポジトリ、テストを生成
5. **完成した機能** をレビュー・デプロイ

このように、仕様から実装まで一貫したワークフローで進められます。

---

## 🧰 サポートインフラ

Spec Kitは以下の技術基盤と統合されています。

### OpenAPI駆動開発

- すべてのAPIは `schema/*/openapi.yaml` で定義
- Orvalが自動生成:
  - TypeScript型定義
  - APIクライアント関数
  - MSWモックハンドラー
- コマンド: `pnpm gen:api`

### Mock Service Worker (MSW)

- 開発・テスト時のAPIモック提供
- OpenAPIから自動生成されたハンドラー
- 場所: `src/adapters/mocks/handlers/`
- ネットワークコール不要で開発可能

### 型安全性

- OpenAPI → TypeScript（Orvalによる）
- Zodスキーマによるフォーム検証
- i18n型安全翻訳

### テスト戦略

- **単体テスト**: Vitest + React Testing Library
- **E2Eテスト**: Playwright + Page Object Model
- **テスト仕様**: Markdownファースト、その後実装

---

## 📅 3日間ワークショップの流れ

### Day 1: デザインフェーズ（Spec → Plan）

**ゴール**: Figmaデザイン + 実装計画書の作成

1. **午前**: spec.mdを読解し、MVP機能を特定
2. **午前後半**: Figma Makeで仕様からUIデザイン生成
3. **午後**: Figmaで手動デザイン調整
4. **夕方**: `/speckit.plan` で実装計画を作成

**成果物**: Figmaデザイン + plan.md

### Day 2: 実装フェーズ（Plan → Code）

**ゴール**: 動作するReactコンポーネント（MVP機能）

1. **午前**: plan.mdとプロジェクト構成を確認
2. **午前後半**: `/speckit.tasks` でタスク分解
3. **昼**: `/speckit.implement` でコンポーネント生成開始
4. **午後**: 生成コードの調整、型エラー修正
5. **夕方**: テスト実行、デバッグ

**成果物**: 動作するコンポーネント + テスト

### Day 3: テストフェーズ（E2E with Playwright）

**ゴール**: E2Eテストスイート、包括的テストカバレッジ

1. **午前**: テスト仕様書作成（Markdown）
2. **午前後半**: Playwright MCPでページ構造分析
3. **昼**: 仕様からE2Eテスト生成
4. **午後**: テスト実行と調整
5. **夕方**: テストレポート生成、機能デモ

**成果物**: E2Eテストスイート

---

## 💡 学習のための6つの原則

Spec Kitを使った開発で覚えておくべき原則:

### 1. 仕様駆動

すべては仕様から始まる。仕様の品質が実装の品質を決定する。

### 2. 段階的かつ独立

各ユーザーストーリーは独立して実装・テスト可能。P1（MVP）から始める。

### 3. 制約ベース

プロジェクト憲法は絶対。すべてのコードは準拠必須。明示的な修正なしに例外なし。

### 4. 型安全性の連鎖

OpenAPI仕様で定義 → TypeScript型に自動変換 → コンポーネントで型チェック → テストで検証。各段階で型が保証され、実行時エラーを防ぐ。

### 5. テストファースト

チェックリストが仕様を検証。テストがコードを検証。テストされていないコードはマージしない。

### 6. AI支援、人間主導

Spec Kitコマンドが構造とコードを生成するが、最終判断は開発者が行う。

---

## 🚀 はじめの一歩

この資料で全体像を把握したら、次は [Day 1: Figmaでデザイン作成](./day1-design.md) に進みましょう。

**環境準備チェックリスト**:

- [ ] Figma for Education アカウント取得
- [ ] GitHub Copilot または Claude Codeにアクセス可能
- [ ] このリポジトリをクローン済み
- [ ] `pnpm install` で依存関係インストール済み

**Day 1の予習**:

- `specs/002-document-management/spec.md` に目を通す
- どんな機能を作るか把握しておく
- Figmaアカウントでログインできることを確認

**参考リンク**:

- [プロジェクトREADME](../README.md) - 技術スタック詳細
- [Playwright E2E README](../playwright/README.md) - テスト戦略
- [Material UI公式](https://mui.com/) - UIコンポーネント

---

## 📚 参考: その他のSpec Kitコマンド

ワークショップでは使用しませんが、実際のプロジェクトでは以下のコマンドも利用できます。

### `/speckit.checklist` - 要件品質検証

**目的**: 仕様書を「コード」として扱い、品質をチェックする

**出力**: `checklists/requirements.md` - 要件のチェックリスト

**チェック観点**: 完全性、明確性、一貫性、カバレッジ

**使用タイミング**: `/speckit.implement` 実行時に自動的に使われる

### `/speckit.analyze` - 一貫性分析

**目的**: spec.md、plan.md、tasks.mdの3つの成果物間の整合性を分析する

**出力**: 構造化された分析レポート

**検出内容**: 重複タスク、カバーされていない要件、憲法違反、タスク順序の問題など

**特徴**: 破壊的変更なし（純粋な分析ツール）

---

## 🎓 まとめ

Spec Kitは、仕様書を起点として設計・実装・テストを段階的に進める開発ワークフローシステムです。5つの主要コマンドを順番に使うことで、AI支援により効率的かつ品質の高い開発が可能になります。

3日間のワークショップを通じて、この新しい開発スタイルを体験してください。

**次のステップ**: [Day 1: Figmaでデザイン作成](./day1-design.md) へ進む →
