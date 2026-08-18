# Tasks: 文書管理システム

**Input**: Design documents from `/specs/002-document-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/openapi.yaml ✅, quickstart.md ✅

**Tests**: テストタスクは明示的なリクエストがないため、オプションとして含めていません。テストが必要な場合は別途指示してください。

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テストできます。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: タスクが属するユーザーストーリー（例: US1, US2, US3）
- 説明には正確なファイルパスを含む

## Path Conventions

- **Source**: `src/` at repository root
- **Specs**: `specs/002-document-management/`
- **Playwright**: `playwright/tests/specs/files/`

---

## Phase 1: Setup（セットアップ）

**Purpose**: プロジェクト初期化と基本構造の作成

- [x] T001 依存パッケージのインストール `pnpm add @mui/x-data-grid react-dropzone date-fns`
- [x] T002 [P] OpenAPI仕様を `schema/files/openapi.yaml` にコピー
- [x] T003 [P] orval設定を `schema/orval.config.ts` に追加(filesエンドポイント用)
- [x] T004 APIクライアントコードを生成 `pnpm gen:api` → `src/adapters/generated/files.ts`
- [x] T005 [P] MSWハンドラーを `src/adapters/mocks/handlers/index.ts` に追加

---

## Phase 2: Foundational（基盤構築）

**Purpose**: すべてのユーザーストーリーの実装前に完了が必須のコアインフラストラクチャ

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの作業は開始できません

### ドメインモデルの実装

- [x] T006 [P] File関連の型定義を作成 `src/domain/models/file/type.ts`
- [x] T007 [P] File型のエクスポート設定 `src/domain/models/file/index.ts`
- [x] T008 [P] Tag関連の型定義を作成 `src/domain/models/tag/type.ts`
- [x] T009 [P] Tag型のエクスポート設定 `src/domain/models/tag/index.ts`

### Adapterレイヤーの実装

- [x] T010 [P] ファイル取得リポジトリ `src/adapters/repositories/files/getFiles.ts`
- [x] T011 [P] ファイル詳細取得リポジトリ `src/adapters/repositories/files/getFileById.ts`
- [x] T012 [P] ファイルアップロードリポジトリ `src/adapters/repositories/files/uploadFile.ts`
- [x] T013 [P] ファイル更新リポジトリ `src/adapters/repositories/files/updateFile.ts`
- [x] T014 [P] ファイル削除リポジトリ `src/adapters/repositories/files/deleteFile.ts`
- [x] T015 [P] ファイル一括削除リポジトリ `src/adapters/repositories/files/bulkDeleteFiles.ts`
- [x] T016 [P] ファイルダウンロードリポジトリ `src/adapters/repositories/files/downloadFile.ts`
- [x] T017 ファイルリポジトリのエクスポート `src/adapters/repositories/files/index.ts`
- [x] T018 [P] タグ取得リポジトリ `src/adapters/repositories/tags/getTags.ts`
- [x] T019 [P] タグ作成リポジトリ `src/adapters/repositories/tags/createTag.ts`
- [x] T020 [P] タグ更新リポジトリ `src/adapters/repositories/tags/updateTag.ts`
- [x] T021 [P] タグ削除リポジトリ `src/adapters/repositories/tags/deleteTag.ts`
- [x] T022 タグリポジトリのエクスポート `src/adapters/repositories/tags/index.ts`
- [x] T023 repositoryCompositionに files, tags を追加 `src/adapters/repositories/repositoryComposition.ts`

### TanStack Queryフックの実装

- [x] T024 クエリキー定数を追加 `src/presentations/hooks/queries/constants.ts` に FILES, TAGS キー追加
- [x] T025 [P] useFilesフック `src/presentations/hooks/queries/files/useFiles.ts`
- [x] T026 [P] useFileByIdフック `src/presentations/hooks/queries/files/useFileById.ts`
- [x] T027 [P] useUploadFileフック `src/presentations/hooks/queries/files/useUploadFile.ts`
- [x] T028 [P] useUpdateFileフック `src/presentations/hooks/queries/files/useUpdateFile.ts`
- [x] T029 [P] useDeleteFileフック `src/presentations/hooks/queries/files/useDeleteFile.ts`
- [x] T030 [P] useBulkDeleteFilesフック `src/presentations/hooks/queries/files/useBulkDeleteFiles.ts`
- [x] T031 [P] useTagsフック `src/presentations/hooks/queries/tags/useTags.ts`
- [x] T032 [P] useCreateTagフック `src/presentations/hooks/queries/tags/useCreateTag.ts`
- [x] T033 [P] useUpdateTagフック `src/presentations/hooks/queries/tags/useUpdateTag.ts`
- [x] T034 [P] useDeleteTagフック `src/presentations/hooks/queries/tags/useDeleteTag.ts`

### ユーティリティ関数の実装

- [x] T035 [P] ファイルフォーマッター関数 `src/presentations/utils/fileFormatters.ts`（formatFileSize, getFileType, isSupportedFileType, exceedsMaxUploadSize）

### 共通UIコンポーネントの実装

- [x] T036 [P] TagChipsコンポーネント `src/presentations/components/tags/TagChips/TagChips.tsx`
- [x] T037 [P] TagSelectorコンポーネント `src/presentations/components/tags/TagSelector/TagSelector.tsx`

### レイアウトの実装

- [x] T038 AppLayoutコンポーネント `src/presentations/layouts/AppLayout/AppLayout.tsx`
- [x] T039 [P] AppSidebarコンポーネント `src/presentations/layouts/AppLayout/components/AppSidebar/AppSidebar.tsx`
- [x] T040 [P] AppHeaderコンポーネント `src/presentations/layouts/AppLayout/components/AppHeader/AppHeader.tsx`

### 国際化（i18n）の設定

- [x] T041 [P] 日本語翻訳を追加 `src/i18n/locales/ja.json` に filesPage セクション追加
- [x] T042 [P] 英語翻訳を追加 `src/i18n/locales/en.json` に filesPage セクション追加

### ルーティングの設定

- [x] T043 FilesPageルートを追加 `src/app/router/routes.tsx`

**Checkpoint**: 基盤準備完了 - ユーザーストーリーの実装を並列で開始可能

---

## Phase 3: User Story 1 - 文書のアップロードと基本情報登録 (Priority: P1) 🎯 MVP

**Goal**: ファイルをドラッグ&ドロップでアップロードし、タグを設定して保存できる

**Independent Test**: ファイルをドラッグ&ドロップでアップロードし、基本情報（ファイル名、タグ）を設定して保存できることを確認

### Implementation for User Story 1

- [x] T044 [P] [US1] FileUploadZoneコンポーネント `src/presentations/pages/FilesPage/components/UploadSection/components/FileUploadZone/FileUploadZone.tsx`
- [x] T045 [US1] UploadSectionコンポーネント `src/presentations/pages/FilesPage/components/UploadSection/UploadSection.tsx`
- [x] T046 [US1] アップロードプログレスバー表示の実装（UploadSection内）
- [x] T047 [US1] ファイルサイズ・形式バリデーションのエラーハンドリング実装
- [x] T048 [US1] 複数ファイル同時アップロード機能の実装（最大20ファイル）

**Checkpoint**: User Story 1が独立して機能し、テスト可能な状態

---

## Phase 4: User Story 2 - 文書一覧の表示と閲覧 (Priority: P1) 🎯 MVP

**Goal**: チームがアップロードした全文書をリスト/グリッドビューで表示し、ソート・ページネーションができる

**Independent Test**: 文書一覧画面で複数の文書が表示され、リスト/グリッドビューの切り替え、ソート、ページネーションが機能することを確認

### Implementation for User Story 2

- [x] T049 [P] [US2] FileListTableコンポーネント（MUI DataGrid使用） `src/presentations/pages/FilesPage/components/MyFilesSection/components/FileListTable/FileListTable.tsx`
- [x] T050 [US2] MyFilesSectionコンポーネント `src/presentations/pages/FilesPage/components/MyFilesSection/MyFilesSection.tsx`
- [x] T051 [US2] リスト/グリッドビュー切り替え機能の実装
- [x] T052 [US2] ソート機能の実装（ファイル名、更新日時、ファイルサイズ）
- [x] T053 [US2] ページネーション機能の実装（サーバーサイド）

**Checkpoint**: User Story 2が独立して機能し、テスト可能な状態

---

## Phase 5: User Story 3 - キーワード検索で文書を探す (Priority: P1) 🎯 MVP

**Goal**: キーワード検索でファイル名・タグ名が一致する文書を素早く見つけられる

**Independent Test**: 検索バーにキーワードを入力し、ファイル名またはタグ名が一致する文書が表示されることを確認

### Implementation for User Story 3

- [x] T054 [US3] 検索バーコンポーネントをAppHeaderに追加し、URLパラメータと連携 `src/presentations/layouts/AppLayout/components/AppHeader/AppHeader.tsx`
- [x] T055 [US3] 検索デバウンス処理の実装（300ms）`src/presentations/hooks/useDebounce.ts`
- [x] T056 [US3] 検索に合致したファイルが表示されることを確認（ハイライト不要）
- [x] T057 [US3] 検索結果ゼロ件時のメッセージ表示 `src/presentations/pages/FilesPage/components/MyFilesSection/MyFilesSection.tsx`

**Checkpoint**: User Story 3が独立して機能し、テスト可能な状態

---

## Phase 6: User Story 4 - タグでフィルタリング (Priority: P2)

**Goal**: 複数のタグを組み合わせて、必要な文書を効率的に絞り込める

**Independent Test**: タグのフィルタを適用し、条件に合致する文書のみが表示されることを確認

### Implementation for User Story 4

- [x] T058 [US4] サイドメニューのタグにクリックイベントを追加し、単一タグフィルタを実装
- [x] T059 [US4] ヘッダーに詳細検索ポップオーバーを実装(TuneIcon + Popover + TagSelector)
- [x] T060 [US4] 複数タグ選択によるANDフィルタリング機能の実装(URLクエリパラメータ管理含む)
- [x] T061 [US4] フィルタクリア機能の実装(ポップオーバー内とサイドメニュー選択解除)

**Checkpoint**: User Story 4が独立して機能し、テスト可能な状態

---

## Phase 7: User Story 5 - 文書の詳細表示とダウンロード (Priority: P2)

**Goal**: 文書の詳細をプレビューで確認し、必要なファイルをダウンロードできる

**Independent Test**: 文書をクリックして詳細画面を開き、プレビュー表示とダウンロード機能が動作することを確認

### Implementation for User Story 5

- [x] T062 [P] [US5] FileDetailDialogコンポーネント `src/presentations/pages/FilesPage/components/MyFilesSection/components/FileDetailDialog/FileDetailDialog.tsx`
- [x] T063 [US5] PDFプレビュー表示機能の実装
- [x] T064 [US5] 画像プレビュー表示機能の実装
- [x] T065 [US5] 単一ファイルダウンロード機能の実装
- [x] T066 [US5] 複数ファイル一括ダウンロード機能の実装（ZIP形式）

**Checkpoint**: User Story 5が独立して機能し、テスト可能な状態

---

## Phase 8: User Story 6 - タグの作成と管理 (Priority: P2)

**Goal**: チームに合わせたタグを自由に作成・管理し、色で視覚的に区別できる

**Independent Test**: タグ管理画面で新しいタグを作成し、色を設定して保存できることを確認。作成したタグが文書のタグ選択時に表示されることを確認

### Implementation for User Story 6

- [x] T067 [US6] タグ管理セクションをAppSidebarに追加
- [x] T068 [US6] 新規タグ作成ダイアログの実装
- [x] T069 [US6] タグ色選択機能の実装（7色）
- [x] T070 [US6] タグ編集機能の実装
- [x] T071 [US6] タグ削除機能の実装（使用中警告付き）

**Checkpoint**: User Story 6が独立して機能し、テスト可能な状態

---

## Phase 9: User Story 7 - 文書のメタデータ編集 (Priority: P3)

**Goal**: アップロード後にファイル名やタグを変更できる

**Independent Test**: 文書の詳細画面からファイル名、タグを編集し、保存できることを確認

### Implementation for User Story 7

- [x] T072 [P] [US7] FileEditDialogコンポーネント `src/presentations/pages/FilesPage/components/MyFilesSection/components/FileEditDialog/FileEditDialog.tsx`
- [x] T073 [US7] ファイル名編集機能の実装
- [x] T074 [US7] タグ編集機能の実装（追加・削除）
- [x] T075 [US7] 編集内容の保存と一覧への即時反映

**Checkpoint**: User Story 7が独立して機能し、テスト可能な状態

---

## Phase 10: User Story 8 - 文書の削除とゴミ箱からの復元 (Priority: P3)

**Goal**: 誤削除のリスクを軽減し、必要に応じて復元できる

**Independent Test**: 文書を削除してゴミ箱に移動し、ゴミ箱から復元できることを確認

### Implementation for User Story 8

- [ ] T076 [US8] 削除確認ダイアログの実装
- [ ] T077 [US8] 単一ファイル削除機能の実装
- [ ] T078 [US8] 複数ファイル一括削除機能の実装
- [ ] T079 [US8] ゴミ箱ビューの実装（AppSidebarからアクセス）
- [ ] T080 [US8] ゴミ箱からの復元機能の実装

**Checkpoint**: User Story 8が独立して機能し、テスト可能な状態

---

## Phase 11: User Story 9 - 検索条件の保存と再利用 (Priority: P3)

**Goal**: 頻繁に使う検索条件をワンクリックで再適用できる

**Independent Test**: 検索条件を保存し、保存した条件をワンクリックで再適用できることを確認

### Implementation for User Story 9

- [ ] T081 [US9] 検索条件保存ダイアログの実装
- [ ] T082 [US9] 保存済み検索条件一覧の表示（AppSidebar内）
- [ ] T083 [US9] 保存済み検索条件の適用機能
- [ ] T084 [US9] 保存済み検索条件の編集・削除機能

**Checkpoint**: User Story 9が独立して機能し、テスト可能な状態

---

## Phase 12: Recent Files機能とFilesPage統合

**Purpose**: Recent Filesセクションの実装とFilesPageの完成

- [x] T085 [P] FileCardコンポーネント `src/presentations/pages/FilesPage/components/RecentFilesSection/components/FileCard/FileCard.tsx`
- [x] T086 RecentFilesSectionコンポーネント `src/presentations/pages/FilesPage/components/RecentFilesSection/RecentFilesSection.tsx`
- [x] T087 FilesPageの完成 `src/presentations/pages/FilesPage/FilesPage.tsx`（全セクション統合）

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: 複数のユーザーストーリーに影響する改善

- [ ] T088 [P] アクセシビリティ対応の確認と修正（キーボード操作、aria-label）
- [ ] T089 [P] レスポンシブ対応の確認と修正（デスクトップ、タブレット）
- [ ] T090 [P] エラーハンドリングの統一と改善
- [ ] T091 [P] ローディング状態の統一と改善
- [ ] T092 パフォーマンス最適化（検索デバウンス、DataGrid仮想化確認）
- [ ] T093 quickstart.md の実装チェックリスト検証

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Setupの完了に依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-11)**: Foundationalフェーズの完了に依存
  - User Story 1, 2, 3 (P1 MVP): Foundational完了後、並列で開始可能
  - User Story 4, 5, 6 (P2): Foundational完了後、並列で開始可能
  - User Story 7, 8, 9 (P3): Foundational完了後、並列で開始可能
- **Recent Files & FilesPage (Phase 12)**: US2（一覧表示）の完了後に開始推奨
- **Polish (Phase 13)**: 希望するユーザーストーリーがすべて完了後

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完了後に開始可能 - 他ストーリーへの依存なし
- **User Story 2 (P1)**: Foundational完了後に開始可能 - 他ストーリーへの依存なし
- **User Story 3 (P1)**: Foundational完了後に開始可能 - US2との統合が必要だが独立テスト可能
- **User Story 4 (P2)**: US2（一覧表示）との統合が必要だが独立テスト可能
- **User Story 5 (P2)**: US2（一覧表示）からの詳細表示が必要
- **User Story 6 (P2)**: Foundational完了後に開始可能 - 他ストーリーへの依存なし
- **User Story 7 (P3)**: US5（詳細表示）からの編集が自然な流れ
- **User Story 8 (P3)**: US2（一覧表示）との統合が必要
- **User Story 9 (P3)**: US3, US4（検索・フィルタ）の完了後が自然

### Within Each User Story

- 各ストーリー内でモデル → サービス → UI の順で実装
- コア実装 → 統合の順序
- ストーリー完了後に次の優先度へ移動

### Parallel Opportunities

- Setup: [P]マークのタスクは並列実行可能
- Foundational: [P]マークのタスクは並列実行可能
- User Stories: 異なるストーリーは異なる開発者が並列で作業可能
- 同一ストーリー内: [P]マークのタスクは並列実行可能

---

## Parallel Example: Foundational Phase

```bash
# T006-T009 (ドメインモデル) を並列で実行:
Task: "File関連の型定義を作成 src/domain/models/file/type.ts"
Task: "Tag関連の型定義を作成 src/domain/models/tag/type.ts"

# T010-T016, T018-T021 (Adapterリポジトリ) を並列で実行:
Task: "ファイル取得リポジトリ src/adapters/repositories/files/getFiles.ts"
Task: "タグ取得リポジトリ src/adapters/repositories/tags/getTags.ts"
# ... その他の[P]マークタスク
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 のみ)

1. Phase 1: Setup 完了
2. Phase 2: Foundational 完了（CRITICAL - 全ストーリーをブロック）
3. Phase 3: User Story 1（アップロード）完了
4. Phase 4: User Story 2（一覧表示）完了
5. Phase 5: User Story 3（検索）完了
6. **STOP and VALIDATE**: MVP として独立テスト
7. デプロイ/デモ準備完了

### Incremental Delivery

1. Setup + Foundational 完了 → 基盤準備完了
2. User Story 1 追加 → 独立テスト → デプロイ/デモ
3. User Story 2 追加 → 独立テスト → デプロイ/デモ
4. User Story 3 追加 → 独立テスト → デプロイ/デモ（MVP完成!）
5. User Story 4-6 追加 → 独立テスト → デプロイ/デモ
6. User Story 7-9 追加 → 独立テスト → デプロイ/デモ
7. 各ストーリーは前のストーリーを壊さずに価値を追加

### Parallel Team Strategy

複数開発者の場合:

1. チームでSetup + Foundationalを完了
2. Foundational完了後:
   - 開発者A: User Story 1（アップロード）
   - 開発者B: User Story 2（一覧表示）
   - 開発者C: User Story 3（検索）
3. ストーリーは独立して完了・統合

---

## Notes

- [P] タスク = 異なるファイル、依存なし
- [Story] ラベル = 特定のユーザーストーリーへのマッピング
- 各ユーザーストーリーは独立して完了・テスト可能であるべき
- タスクまたは論理的なグループ完了後にコミット
- 任意のチェックポイントで停止してストーリーを独立検証可能
- 避けるべき: 曖昧なタスク、同一ファイルの競合、独立性を損なうクロスストーリー依存
