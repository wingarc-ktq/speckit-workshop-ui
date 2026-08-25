# 作業指示書: ダークテーマ + コマンドパレット（⌘K）

**方針**: Raycast 型オーバーレイ。既存レイアウトを壊さず、ダークテーマ化と ⌘K 検索モーダルを追加する。
**想定時間**: 4時間
**制約**: 既存の E2E テスト 12 件を落とさないこと。

---

## ゴール

1. アプリ全体をダークテーマにし、ヘッダーのボタンでライト/ダークを切り替えられる
2. `⌘K`（Mac）/ `Ctrl+K`（Win/Linux）で検索モーダルが開く
3. モーダル内でファイル名を入力すると候補が絞り込まれ、↑↓ で選択、Enter で確定できる
4. `Esc` で閉じる

---

## 配色（Raycast 風）

| 用途 | 値 |
| --- | --- |
| 背景（ページ） | `#1C1C1A` |
| 背景（カード・モーダル） | `#2C2C2A` |
| 背景（ホバー・選択行） | `#444441` |
| 枠線 | `#5F5E5A` |
| テキスト（主） | `#F1EFE8` |
| テキスト（副） | `#B4B2A9` |
| アクセント | `#D85A30` |
| アクセント（淡） | `#F0997B` |

---

## Phase 1: ダークテーマ化（目安 1 時間）

### 対象ファイル

- `src/app/providers/ThemeProvider/config.ts` — 既存の `appTheme` がある
- `src/app/providers/ThemeProvider/ThemeProvider.tsx`
- `src/presentations/layouts/AppLayout/components/AppHeader/AppHeader.tsx`

### やること

1. `config.ts` に `darkTheme` を追加する。既存の `appTheme` は `lightTheme` として残す
   - `palette.mode: 'dark'` と上記の配色を設定
   - `components` の `MuiPaper` / `MuiAppBar` の背景も上書きすること（MUI 既定色だと浮く）
2. `ThemeProvider.tsx` を、モードを state で保持して切り替えられるようにする
   - 初期値は `localStorage` から読む。無ければ `dark`
   - 切り替え時に `localStorage` へ保存する
   - モードと切替関数を Context で公開する（`useThemeMode()` のようなフック）
3. `AppHeader.tsx` に切替ボタンを追加
   - アイコンは `@mui/icons-material` の `LightMode` / `DarkMode`
   - `data-testid="themeToggleButton"` を必ず付ける

### 参考にする既存実装

言語切替（i18n）が同じ構造で実装済み。`localStorage` への保存もしているので、`src/i18n/` 配下と `AppHeader.tsx` の言語切替部分を読んでから書くこと。

### 完了条件

- `pnpm dev` でダーク表示になる
- 切替ボタンでライト/ダークが往復する
- リロードしても選択が保持される
- `pnpm test:run` が通る（既存の単体テストを壊していない）

---

## Phase 2: コマンドパレット（目安 2 時間）

### 新規作成するファイル

```
src/presentations/components/CommandPalette/
├── CommandPalette.tsx          # 本体
├── styled.tsx                  # スタイル定義（既存コンポーネントに倣う）
├── index.ts
└── __tests__/CommandPalette.test.tsx
```

### 設置場所

`src/presentations/layouts/AppLayout/AppLayout.tsx` に配置する。
どの画面からでも `⌘K` で開けるようにするため、ページ単位ではなくレイアウト単位で持つこと。

### 仕様

**開閉**

- `⌘K` / `Ctrl+K` で開く。`Esc` または背景クリックで閉じる
- キーイベントは `useEffect` で `window` に登録し、クリーンアップも必ず書く
- ブラウザ既定の動作を潰すため `event.preventDefault()` を呼ぶ

**検索**

- MUI の `Dialog` を使う。`fullWidth` / `maxWidth="sm"`、画面上部寄せ
- 入力欄は開いた瞬間にフォーカスが当たること（`autoFocus`）
- 既存の `useFiles` フックを流用して結果を取得する。**新しい API は追加しない**
- デバウンスは既存の検索（300ms）と同じ挙動に揃える

**キーボード操作**

- `↑` `↓` で候補を移動。選択中の行は背景 `#444441`
- `Enter` で確定 → 既存のファイル詳細ダイアログを開く、または `?search=` 付きで一覧に反映
- 候補が 0 件のときは「該当する文書が見つかりませんでした」を表示

**必須の data-testid**

| 要素 | testid |
| --- | --- |
| モーダル本体 | `commandPalette` |
| 入力欄 | `commandPaletteInput` |
| 候補リストの各行 | `commandPaletteItem` |
| 0件表示 | `commandPaletteEmpty` |

### 完了条件

- `⌘K` で開き、`Esc` で閉じる
- 文字を打つと候補が絞り込まれる
- `↑` `↓` で選択が動き、`Enter` で反応する
- `pnpm lint` と `pnpm type-check` が通る

---

## Phase 3: E2E テスト追加（目安 1 時間 / 余裕があれば）

### 対象ファイル

```
playwright/tests/specs/command-palette/command-palette.md       # 先に仕様書
playwright/tests/pages/CommandPalettePage.ts                     # Page Object
playwright/tests/specs/command-palette/command-palette.spec.ts   # テスト
```

### 進め方

Day 3 と同じ手順を踏むこと。

1. Playwright MCP で実際に `⌘K` を押して `browser_snapshot` を取得
2. `playwright/README.md` のフォーマットでテスト仕様書を書く
3. Page Object を作る（`BasePage` を継承。`FileListPage.ts` に倣う）
4. テストコードを生成して `PLAYWRIGHT_WORKERS=2 pnpm test:e2e:chromium` で通す

### テストケース案（3件程度に絞る）

- `⌘K でコマンドパレットが開くこと`
- `キーワードを入力すると候補が絞り込まれること`
- `Esc でコマンドパレットが閉じること`

### 注意

- キー入力は `page.keyboard.press('Meta+k')` / `'Control+k'`。OS 判定が必要
- 検索の 300ms デバウンスは既存と同じなので、`FileListPage` の待機処理を参考にする
- 前提条件のファイルアップロードは `fixtures/testFiles.ts` を再利用する

---

## 守ること

- **既存の E2E 12 件を落とさない。** 各 Phase の終わりに `PLAYWRIGHT_WORKERS=2 pnpm test:e2e:chromium` を流す
- プロジェクト憲法（`.specify/memory/constitution.md`）に従う。特に TypeScript strict、関数コンポーネント、MUI 優先、`data-testid` の付与
- 既存ファイルの書き方（日本語 JSDoc、`styled.tsx` へのスタイル分離、`index.ts` でのエクスポート）に揃える
- コンポーネントを作ったら単体テストも同時に書く

## 時間が足りないときの切り方

Phase 1 だけでも成果物として成立する。Phase 2 に入って詰まったら、キーボード操作（↑↓）を諦めてクリック選択のみにする。Phase 3 は完全に任意。
