# Day 3: Playwright MCPでE2Eテスト作成

## 🎯 今日のゴール

Day 2で実装した機能に対して、Playwright MCPを活用してE2Eテストを作成する。

**成果物**

- テスト仕様書（Markdown）
- E2Eテストコード（Playwright）
- テストレポート

---

## ⏰ タイムテーブル（6時間）

| 時間        | 内容                              |
| ----------- | --------------------------------- |
| 10:30-11:00 | Day 2振り返り・Playwright環境確認 |
| 11:00-12:00 | テスト仕様書の作成                |
| 12:00-13:00 | 休憩                              |
| 13:00-14:00 | Playwright MCP でテスト自動生成   |
| 14:00-16:00 | テストコードの調整・追加          |
| 16:00-16:30 | テスト実行・レポート確認          |
| 16:30-17:00 | 3日間の総括・発表準備             |
| 17:00-17:30 | 発表・振り返り                    |

---

## 📋 事前準備チェックリスト

- [ ] Day 2の実装が完了している
- [ ] 開発サーバーが起動できる
- [ ] Playwright MCPが設定済み

```bash
# ブラウザのインストール
pnpm test:e2e:install
```

---

## 1️⃣ Playwright環境の確認（30分）

### 1.1 プロジェクト構成

```
playwright/
├── playwright.config.ts
├── tests/
│   ├── specs/              # テストファイル
│   │   ├── files/
│   │   │   └── file-list.spec.ts
│   │   └── upload/
│   │       └── upload.spec.ts
│   ├── pages/              # Page Object Model
│   │   ├── BasePage.ts
│   │   └── FileListPage.ts
│   └── fixtures/           # テストデータ
│       └── testUsers.ts
└── test-results/           # テスト結果
```

### 1.2 Playwright設定の確認

[playwright/playwright.config.ts](../playwright/playwright.config.ts)で設定を確認します。

**主要な設定**

- `testDir`: `./tests` - テストファイルの場所
- `baseURL`: `http://localhost:5173` - アプリケーションのURL
- `webServer`: 自動的に開発サーバーを起動
- `projects`: chromium, firefox, webkit, モバイルブラウザ対応

### 1.3 Playwright MCPの確認

GitHub Copilot ChatでPlaywright MCPが動作することを確認します。

```
Playwright MCPでブラウザを起動して
http://localhost:5173 にアクセスし、
スクリーンショットを取得してください。
```

---

## 2️⃣ テスト仕様書の作成（1時間）

### 2.1 Playwright MCPで画面を確認しながら仕様書作成

Playwright MCPでブラウザを操作しながら、実際の画面に基づいてテスト仕様書を作成します。

**Claude Code（または GitHub Copilot Chat）で実行**

```
/speckit.implement
T042の実装をしてください。
http://localhost:5173/files のファイル一覧画面について、Playwright MCPで画面を確認しながら、playwright/tests/specs/files/file-list.md にテスト仕様書を作成してください。
仕様書のフォーマットは、playwright/README.md を参照してください。
```

### 2.2 テスト仕様書の書き方

[playwright/README.md](../playwright/README.md)に記載されているフォーマットに従います。

**基本構造**

```markdown
# {機能名}

## {テストケース名}（「〜すること」で終わる）

### データ（必要な場合）

| param1 | param2 |
| ------ | ------ |
| value1 | value2 |

### 前提条件（必要な場合）

- テスト実行前に必要な状態や条件を記述

### 手順

1. 具体的なアクション
2. 入力・操作
3. 期待される結果の確認

### 事後処理（必要な場合）

- テスト完了後のクリーンアップ処理を記述
```

## 3️⃣ Playwright MCPでテスト自動生成（1時間）

### 3.1 Page Object Modelの作成

まず、テストで使用するPage Objectを作成します。

**Copilot Chatでの実行例**

```
/speckit.implement
T043の実装をしてください。
Playwright MCPを使用して、http://localhost:5173/files にアクセスし、ページの構造を解析してください。
解析結果を元に、FileListPageのPage Objectを作成してください。
出力先: playwright/tests/pages/FileListPage.ts
```

### 3.2 テストコードの自動生成

テスト仕様書を元に、テストコードを生成します。

**Copilot Chatでの実行例**

```
/speckit.implement
T044の実装をしてください。
以下のテスト仕様書を元に、Playwrightテストコードを生成してください。
仕様書: playwright/tests/specs/files/file-list.md
Page Object: playwright/tests/pages/FileListPage.ts
出力先: playwright/tests/specs/files/file-list.spec.ts
```

---

## 4️⃣ テストコードの調整・追加（2時間）

### 4.1 生成されたテストの調整

AIが生成したテストコードを実際に動かして調整します。

```bash
# UIモードで実行（推奨）
pnpm test:e2e:ui

# ブラウザ表示付きで実行
pnpm test:e2e:headed
```

---

## 5️⃣ テスト実行・レポート確認（30分）

### 5.1 テストの実行

```bash
# 全テスト実行
pnpm test:e2e

# Chromiumのみ
pnpm test:e2e:chromium

# ヘッドありで実行（ブラウザが見える）
pnpm test:e2e:headed

# デバッグモード
pnpm test:e2e:debug
```

### 5.2 レポートの確認

```bash
# HTMLレポートを開く
pnpm test:e2e:report
```

**レポートの確認ポイント**

- [ ] 全テストがパスしているか
- [ ] 失敗したテストの原因は何か
- [ ] スクリーンショットで問題箇所を特定
- [ ] トレースで操作の流れを確認

### 5.3 失敗テストのデバッグ

```bash
# UIモードで失敗箇所を確認
pnpm test:e2e:ui

# テスト結果レポートを確認
pnpm test:e2e:report
```

---

## 7️⃣ 3日間の総括（30分）

### 発表準備

3日間の成果を5分程度で発表できるよう準備します。

**発表内容**

1. **作成したもの**（5分）

   - Figmaデザイン
   - 実装した機能
   - E2Eテスト

2. **工夫したポイント**（2分）

   - AIツールの活用方法
   - デザインの工夫
   - テストの工夫

3. **感想・気づき**（2分）

   - spec-kitワークフローの感想
   - AIツールの使い所
