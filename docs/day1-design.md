# Day 1: Figmaでデザイン作成

## 🎯 今日のゴール

spec.mdを読み解き、Figma MakeでUIデザインを作成する。

**成果物**

- 文書管理システムのFigmaデザイン（MVP機能）
- 実装計画書（plan.md）

---

## ⏰ タイムテーブル（6時間）

| 時間        | 内容                         |
| ----------- | ---------------------------- |
| 10:00-10:30 | オリエンテーション・環境確認 |
| 10:30-11:30 | spec.md読解・機能整理        |
| 11:30-12:30 | Figma Makeでデザイン生成     |
| 12:30-13:30 | 休憩                         |
| 13:30-15:00 | Figmaでデザイン調整          |
| 15:00-15:30 | デザイン共有・振り返り       |
| 15:30-16:30 | speckit.planで計画作成       |
| 16:30-17:00 | 全体振り返り                 |

---

## 📋 事前準備チェックリスト

### 必要なツール

- [ ] Figma for Education アカウント
- [ ] GitHub Copilot または Claude Code
- [ ] [Node.js](https://nodejs.org/) (v18以上)
- [ ] [pnpm](https://pnpm.io/installation)

### プロジェクトのセットアップ

以下のコマンドを実行してください。

```bash
# リポジトリのクローンと依存関係のインストール
git clone git@github.com:wingarc-ktq/speckit-workshop-ui.git
cd speckit-workshop-ui
pnpm install
pnpm test:e2e:install
cp .env.sample .env
pnpm gen:api

# 作業ブランチと仕様書ディレクトリの作成
# <your-name> は今の年月と自分の名前に置き換える
git checkout -b 002-document-management-<your-name>
mkdir specs/002-document-management-<your-name>
mv specs/002-document-management/* specs/002-document-management-<your-name>
rmdir specs/002-document-management
```

`.vscode/mcp.json` を開いて、必要なMCPサーバーが起動していることを確認してください。

---

## 1️⃣ spec.mdを読み解く（1時間）

### 1.1 spec.mdの構造を理解する

`specs/002-document-management/spec.md` を開いて、以下のセクションを確認します。

**重要なセクション**

- **User Scenarios & Testing**: ユーザーストーリーと受け入れ条件
- **Requirements**: 機能要件の詳細
- **Key Entities**: データ構造

### 1.2 MVP機能を特定する

🎯マークがついているのがMVP（Day 1で必ず作る機能）です。

| Priority | User Story | 概要                             |
| -------- | ---------- | -------------------------------- |
| P1 🎯    | Story 1    | 文書のアップロードと基本情報登録 |
| P1 🎯    | Story 2    | 文書一覧の表示と閲覧             |
| P1 🎯    | Story 3    | キーワード検索で文書を探す       |

### 1.3 画面構成を洗い出す

spec.mdから必要な画面を整理します。

**MVP必須画面**

1. **ダッシュボード / 文書一覧画面**

   - リストビュー / グリッドビュー切り替え
   - 検索バー
   - ソート機能
   - ページネーション

2. **アップロードモーダル / エリア**

   - ドラッグ&ドロップエリア
   - ファイル選択ボタン
   - タグ設定
   - プログレスバー

3. **文書詳細画面**（※P2だが基本レイアウトは作成推奨）

---

## 2️⃣ Figma Makeでデザイン生成（1時間）

### 2.1 Figma Makeの起動

1. Figmaを開く
2. 画面左上の「Make」ボタンをクリック
3. Figma Makeのプロンプト画面が表示される

### 2.2 spec.mdを使ってデザイン生成

`specs/002-document-management/spec.md` の内容をFigma Makeに投げてデザインを生成します。

**手順**

1. spec.mdをエディタで開く
2. 内容を全てコピー
3. Figma Makeのプロンプトに以下のように入力:

```
以下のspec.mdに基づいて、文書管理システムのUIデザインを作成してください。
MVP機能（P1のUser Story 1〜3）の画面を優先してください。
Material UIスタイルで、デスクトップ向け（1440 x 900）のデザインにしてください。

[spec.mdの内容を貼り付け]
```

4. 生成を実行して結果を確認

### 2.3 生成結果の確認と追加生成

生成されたデザインを確認し、不足している画面があれば追加で生成します。

**確認すべき画面**

- [ ] 文書一覧画面（リストビュー）
- [ ] 文書一覧画面（グリッドビュー）
- [ ] アップロードモーダル
- [ ] 検索結果画面

**追加生成が必要な場合**

```
先ほど生成した文書管理システムに、ファイルアップロード用のモーダルダイアログを追加してください。
- ドラッグ&ドロップエリア
- タグ選択
- プログレスバー
```

### 💡 Tips: spec.mdから効率的にデザイン生成するコツ

1. **spec.md全体を一度に投げる** - Figma Makeが必要な画面を判断してくれる
2. **MVP機能を明示する** - P1のUser Storyに絞ることを伝える
3. **デザインシステムを指定** - Material UI、デスクトップ向けなど
4. **完璧を求めない** - 生成後の手動調整を前提とする

---

## 3️⃣ Figmaでデザイン調整（2時間）

### 3.1 生成されたデザインをFigmaにコピー

Figma Makeで生成されたデザインをFigmaファイルにコピーして使用します。

**手順**

1. Figma Makeの生成結果画面で、使いたいデザインを選択
2. 「Copy design」ボタンをクリック
3. コピー先のFigmaファイルを選択（新規作成 or 既存ファイル）
4. デザインがFigmaファイルに配置される

**コピー後の調整**

コピーされたデザインをベースに、手動で細かい調整を行います。

### 3.2 Material UI for Figmaの活用

不足しているコンポーネントや調整が必要な箇所は、Material UI for Figmaから追加します。

**コンポーネントの取得**

1. [Material UI for Figma](https://www.figma.com/community/file/912837788133317724)を開く
2. 「Duplicate」で自分のファイルにコピー
3. 必要なコンポーネントをコピー&ペースト

**主要コンポーネント**

- AppBar → ヘッダー
- TextField + InputAdornment → 検索バー
- ToggleButtonGroup → 表示切替
- Table / Card → ファイル一覧
- Pagination → ページネーション
- Chip → タグ表示
- Dialog → アップロードモーダル

---

## 4️⃣ デザイン共有・振り返り（30分）

### 4.1 共有準備

デザインを共有するため、以下を整理します。

- [ ] MVP機能がカバーできているか確認
- [ ] 工夫したポイントを1〜2つピックアップ
- [ ] 迷った点やアドバイスが欲しい点を整理

### 4.2 共有の進め方

1. 一人ずつデザインを画面共有（3〜4分/人）
2. 感想やコメント交換（2分/人）
3. 全体で気づきを共有（残り時間）

**ポジティブに**

- 良い点を見つけて共有する
- 改善案は提案として伝える

---

## 5️⃣ speckit.planで実装計画作成（1時間）

### 5.1 speckit.planとは

spec.mdを元に、実装計画（plan.md）を自動生成するコマンドです。

### 5.2 実行手順

**Claude Code（または GitHub Copilot）で実行**

1. プロジェクトのルートディレクトリを開く
2. Claude Code（またはCopilot Chat）で以下のように入力:

```
/speckit.plan

以下の情報を元に実装プランを作成してください。

仕様書: specs/002-document-management/spec.md
OpenAPI: schema/files/openapi.yaml
Figma URL: [あなたのFigma URL]

MVP機能（P1）に絞って、実装プランを作成してください。
```

3. 処理の流れ:

   - Figma MCPがFigmaデザインからコンポーネント情報を取得
   - spec.mdとFigmaデザイン情報を元に`/speckit.plan`を実行
   - `plan.md`が生成される

4. 生成された`plan.md`を確認

### 5.3 plan.mdの確認ポイント

生成された実装計画を確認し、必要に応じて調整します。

**確認項目**

- [ ] MVP機能（P1）がすべて含まれているか
- [ ] 実装の優先順位は適切か
- [ ] コンポーネント構成は妥当か
- [ ] 技術スタックは正しいか（React, MUI, TanStack Query等）

**調整が必要な場合**

plan.mdを直接編集します。

### 💡 Tips: plan.mdの活用

- Day 2の実装時にplan.mdを参照する
- タスク分解の基準として使用

---

## 📝 Day 1 振り返りチェックリスト

- [ ] spec.mdのMVP機能を理解できた
- [ ] Figma Makeでデザインを生成できた
- [ ] FigmaでUIデザインを作成できた
- [ ] plan.mdを生成できた

---

## 🔗 参考リンク

- [Material UI公式ドキュメント](https://mui.com/)
- [Material UI for Figma (Community)](https://www.figma.com/community/file/912837788133317724)
- [Figma Learn](https://help.figma.com/hc/en-us)

---

## ➡️ 次回予告: Day 2

Day 2では、今日作成したデザインを元に、`/speckit.tasks`でタスク分解し、`/speckit.implement`でReactコンポーネントを実装します。

**事前準備**

- [ ] 今日のFigmaデザインを完成させておく
- [ ] FigmaファイルのURLを控えておく
