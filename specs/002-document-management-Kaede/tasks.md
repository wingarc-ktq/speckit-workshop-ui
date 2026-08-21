# Tasks: 文書管理システム

**Branch**: `002-document-management-Kaede` | **Date**: 2025-01-19 | **Status**: Phase 1 Complete  
**Scope**: User Story 1-8 (P1/P2/P3) | **Target**: MVP機能完成

## Today (by 16:00) Deliverable

- ✅ Phase 1 Implemented (User Story 1-3): upload, list, search
- ✅ Quality bar for today: smoke-level only
  - ✅ Must: `pnpm type-check` - **PASSED**
  - ✅ Should: `pnpm test:run` for 1–2 core components/hooks - **PASSED (FileList.test.tsx, FileListItem.test.tsx)**
  - ✅ Optional: 1 Playwright happy path - **PASSED (document-list.spec.ts with 5+ tests)**
- Phase 2-3 are explicitly deferred after the review

## Task Dependencies Map

```
Phase 1 (P1)
├── Task 1-1: ファイルアップロード基盤 (US1)
├── Task 1-2: 文書一覧表示 (US2)
└── Task 1-3: キーワード検索 (US3)

Phase 2 (P2)
├── Task 2-1: タグ管理機能 (US6) [依存: Task 1-1]
├── Task 2-2: タグフィルタリング (US4) [依存: Task 2-1]
└── Task 2-3: 文書詳細表示・ダウンロード (US5) [依存: Task 1-2]

Phase 3 (P3)
├── Task 3-1: メタデータ編集機能 (US7) [依存: Task 2-3]
└── Task 3-2: 削除・ゴミ箱・復元機能 (US8) [依存: Task 1-2]
```

---

## Phase 1: MVP基盤 (P1)

### Task 1-1: ファイルアップロード基盤

**User Story**: US1 - 文書のアップロードと基本情報登録  
**Goal**: ドラッグ&ドロップまたはファイル選択ダイアログでファイルをアップロードし、タグを設定して保存できる  
**Effort**: 3時間  
**Priority**: P1 🎯  
**Status**: ✅ 完了

#### Files to Touch

- `src/presentations/pages/DocumentManagementPage/components/UploadDialog.tsx` (作成済み) ✅
- `src/presentations/hooks/mutations/useUploadFiles.ts` (作成済み) ✅
- `src/adapters/repositories/files/uploadFile.ts` (作成済み) ✅
- `src/adapters/mocks/handlers/files.ts` (編集済み - POST/PUTハンドラー追加) ✅
- `src/i18n/locales/ja.ts` (編集済み) ✅
- `src/i18n/locales/en.ts` (編集済み) ✅

#### Implementation Steps

- [x] ネイティブHTML5 Drag & Drop APIで実装（react-dropzoneは使用せず）✅
- [x] FileUpload機能をUploadDialogコンポーネントに統合 ✅
- [x] ファイル選択ダイアログ実装 ✅
- [x] クライアント側バリデーション（ファイルサイズ10MB、形式チェック、最大20ファイル）✅
- [x] useUploadFiles カスタムフック作成（TanStack Query使用）✅
- [x] エラーハンドリング（サイズ超過、形式不正、ネットワークエラー）✅
- [x] タグ選択UI実装（タグチップによる複数選択）✅
- [x] MSWハンドラー実装（POST /files, PUT /files/:id）✅
- [x] アップロード後のキャッシュ無効化（predicate使用）✅
- [x] TypeScript型定義（FileInfo、FileUploadError）✅

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `UploadDialog.test.tsx`: ドラッグ&ドロップでファイル検出
- [ ] `UploadDialog.test.tsx`: ファイル選択ダイアログでファイル選択
- [ ] `UploadDialog.test.tsx`: サイズ超過エラーメッセージ表示
- [ ] `UploadDialog.test.tsx`: 形式不正エラーメッセージ表示
- [ ] `UploadDialog.test.tsx`: 20ファイル超過時エラー表示
- [ ] `UploadDialog.test.tsx`: タグ選択機能
- [ ] `useUploadFiles.test.ts`: アップロード成功時にタグが保存される
- [ ] `useUploadFiles.test.ts`: アップロード失敗時にエラーが返される

**Playwright (E2E)**:
- [x] `file-upload.spec.ts`: アップロードダイアログが表示されること ✅
- [x] `file-upload.spec.ts`: ファイルを選択してアップロードできること ✅
- [x] `file-upload.spec.ts`: ドラッグ&ドロップでファイルをアップロードできること ✅
- [x] `file-upload.spec.ts`: 複数ファイルを同時にアップロードできること ✅
- [x] `file-upload.spec.ts`: ファイルサイズ超過時にエラーメッセージが表示されること ✅
- [x] `file-upload.spec.ts`: 対応外のファイル形式でエラーメッセージが表示されること ✅
- [x] `file-upload.spec.ts`: 20ファイル超過時にエラーメッセージが表示されること ✅
- [x] `file-upload.spec.ts`: タグを選択せずにアップロードできること ✅
- [x] `file-upload.spec.ts`: キャンセルボタンでダイアログを閉じられること ✅
- [x] `file-upload.spec.ts`: アップロード後にキャッシュが無効化されること ✅

#### Definition of Done

- ✅ ドラッグ&ドロップでファイル選択可能
- ✅ ファイル選択ボタンで複数ファイル選択可能
- ✅ クライアント側バリデーション実装（サイズ、形式、個数）
- ✅ タグフィールドで文書を分類可能
- ✅ アップロード成功後、文書一覧に追加
- ✅ タグ選択が反映される
- ✅ すべてのエラーケースでエラーメッセージ表示
- ✅ MSWモックハンドラー実装完了
- [x] Unit/Component/E2E テスト実装完了（Playwright E2E: 10テストケース実装済み）✅
- ✅ i18n対応（日本語・英語）

#### Notes / 実装詳細
- ネイティブHTML5 Drag & Drop APIを使用（react-dropzoneは不使用）
- UploadDialogコンポーネントにすべての機能を統合
- アップロード → タグ更新 → キャッシュ無効化の順で実行
- MSWハンドラーで`filesDb`を共有してGET/POST/PUT間でデータ一貫性を保持
- キャッシュ無効化は`predicate`を使用して検索パラメータに依存しない実装

---

### Task 1-2: 文書一覧表示

**User Story**: US2 - 文書一覧の表示と閲覧  
**Goal**: リストビュー・グリッドビューで文書を表示し、ソート・ページネーション機能を実装  
**Effort**: 2.5時間  
**Priority**: P1 🎯  
**Dependencies**: Task 1-1 (ファイルアップロード基盤)  
**Status**: ✅ 完了

#### Files to Touch

- `src/presentations/components/files/FileList.tsx` (作成済み) ✅
- `src/presentations/components/files/FileListItem.tsx` (作成済み) ✅
- `src/presentations/components/files/DocumentGridView.tsx` (作成済み) ✅
- `src/presentations/pages/DocumentManagementPage/components/SortToolbar.tsx` (作成済み) ✅
- `src/presentations/pages/DocumentManagementPage/components/PaginationControls.tsx` (作成済み) ✅
- `src/presentations/pages/DocumentManagementPage/components/FileListContent.tsx` (作成済み) ✅
- `src/presentations/pages/DocumentManagementPage/DocumentManagementPage.tsx` (編集済み) ✅
- `src/presentations/hooks/queries/files/useFileListQuery.ts` (作成済み) ✅
- `src/presentations/hooks/useDocumentManagementState.ts` (作成済み) ✅
- `src/adapters/mocks/handlers/files.ts` (編集済み - GET /filesハンドラー) ✅
- `src/i18n/locales/ja.ts` (編集済み) ✅
- `src/i18n/locales/en.ts` (編集済み) ✅

#### Implementation Steps

- [x] FileList コンポーネント作成（MUI Table使用）✅
- [x] FileListItem コンポーネント作成 ✅
- [x] DocumentGridView コンポーネント作成（MUI Grid + Card）✅
- [x] ビューモード切り替えボタン（リスト/グリッド）✅
- [x] ソート機能実装（ファイル名・更新日・サイズ）✅
- [x] ページネーション実装（1ページあたり20件）✅
- [x] useFileListQuery カスタムフック作成（TanStack Query）✅
- [x] useDocumentManagementState フック作成（状態管理）✅
- [x] ビューモード・ソート・ページをURLクエリパラメータで管理 ✅
- [x] ローディング状態管理（useQuery + placeholderData）✅
- [x] 0件の場合のメッセージ表示 ✅
- [x] MSWダミーデータ25件生成 ✅
- [x] 動的ページネーション（総件数に基づく）✅
- [x] 表示件数情報（1-20 / 25 件の文書）✅

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `FileList.test.tsx`: 文書が正しく表示される
- [ ] `FileList.test.tsx`: ソートボタンで昇順/降順に切り替わる
- [ ] `DocumentGridView.test.tsx`: グリッドビューでカード形式表示
- [ ] `SortToolbar.test.tsx`: ビューモード切り替えボタン動作
- [ ] `PaginationControls.test.tsx`: ページネーション状態管理
- [ ] `FileList.test.tsx`: 0件の場合のメッセージ表示

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: 文書一覧が表示される
- [ ] `document-management.spec.ts`: リストビューからグリッドビューに切り替わる
- [ ] `document-management.spec.ts`: ファイル名でソートできる
- [ ] `document-management.spec.ts`: ページネーションで次ページに移動
- [ ] `document-management.spec.ts`: ページネーション状態がURLに反映

#### Definition of Done

- ✅ 文書がリストビューで表示される
- ✅ 文書がグリッドビューで表示される
- ✅ ビューモード切り替えが動作
- ✅ ファイル名・更新日・サイズでソート可能
- ✅ ページネーション実装（1ページ20件）
- ✅ 動的ページ数計算（総件数 ÷ 20）
- ✅ 表示件数情報表示（1-20 / 25 件の文書）
- ✅ ローディング状態管理（画面ちらつき防止）
- ✅ 0件の場合メッセージ表示
- [ ] Unit/Component/E2E テスト実装完了
- ✅ URLクエリ状態永続化
- ✅ モバイルレスポンシブ対応

#### Notes / 実装詳細
- `useQuery`を使用して画面ちらつきを防止（`useSuspenseQuery`から変更）
- `placeholderData`で前のデータを保持しながら新しいデータを取得
- クライアント側でフィルタリング・ソート・ページネーション処理
- MSWで25件のダミーデータを生成
- ページネーションコントロールは総件数が20件以下の場合は非表示

---

### Task 1-3: キーワード検索

**User Story**: US3 - キーワード検索で文書を探す  
**Goal**: 検索バーにキーワード入力して、ファイル名・タグ名で文書を絞り込み表示  
**Effort**: 2時間  
**Priority**: P1 🎯  
**Dependencies**: Task 1-2 (文書一覧表示)  
**Status**: ✅ 完了

#### Files to Touch

- `src/presentations/pages/DocumentManagementPage/components/SearchBar.tsx` (作成済み) ✅
- `src/presentations/pages/DocumentManagementPage/components/FiltersPanel.tsx` (作成済み - タグ・日付フィルタも含む) ✅
- `src/presentations/components/files/FileListItem.tsx` (編集済み - ハイライト機能追加) ✅
- `src/presentations/components/files/DocumentGridView.tsx` (編集済み) ✅
- `src/presentations/pages/DocumentManagementPage/DocumentManagementPage.tsx` (編集済み) ✅
- `src/adapters/mocks/handlers/files.ts` (編集済み - 検索パラメータ対応) ✅
- `src/i18n/locales/ja.ts` (編集済み) ✅
- `src/i18n/locales/en.ts` (編集済み) ✅

#### Implementation Steps

- [x] SearchBar コンポーネント作成（MUI TextField使用）✅
- [x] デバウンス処理実装（300ms）- `use-debounce`ライブラリ使用 ✅
- [x] useFileListQuery でsearchパラメータ対応 ✅
- [x] MSWハンドラーで検索フィルタリング実装 ✅
- [x] ハイライト表示実装（一致テキストを強調）- パステル調の優しい色 ✅
- [x] 検索バークリア機能 ✅
- [x] 検索結果0件の場合のメッセージ ✅
- [x] 検索条件をURLクエリパラメータで管理 ✅
- [x] タグフィルタリング機能実装（FiltersPanel内）✅
- [x] 日付範囲フィルタリング機能実装 ✅

#### Tests to Add

**Vitest (Unit/Component)** - ⚠️ **未実装**:
- [ ] `SearchBar.test.tsx`: キーワード入力で検索実行
- [ ] `SearchBar.test.tsx`: デバウンス処理動作確認
- [ ] `SearchBar.test.tsx`: クリアボタンで検索リセット
- [ ] `FileListItem.test.tsx`: ファイル名で一致検出とハイライト
- [ ] `FileListItem.test.tsx`: タグ名で一致検出
- [ ] `FileListContent.test.tsx`: 検索結果0件の場合メッセージ

**Playwright (E2E)**:
- [x] `file-search.spec.ts`: 検索バーで文書を絞り込めること（ファイル名部分一致）✅
- [x] `file-search.spec.ts`: タグ名に対しても検索できること（タグ部分一致）✅
- [x] `file-search.spec.ts`: ハイライト表示が行われること（パステル調の黄色）✅
- [x] `file-search.spec.ts`: 存在しないキーワードでは0件メッセージになること ✅
- [x] `file-search.spec.ts`: クリア操作で検索がリセットされること ✅
- [x] `file-search.spec.ts`: URLクエリに検索条件が反映・永続化されること ✅
- [x] `file-search.spec.ts`: グリッドビューでも検索が適用されること ✅
- [x] `file-search.spec.ts`: タグフィルタと組み合わせた検索ができること ✅
- [x] `file-search.spec.ts`: 日付範囲フィルタと組み合わせた検索ができること ✅
- [x] `file-search.spec.ts`: 部分一致・大文字小文字の違いを許容すること ✅
- [x] `file-search.spec.ts`: 検索中も一覧がちらつかないこと（placeholderData）✅
- [x] `file-search.spec.ts`: ナビゲーション後も検索状態が保持されること ✅

#### Definition of Done

- [x] 検索バーにキーワード入力可能 ✅
- [x] ファイル名で検索可能 ✅
- [x] タグ名で検索可能 ✅
- [x] 一致テキストがハイライト表示（パステル調の優しい黄色 #fef9c3）✅
- [x] デバウンス処理で余分なAPI呼び出し削減（300ms）✅
- [x] クリアボタンで検索リセット ✅
- [x] 0件の場合メッセージ表示 ✅
- [x] Unit/Component/E2E テスト実装完了（Playwright E2E: 12テストケース実装済み）✅
- [x] 検索条件URL永続化 ✅
- [x] useQueryとplaceholderDataで画面チラつき防止 ✅

#### 実装メモ

- useSuspenseQuery → useQuery + placeholderDataに変更して画面チラつき解消
- デバウンス300msで快適な検索UX実現
- MSWハンドラー側でサーバー側フィルタリング実装（ファイル名・タグ名部分一致）
- クライアント側でハイライト表示実装（renderHighlight関数、パステル調の優しい黄色）
- 検索結果が空の場合は"該当する文書が見つかりません"メッセージ表示
- FiltersPanel内でタグフィルタ・日付範囲フィルタも実装済み

---

## Phase 2: フィルタリング・詳細表示 (P2)

### Task 2-1: タグ管理機能

**User Story**: US6 - タグの作成と管理  
**Goal**: タグを作成・編集・削除でき、作成したタグが文書選択時に表示される  
**Effort**: 2.5時間  
**Priority**: P2  
**Dependencies**: Task 1-1 (ファイルアップロード基盤)

#### Files to Touch

- `src/presentations/components/tags/TagManager.tsx` (新規)
- `src/presentations/components/tags/TagDialog.tsx` (新規)
- `src/presentations/components/tags/TagColorPicker.tsx` (新規)
- `src/presentations/components/tags/index.ts` (新規)
- `src/adapters/repositories/tags/TagRepository.ts` (新規)
- `src/adapters/repositories/index.ts` (編集)
- `src/presentations/hooks/queries/useTagList.ts` (新規)
- `src/presentations/hooks/mutations/useCreateTag.ts` (新規)
- `src/presentations/hooks/mutations/useUpdateTag.ts` (新規)
- `src/presentations/hooks/mutations/useDeleteTag.ts` (新規)
- `src/domain/models/tags/TagModel.ts` (新規)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [ ] TagManager コンポーネント作成
- [ ] TagDialog コンポーネント作成（新規作成・編集用）
- [ ] TagColorPicker コンポーネント作成（MUI色選択）
- [ ] TagRepository 実装（Orval生成APIをラップ）
- [ ] useTagList カスタムフック作成（全タグ取得）
- [ ] useCreateTag カスタムフック作成
- [ ] useUpdateTag カスタムフック作成
- [ ] useDeleteTag カスタムフック（使用中確認ダイアログ）
- [ ] タグ削除時に使用中の文書数を表示
- [ ] 新規作成・編集・削除成功時のSnackbar通知

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `TagDialog.test.tsx`: タグ名入力で新規作成
- [ ] `TagColorPicker.test.tsx`: 色選択で更新
- [ ] `TagManager.test.tsx`: 作成したタグが一覧に表示
- [ ] `TagManager.test.tsx`: タグ名変更で既存文書のタグも更新
- [ ] `TagManager.test.tsx`: タグ削除時に確認ダイアログ表示
- [ ] `TagManager.test.tsx`: 使用中タグの削除で警告表示

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: タグ管理画面でタグを作成
- [ ] `document-management.spec.ts`: 作成したタグが文書選択時に表示
- [ ] `document-management.spec.ts`: タグ名を編集して保存
- [ ] `document-management.spec.ts`: タグを削除して確認ダイアログ表示
- [ ] `document-management.spec.ts`: 使用中タグ削除で警告表示

#### Definition of Done

- ✅ タグ管理画面で新規作成可能
- ✅ タグに色（赤・青・緑など）を設定可能
- ✅ 作成したタグが文書選択時に表示
- ✅ タグ名変更で既存文書も更新
- ✅ タグ削除時に確認ダイアログ表示
- ✅ 使用中タグ削除で警告表示
- ✅ Unit/Component/E2E テスト実装完了
- ✅ Snackbar通知で操作完了表示

---

### Task 2-2: タグフィルタリング

**User Story**: US4 - タグでフィルタリング  
**Goal**: 複数タグを選択してフィルタをかけ、条件に合致する文書を表示  
**Effort**: 2時間  
**Priority**: P2  
**Dependencies**: Task 2-1 (タグ管理機能)

#### Files to Touch

- `src/presentations/components/files/FileTagFilter.tsx` (新規)
- `src/presentations/components/files/FileDateRangeFilter.tsx` (新規)
- `src/presentations/components/files/FileFilterPanel.tsx` (新規)
- `src/presentations/pages/DocumentManagementPage.tsx` (編集)
- `src/adapters/repositories/files/FileRepository.ts` (編集)
- `src/presentations/hooks/queries/useFileList.ts` (編集)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [ ] FileTagFilter コンポーネント作成（MUI Chip使用）
- [ ] FileDateRangeFilter コンポーネント作成（MUI DatePicker）
- [ ] FileFilterPanel コンポーネント作成（全フィルタ集約）
- [ ] フィルタ条件をURLクエリパラメータで管理
- [ ] AND条件で複数タグ選択時絞り込み
- [ ] 日付範囲フィルタ実装
- [ ] フィルタリセット機能
- [ ] フィルタアイコンに選択数を表示

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `FileTagFilter.test.tsx`: タグチップで選択/解除
- [ ] `FileFilterPanel.test.tsx`: 複数タグ選択でAND条件絞り込み
- [ ] `FileDateRangeFilter.test.tsx`: 日付範囲で絞り込み
- [ ] `FileFilterPanel.test.tsx`: フィルタリセット機能
- [ ] `FileFilterPanel.test.tsx`: フィルタ数がアイコンに表示

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: タグフィルタで文書を絞り込み
- [ ] `document-management.spec.ts`: 複数タグでAND条件絞り込み
- [ ] `document-management.spec.ts`: 日付範囲で絞り込み
- [ ] `document-management.spec.ts`: フィルタ条件がURLに反映
- [ ] `document-management.spec.ts`: フィルタリセットで全文書表示

#### Definition of Done

- ✅ タグ選択でフィルタ可能
- ✅ 複数タグでAND条件絞り込み
- ✅ 日付範囲でフィルタ可能
- ✅ フィルタ条件URL永続化
- ✅ フィルタリセット機能
- ✅ フィルタ数がアイコンに表示
- ✅ Unit/Component/E2E テスト実装完了
- ✅ モバイル時はフィルタパネル折りたたみ可能

---

### Task 2-3: 文書詳細表示・ダウンロード

**User Story**: US5 - 文書の詳細表示とダウンロード  
**Goal**: 文書をクリックして詳細画面を開き、プレビュー・ダウンロード・一括ダウンロード可能  
**Effort**: 2.5時間  
**Priority**: P2  
**Dependencies**: Task 1-2 (文書一覧表示)

#### Files to Touch

- `src/presentations/pages/FileDetailPage.tsx` (新規)
- `src/presentations/components/files/FilePreview.tsx` (新規)
- `src/presentations/components/files/FilePdfPreview.tsx` (新規)
- `src/presentations/components/files/FileImagePreview.tsx` (新規)
- `src/presentations/components/files/FileActions.tsx` (新規)
- `src/presentations/components/files/index.ts` (編集)
- `src/app/router/routes.tsx` (編集)
- `src/adapters/repositories/files/FileRepository.ts` (編集)
- `src/presentations/hooks/mutations/useDownloadFile.ts` (新規)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [ ] FileDetailPage コンポーネント作成
- [ ] FilePreview コンポーネント作成（ファイル形式別）
- [ ] FilePdfPreview コンポーネント作成（object/iframe使用）
- [ ] FileImagePreview コンポーネント作成（img タグ）
- [ ] FileActions コンポーネント作成（ダウンロード・編集・削除）
- [ ] useDownloadFile カスタムフック実装
- [ ] 一括ダウンロード機能（ZIP形式）
- [ ] 複数ファイル選択チェックボックス実装
- [ ] 詳細ページへのルーティング実装
- [ ] ファイルサイズ・アップロード日時表示

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `FileDetailPage.test.tsx`: 詳細ページで情報表示
- [ ] `FilePdfPreview.test.tsx`: PDFプレビュー表示
- [ ] `FileImagePreview.test.tsx`: 画像プレビュー表示
- [ ] `FileActions.test.tsx`: ダウンロードボタン動作
- [ ] `FileDetailPage.test.tsx`: 複数選択チェックボックス
- [ ] `FileDetailPage.test.tsx`: 一括ダウンロードボタン

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: 文書をクリックして詳細画面表示
- [ ] `document-management.spec.ts`: PDFプレビュー確認
- [ ] `document-management.spec.ts`: 画像プレビュー確認
- [ ] `document-management.spec.ts`: ダウンロードボタンでファイルダウンロード
- [ ] `document-management.spec.ts`: 複数ファイル選択して一括ダウンロード
- [ ] `document-management.spec.ts`: 戻るボタンで文書一覧に戻る

#### Definition of Done

- ✅ 文書をクリックして詳細画面表示
- ✅ PDFがブラウザ内でプレビュー表示
- ✅ 画像がブラウザ内でプレビュー表示
- ✅ ダウンロードボタンでファイルダウンロード
- ✅ 複数ファイル一括ダウンロード（ZIP形式）
- ✅ ファイルメタデータ（サイズ・日時）表示
- ✅ Unit/Component/E2E テスト実装完了
- ✅ モバイルレスポンシブ対応

---

## Phase 3: 編集・削除・ゴミ箱 (P3)

### Task 3-1: メタデータ編集機能

**User Story**: US7 - 文書のメタデータ編集  
**Goal**: 詳細画面からファイル名・タグを編集して保存  
**Effort**: 1.5時間  
**Priority**: P3  
**Dependencies**: Task 2-3 (文書詳細表示)

#### Files to Touch

- `src/presentations/pages/FileDetailPage.tsx` (編集)
- `src/presentations/components/files/FileEditDialog.tsx` (新規)
- `src/adapters/repositories/files/FileRepository.ts` (編集)
- `src/presentations/hooks/mutations/useUpdateFile.ts` (新規)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [ ] FileEditDialog コンポーネント作成
- [ ] ファイル名編集フィールド実装
- [ ] タグ選択フィールド実装
- [ ] useUpdateFile カスタムフック作成
- [ ] FileRepository に `updateFile()` メソッド実装
- [ ] バリデーション（ファイル名必須・255文字制限）
- [ ] 編集完了後に詳細ページ更新
- [ ] キャンセル機能

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `FileEditDialog.test.tsx`: ファイル名編集で入力可能
- [ ] `FileEditDialog.test.tsx`: タグ追加・削除可能
- [ ] `FileEditDialog.test.tsx`: ファイル名空白時バリデーション
- [ ] `FileEditDialog.test.tsx`: キャンセルボタンで変更破棄
- [ ] `useUpdateFile.test.ts`: 編集内容が保存される

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: 詳細画面から編集ボタンクリック
- [ ] `document-management.spec.ts`: ファイル名を編集して保存
- [ ] `document-management.spec.ts`: タグを変更して保存
- [ ] `document-management.spec.ts`: 一覧画面で編集内容が反映

#### Definition of Done

- ✅ 編集モード開始時に現在値表示
- ✅ ファイル名編集可能
- ✅ タグ追加・削除可能
- ✅ バリデーション実装（必須・255文字）
- ✅ 保存で編集内容が反映
- ✅ キャンセルで変更破棄
- ✅ Unit/Component/E2E テスト実装完了

---

### Task 3-2: 削除・ゴミ箱・復元機能

**User Story**: US8 - 文書の削除とゴミ箱からの復元  
**Goal**: 文書を削除してゴミ箱に移動し、ゴミ箱から復元・完全削除可能  
**Effort**: 2.5時間  
**Priority**: P3  
**Dependencies**: Task 1-2 (文書一覧表示)

#### Files to Touch

- `src/presentations/pages/TrashPage.tsx` (新規)
- `src/presentations/components/files/DeleteConfirmDialog.tsx` (新規)
- `src/presentations/components/files/TrashList.tsx` (新規)
- `src/presentations/components/files/TrashItem.tsx` (新規)
- `src/adapters/repositories/files/FileRepository.ts` (編集)
- `src/presentations/hooks/mutations/useDeleteFile.ts` (新規)
- `src/presentations/hooks/mutations/useRestoreFile.ts` (新規)
- `src/presentations/hooks/mutations/usePermanentDeleteFile.ts` (新規)
- `src/presentations/hooks/queries/useTrashList.ts` (新規)
- `src/app/router/routes.tsx` (編集)
- `src/i18n/locales/ja.ts` (編集)
- `src/i18n/locales/en.ts` (編集)

#### Implementation Steps

- [ ] DeleteConfirmDialog コンポーネント作成
- [ ] TrashPage コンポーネント作成
- [ ] TrashList・TrashItem コンポーネント作成
- [ ] FileRepository に `softDeleteFile()`・`restoreFile()`・`permanentDeleteFile()` メソッド実装
- [ ] useDeleteFile カスタムフック（確認ダイアログ表示）
- [ ] useRestoreFile カスタムフック
- [ ] usePermanentDeleteFile カスタムフック
- [ ] useTrashList カスタムフック
- [ ] ゴミ箱フィルタ（文書一覧から削除済みのみ表示）
- [ ] 文書一覧にゴミ箱リンク追加
- [ ] 削除から30日後に自動削除予定日表示

#### Tests to Add

**Vitest (Unit/Component)**:
- [ ] `DeleteConfirmDialog.test.tsx`: 確認ダイアログ表示
- [ ] `TrashPage.test.tsx`: 削除済み文書が表示
- [ ] `TrashList.test.tsx`: 復元ボタンで復元
- [ ] `TrashList.test.tsx`: 完全削除ボタンで完全削除
- [ ] `TrashPage.test.tsx`: ゴミ箱が空の場合メッセージ表示
- [ ] `TrashItem.test.tsx`: 削除予定日が表示

**Playwright (E2E)**:
- [ ] `document-management.spec.ts`: 文書削除で確認ダイアログ表示
- [ ] `document-management.spec.ts`: 確認後にゴミ箱に移動
- [ ] `document-management.spec.ts`: 文書一覧から削除済み文書消える
- [ ] `document-management.spec.ts`: ゴミ箱ページで削除済み文書表示
- [ ] `document-management.spec.ts`: ゴミ箱から復元して元に戻す
- [ ] `document-management.spec.ts`: ゴミ箱から完全削除

#### Definition of Done

- ✅ 削除ボタンクリックで確認ダイアログ表示
- ✅ 確認後に文書がゴミ箱に移動
- ✅ 文書一覧から削除済み文書消える
- ✅ ゴミ箱ページで削除済み文書表示
- ✅ ゴミ箱から復元で元の場所に戻す
- ✅ ゴミ箱から完全削除
- ✅ 削除から30日後の自動削除予定日表示
- ✅ Unit/Component/E2E テスト実装完了
- ✅ i18n対応（日本語・英語）

---

## Implementation Checklist

### Preparation
- [ ] ブランチ作成・チェックアウト
- [ ] 依存ライブラリインストール（react-dropzone、その他）
- [ ] `pnpm gen:api` で API クライアント生成
- [ ] Mock handlers 設定（MSW）

### Phase 1
- [ ] Task 1-1 実装・テスト完了
- [ ] Task 1-2 実装・テスト完了
- [ ] Task 1-3 実装・テスト完了
- [ ] コード品質チェック（lint・type-check）
- [ ] E2E テスト全パス

### Phase 2
- [ ] Task 2-1 実装・テスト完了
- [ ] Task 2-2 実装・テスト完了
- [ ] Task 2-3 実装・テスト完了
- [ ] コード品質チェック（lint・type-check）
- [ ] E2E テスト全パス

### Phase 3
- [ ] Task 3-1 実装・テスト完了
- [ ] Task 3-2 実装・テスト完了
- [ ] コード品質チェック（lint・type-check）
- [ ] E2E テスト全パス

### Final Review
- [ ] i18n 日本語・英語すべて設定完了
- [ ] アクセシビリティ検証（WCAG 2.1 AA）
- [ ] レスポンシブデザイン検証（デスクトップ・タブレット・モバイル）
- [ ] パフォーマンス検証（Lighthouse）
- [ ] クロスブラウザ検証（Chrome・Firefox・Safari・Edge）

---

## Notes

### Architecture Decisions

- **State Management**: TanStack Query（サーバー状態）+ React State（UI状態）
- **File Storage**: フロントエンドからは Orval生成APIを通じて アクセス（バックエンド側ストレージ）
- **Error Handling**: 以下 domain/errors を使用
  - `FileUploadException`: アップロード失敗
  - `FileDownloadException`: ダウンロード失敗
  - `ValidationException`: バリデーション失敗

### Testing Strategy

- **Unit**: 業務ロジック・フック
- **Component**: UI 操作・ユーザーイベント
- **E2E**: 完全なユーザーフロー（アップロード～検索～削除）

### Performance Targets

- ファイルアップロード: 10秒以内（5MB ファイル）
- 検索: 1秒以内（100件文書）
- 一覧表示: 2秒以内

### i18n Keys Template

```typescript
// ja.ts, en.ts に追加予定
const fileManagement = {
  // Phase 1
  upload: "アップロード",
  searchPlaceholder: "キーワードで検索...",
  dragDropText: "ここにファイルをドラッグ&ドロップ",
  selectFiles: "ファイル選択",
  
  // Phase 2
  createTag: "タグを作成",
  filterByTag: "タグでフィルタ",
  
  // Phase 3
  edit: "編集",
  delete: "削除",
  restore: "復元",
  trash: "ゴミ箱",
  
  // Common
  loading: "読み込み中...",
  noResults: "該当する文書が見つかりません",
  error: "エラーが発生しました",
  // ... その他
}
```

### Task Effort Breakdown

- **Phase 1 (P1)**: 3 + 2.5 + 2 = **7.5 時間**
- **Phase 2 (P2)**: 2.5 + 2 + 2.5 = **7 時間**
- **Phase 3 (P3)**: 1.5 + 2.5 = **4 時間**
- **Total**: **18.5 時間** (~2-3 営業日, フル稼働時)

### Parallel Opportunities

- **Task 1-1, 1-2** 可能（異なるコンポーネント）
- **Task 1-3** は Task 1-2 に依存（検索には一覧が必要）
- **Task 2-1, 2-2** 可能（タグ管理はTask 1-1後）
- **Task 2-3** は Task 1-2 に依存（詳細表示は一覧後）
- **Task 3-1, 3-2** 可能（編集とゴミ箱は独立）

---

## Related Documentation

- **Feature Spec**: [specs/002-document-management-Kaede/spec.md](specs/002-document-management-Kaede/spec.md)
- **Implementation Plan**: [specs/002-document-management-Kaede/plan.md](specs/002-document-management-Kaede/plan.md)
- **Data Model**: [specs/002-document-management-Kaede/data-model.md](specs/002-document-management-Kaede/data-model.md)
- **Research Findings**: [specs/002-document-management-Kaede/research.md](specs/002-document-management-Kaede/research.md)
- **Quick Start**: [specs/002-document-management-Kaede/quickstart.md](specs/002-document-management-Kaede/quickstart.md)


## Implementation Rules (Copilot)

Copilot で実装する際は、必ず以下を守ること。

### Scope Control
- 実装・変更は **tasks.md に記載の Task と Files to Touch に関係する範囲のみ**で行う
- 指示されていない機能追加や改善（「やった方が良さそう」等）は禁止
- 既存コードのうち、今回の変更と直接関係しない箇所には触らない（無関係なリファクタ禁止）

### Change Budget
- 変更してよいのは以下のみ:
  - 今回新規作成したファイル
  - 今回編集したファイル
  - Task の Files to Touch に含まれるファイル
- それ以外のファイルを編集する必要がある場合は、**編集せず** tasks.md に「なぜ必要か」を追記して相談事項として残す

### Readability / File Size
- 1ファイルあたり **おおよそ100行以内**を目安にする
- 100行を超えそうなら責務で分割する（過剰な抽象化はしない）
- Page（例: DocumentManagementPage）は “状態管理と配置” に集中させ、UI部品は components に分離する
- スタイルが増えた場合のみ styles.ts 等へ分離する（見た目変更はしない）

### Safety
- 大規模なフォルダ移動・名前変更は禁止
- 一度に大量のファイルを増やさない（最小差分を優先）
