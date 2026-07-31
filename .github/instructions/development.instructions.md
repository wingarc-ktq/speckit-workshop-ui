---
applyTo: '**'
---

# 開発ガイドライン（統合版）

詳細なガイドラインは以下のファイルに分割されています：

- `testing.instructions.md` - テストガイドライン
- `react.instructions.md` - React/TypeScript開発
- `project.instructions.md` - プロジェクト概要とアーキテクチャ

## 🔌 MCP (Model Context Protocol) 使用ガイドライン

このプロジェクトでは、以下のMCPサーバーを使用して開発を効率化できます。

### 1. Figma MCP

#### 使用タイミング

- **実装開始前**: デザイン構造とアセットの事前確認
- **コンポーネント実装時**: Figmaデザインからのコード生成
- **アセット取得時**: アイコン・画像のダウンロード

#### プロンプト例

```
Figma URL: https://www.figma.com/file/YOUR_FILE_KEY/...

このFigmaデザインを参考に、HeaderComponentを実装してください。
- styled.tsx にスタイル定義をまとめる
- Material-UIベースで実装
- レスポンシブ対応
- Figmaの色・サイズ・余白を反映
```

```
Figma URL: https://www.figma.com/file/YOUR_FILE_KEY/...

このFigmaファイルから以下のアイコンをダウンロードしてください：
- ホームアイコン → src/assets/icons/home.svg
- ユーザーアイコン → src/assets/icons/user.svg
```

### 2. Playwright MCP

#### 使用タイミング

- **E2Eテスト作成時**: テストコードの自動生成
- **Page Object作成時**: Page Object Modelパターンの実装
- **テスト仕様作成時**: テストシナリオの構造化

#### プロンプト例

```
ログイン機能のE2Eテストを作成してください。
- Page Object Modelパターンを使用
- data-testid属性でセレクタを指定
- 正常系と異常系の両方をテスト
- playwright/tests/specs/login/ に配置
```

```
ダッシュボードページのPage Objectクラスを作成してください。
- BasePageを継承
- 主要な要素のセレクタを定義
- ページ操作のメソッドを実装
- playwright/tests/pages/DashboardPage.ts として作成
```

### 設定ファイル

- **MCP設定**: 
  - Claude Code: `.mcp.json`
  - VSCode / GitHub Copilot: `.vscode/mcp.json`
  - Cline: `.cline/mcp.json`
  - Gemini CLI: `.gemini/settings.json`
  - Antigravity (agy): `.agents/mcp_config.json`
- **Playwright設定**: `.vscode/playwright-config.json`
