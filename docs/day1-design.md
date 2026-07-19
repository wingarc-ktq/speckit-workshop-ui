# Day 1: Figmaでデザイン作成

## 🎯 今日のゴール

spec.mdを読み解き、Figma Make / Figma Agent でUIデザインを作成する。

**成果物**

- 文書管理システムのFigmaデザイン（MVP機能）
- 実装計画書（plan.md）

---

## ⏰ タイムテーブル（6時間）

| 時間        | 内容                         |
| ----------- | ---------------------------- |
| 10:30-11:00 | オリエンテーション・環境確認 |
| 11:00-12:00 | spec.md読解・機能整理        |
| 12:00-13:00 | 休憩                         |
| 13:00-14:00 | Make / Agentでデザイン生成   |
| 14:00-15:30 | Figmaでデザイン調整          |
| 15:30-16:00 | デザイン共有・振り返り       |
| 16:00-17:00 | speckit.planで計画作成       |
| 17:00-17:30 | 全体振り返り                 |

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

## 2️⃣ Figma Make / Figma Agent でデザイン生成（1時間）

AIでデザインを生成する方法は2つあります。目的に応じて使い分けます。

| ツール          | 生成場所                | アウトプット                          | 向いている用途                               |
| --------------- | ----------------------- | ------------------------------------- | -------------------------------------------- |
| **Figma Make**  | 専用環境（Figma内）     | 動作するWebアプリ（React + Tailwind） | プロンプトから画面/プロトタイプを一気に作る  |
| **Figma Agent** | Figma Design キャンバス | デザインレイヤー（フレーム・部品）    | デザインシステムに沿って生成・調整・一括編集 |

> 💡 **どちらを使ってもOK。併用がおすすめです。** Figma Make で全体を素早く生成 → Figma にコピー → Figma Agent でキャンバス上を調整、という往復ができます（必要なら Make に戻すことも可能）。
>
> **Figma Agent とは:** Config 2026 で発表された新しいAIエージェント。Figma Design のキャンバス上で直接動き、あなたのデザインシステム（コンポーネント・トークン）を理解して生成・編集します。2026年時点では有料プラン（Professional / Organization / Enterprise の Full seat）のオープンベータで、ベータ期間中は無料、GA後はAIクレジットを消費します。

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

### 2.4 【新】Figma Agent でデザイン生成・調整

Figma Agent は Figma Design のキャンバス上で直接動くAIエージェントです。生成から調整・一括編集までを1つのファイル内で完結できます。

#### 2.4.1 Figma Agent の起動

1. Figma Design ファイルを開く
2. 左のナビゲーションバーの **「Agents」** をクリック（サイドバーにチャットが常駐）
   - または任意のレイヤーを選択して `Cmd/Ctrl + Enter`
   - 「Dictate」で音声入力も可能
3. プロンプト入力欄が表示される

#### 2.4.2 デザインシステムを認識させる（重要）

1. プロンプト欄の **「Add context」** をクリックし、使いたいライブラリ（例: Material UI）を接続
2. `@` を入力して特定のコンポーネントやトークンを指定
   - 接続すると、チームのコンポーネント・スタイル・変数を自動で適用してくれる

#### 2.4.3 生成の2つの進め方

- **Go wide（幅出し）** — 同じ課題に複数のスタイル案を一度に生成して比較

  ```
  文書一覧画面のレイアウト案を3パターン生成してください。
  リストビュー / グリッドビュー / カード型の3方向で、Material UI のコンポーネントを使ってください。
  ```

- **Go deep（深掘り）** — 方向性を1つ選び、反復して磨き込む

  ```
  この文書一覧画面をベースに、検索バーとフィルタUIを追加してください。
  既存のデザインシステムに沿ったまま調整してください。
  ```

#### 2.4.4 面倒な作業の自動化

Figma Agent は生成だけでなく、以下のような定型作業も指示できます。

- 変数名のリネームやトークンの統一
- 画面をまたいだコンポーネントの一括差し替え
- 複数フレームへのリアルなダミーデータ流し込み
- アクセシビリティ観点でのデザインレビュー・フィードバック

> 💡 Figma Agent は Figma Design 内で完結するため、次の「3️⃣ Figmaでデザイン調整」も Agent に指示しながら進められます。

### 💡 Tips: AIから効率的にデザイン生成するコツ

1. **spec.md全体を一度に投げる** - AIが必要な画面を判断してくれる
2. **MVP機能を明示する** - P1のUser Storyに絞ることを伝える
3. **デザインシステムを指定** - Material UI、デスクトップ向けなど（Figma Agent なら「Add context」でライブラリ接続 + `@` 参照）
4. **完璧を求めない** - 生成後の手動調整を前提とする
5. **Make と Agent を併用する** - Make で全体を素早く生成し、Agent でキャンバス上を仕上げる

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
- [ ] Figma Make / Figma Agent でデザインを生成できた
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
