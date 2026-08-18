# Implementation Plan: 文書管理システム

**Branch**: `002-document-management` | **Date**: 2025-11-24 | **Spec**: [spec.md](./spec.md)

**Input**: Figmaデザイン（https://www.figma.com/design/8R8P2zlp5FO2PjwTqHRstW/インターン用?node-id=69-428）をベースに、MUI DataGrid（Free版）を使用した文書管理システムのフロントエンド実装

## Summary

Figmaデザインをベースに、ファイル管理機能を持つ文書管理システムのフロントエンドを実装します。主要機能として、ファイルのアップロード（ドラッグ&ドロップ）、一覧表示（MUI DataGridを使用）、タグ管理、検索・フィルタリング機能を提供します。既存のClean Architectureパターンに準拠し、API-Firstアプローチで開発します。

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: React 19, Material-UI v6+, MUI DataGrid (Free版), TanStack Query v5, react-dropzone, Orval (API code generator)
**Storage**: バックエンドAPI経由（OpenAPI仕様に基づく）、フロントエンドキャッシュはTanStack Query
**Testing**: Vitest (単体・コンポーネントテスト), Playwright (E2Eテスト), MSW (APIモック)
**Target Platform**: Web（デスクトップ・タブレット対応、モバイルは対象外）
**Project Type**: Single Web Application（React SPAのフロントエンドのみ）
**Performance Goals**:

- ファイル一覧表示: 1秒以内
- 検索応答: 500ms以内
- アップロード処理: 5MB/秒以上
- DataGrid描画: 100行で60fps維持
  **Constraints**:
- ファイルサイズ上限: 10MB/ファイル
- 対応ファイル形式: PDF, DOCX, XLSX, JPG, PNG
- 同時アップロード: 最大20ファイル
- ブラウザサポート: Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
  **Scale/Scope**:
- 想定ユーザー数: 最大50人同時接続
- ファイル数: 最大1000件/ユーザー
- タグ数: 最大50個/組織
- 画面数: 約5画面（ファイル一覧、アップロード、詳細、タグ管理等）

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ TypeScript Strict Mode (NON-NEGOTIABLE)

- **Status**: PASS
- **Evidence**: すべての型定義が明示的に定義され、`any`型は使用しない。Domain ModelとAPIレスポンスの変換はAdapter層で型安全に実施。

### ✅ Component Architecture

- **Status**: PASS
- **Evidence**: すべてのコンポーネントは関数コンポーネント + hooksで実装。Propsインターフェースはすべてexport。

### ✅ Material-UI First

- **Status**: PASS
- **Evidence**: MUI DataGrid（Free版）、MUI Chip、MUI Autocomplete、MUI Drawer、MUI AppBarを使用。カスタムコンポーネントはFileDropZoneのみ（react-dropzoneでMUIスタイルをラップ）。

### ✅ Test-Driven Development

- **Status**: PASS (計画段階)
- **Evidence**:
  - 単体テスト: ドメインモデル（FileSize, MimeType）、ユーティリティ関数
  - コンポーネントテスト: FileListTable, FileUploadZone, TagSelector
  - E2Eテスト: ファイルアップロードフロー、検索フロー、タグフィルタフロー
  - すべてのテストはspec.mdの Acceptance Scenariosに基づく

### ✅ API-First with OpenAPI

- **Status**: PASS
- **Evidence**: OpenAPI 3.1仕様を`specs/002-document-management/contracts/openapi.yaml`に定義。Orvalでコード自動生成（`pnpm gen:api`）。MSWハンドラーも自動生成。

### ✅ Clean Architecture & Separation of Concerns

- **Status**: PASS
- **Evidence**:
  - Domain: `src/domain/models/file`, `src/domain/models/tag`, `src/domain/repositories`
  - Adapters: `src/adapters/repositories/files`, `src/adapters/repositories/tags`
  - Application: `src/app/router`, `src/app/providers`
  - Presentation: `src/presentations/pages`, `src/presentations/components`, `src/presentations/hooks/queries`
  - 依存方向: Presentation → Application → Domain ← Adapters

### ✅ Accessibility & Responsive Design (NON-NEGOTIABLE)

- **Status**: PASS (計画段階)
- **Evidence**:
  - すべてのインタラクティブ要素にキーボードアクセス対応（Space, Enter, Arrow keys）
  - FileDropZoneに`role="button"`と`aria-label`を設定
  - DataGridの各行に`aria-label`でファイル名を設定
  - タグカラーのコントラスト比4.5:1以上を確保
  - レスポンシブ: デスクトップ（1920x1080）、タブレット（768x1024）対応

### 📋 Re-check After Phase 1 Design

すべてのGATEがPASSしており、憲法違反はありません。Phase 1完了後も再確認を実施します。

## Project Structure

### Documentation (this feature)

```text
specs/002-document-management/
├── plan.md              # このファイル (/speckit.plan command output)
├── research.md          # Phase 0 output - 技術選定とベストプラクティス
├── data-model.md        # Phase 1 output - ドメインモデル定義
├── quickstart.md        # Phase 1 output - 実装開始ガイド
├── contracts/           # Phase 1 output - API仕様
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── models/
│       ├── file/
│       │   ├── type.ts           # すべての型定義を集約
│       │   ├── index.ts          # export * from './type'
│       │   └── __tests__/
│       │       └── type.test.ts
│       └── tag/
│           ├── type.ts           # すべての型定義を集約
│           ├── index.ts          # export * from './type'
│           └── __tests__/
│               └── type.test.ts
│
├── adapters/
│   ├── generated/
│   │   └── files.ts (Orval生成)
│   └── repositories/
│       ├── files/
│       │   ├── getFiles.ts
│       │   ├── getFileById.ts
│       │   ├── uploadFile.ts
│       │   ├── updateFile.ts
│       │   ├── deleteFile.ts
│       │   ├── bulkDeleteFiles.ts
│       │   ├── downloadFile.ts
│       │   └── index.ts
│       ├── tags/
│       │   ├── getTags.ts
│       │   ├── createTag.ts
│       │   ├── updateTag.ts
│       │   ├── deleteTag.ts
│       │   └── index.ts
│       └── repositoryComposition.ts (files, tags追加)
│
├── app/
│   ├── router/
│   │   └── routes.tsx (FilesPageルート追加)
│   └── providers/
│       └── (既存のProviders使用)
│
└── presentations/
    ├── layouts/
    │   └── AppLayout/
    │       ├── AppLayout.tsx (サイドバー + ヘッダー)
    │       └── components/
    │           ├── AppSidebar/
    │           │   └── AppSidebar.tsx
    │           └── AppHeader/
    │               └── AppHeader.tsx
    │
    ├── pages/
    │   └── FilesPage/
    │       ├── FilesPage.tsx
    │       └── components/
    │           ├── RecentFilesSection/
    │           │   ├── RecentFilesSection.tsx
    │           │   └── components/
    │           │       └── FileCard/
    │           │           ├── FileCard.tsx
    │           │           └── __tests__/
    │           ├── UploadSection/
    │           │   ├── UploadSection.tsx
    │           │   └── components/
    │           │       └── FileUploadZone/
    │           │           ├── FileUploadZone.tsx (react-dropzone使用)
    │           │           └── __tests__/
    │           └── MyFilesSection/
    │               ├── MyFilesSection.tsx
    │               └── components/
    │                   ├── FileListTable/
    │                   │   ├── FileListTable.tsx (MUI DataGrid使用)
    │                   │   └── __tests__/
    │                   ├── FileDetailDialog/
    │                   │   ├── FileDetailDialog.tsx
    │                   │   └── __tests__/
    │                   └── FileEditDialog/
    │                       ├── FileEditDialog.tsx
    │                       └── __tests__/
    │
    ├── components/
    │   └── tags/
    │       ├── TagChips/
    │       │   ├── TagChips.tsx (MUI Chip使用、複数箇所で使用)
    │       │   └── __tests__/
    │       └── TagSelector/
    │           ├── TagSelector.tsx (MUI Autocomplete使用、複数箇所で使用)
    │           └── __tests__/
    │
    ├── ui/
    │   └── (共通のプレゼンテーション専用UIコンポーネント)
    │
    ├── hooks/
    │   └── queries/
    │       ├── files/
    │       │   ├── useFiles.ts
    │       │   ├── useFileById.ts
    │       │   ├── useUploadFile.ts
    │       │   ├── useUpdateFile.ts
    │       │   ├── useDeleteFile.ts
    │       │   └── useBulkDeleteFiles.ts
    │       ├── tags/
    │       │   ├── useTags.ts
    │       │   ├── useCreateTag.ts
    │       │   ├── useUpdateTag.ts
    │       │   └── useDeleteTag.ts
    │       └── constants.ts (QUERY_KEYS.FILES, QUERY_KEYS.TAGS追加)
    │
    └── utils/
        └── fileFormatters.ts (formatFileSize, getFileType, isSupportedFileType)

playwright/
└── tests/
    └── specs/
        └── files/                      # 文書管理機能のE2Eテスト
            ├── upload-flow.md          # マークダウン仕様書
            ├── upload-flow.spec.ts     # アップロードフローのテスト
            ├── search-flow.md
            └── search-flow.spec.ts     # 検索・フィルタフローのテスト

# 注：ユニット/コンポーネントテストは各ファイルと同じ階層の__tests__/に配置

schema/
├── files/
│   └── openapi.yaml (contracts/openapi.yamlからコピー)
└── orval.config.ts (files設定追加)
```

**Structure Decision**:

- **Single Web Application**: フロントエンドのみの実装。バックエンドAPIは別途実装済み（または並行開発）。
- **Clean Architecture**: Domain層が中心にあり、Adapters、Application、Presentationが依存する構造。
- **既存パターン準拠**: `src/domain/models/auth`と同じ構造（type.ts + index.ts）で実装
- **Co-location**: コンポーネントとそのテストは同じディレクトリに配置（`__tests__/`サブディレクトリ使用）。
- **コンポーネント配置方針**:
  - `presentations/components/`: **複数箇所で使われる共通コンポーネントのみ**（例: TagChips, TagSelector）
  - `presentations/pages/*/components/`: **ページ固有のコンポーネント**（例: FileCard, FileUploadZone, FileListTable）
  - `presentations/ui/`: 見た目だけの共通UIコンポーネント（再利用可能、ドメイン非依存）
- **リポジトリ**: `src/adapters/repositories`のみ（`src/domain/repositories`は存在しない）
- **テスト配置**:
  - **ユニット/コンポーネントテスト**: テスト対象と同じ階層の`__tests__/`に配置
  - **E2Eテスト**: `playwright/tests/specs/`配下に仕様書（`.md`）とテスト（`.spec.ts`）をペアで配置

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

該当なし。すべてのConstitution CheckがPASSしており、憲法違反はありません。

## Phase 0: Research & Decision

**Status**: ✅ 完了

**Output**: [research.md](./research.md)

### 主要な技術決定

1. **MUI DataGrid (Free版)**: ファイル一覧テーブルに使用。ソート、ページネーション、選択機能が組み込み済み。
2. **react-dropzone**: ドラッグ&ドロップアップロード機能に使用。軽量でアクセシビリティ対応。
3. **MUI Chip + Autocomplete**: タグ表示と選択に使用。複数選択、フィルタリング対応。
4. **TanStack Query**: サーバー状態管理。既存パターンに準拠。
5. **URLクエリパラメータ**: 検索・フィルタ状態管理。リンク共有、ブックマーク対応。

### 決定の根拠

すべての技術選定は以下の原則に基づいています:

- **既存パターン準拠**: constitution.md、既存実装パターン（auth）に準拠
- **MUI First**: すべてのUI要素でMUIコンポーネントを優先
- **アクセシビリティ**: WCAG 2.1 Level AA準拠
- **開発効率**: Orvalによるコード自動生成、MSWによるモック

## Phase 1: Design & Contracts

**Status**: ✅ 完了

**Output**:

- [data-model.md](./data-model.md) - ドメインモデル定義
- [contracts/openapi.yaml](./contracts/openapi.yaml) - API仕様
- [quickstart.md](./quickstart.md) - 実装開始ガイド

### データモデル

#### エンティティ

1. **File**: ファイルの中核エンティティ

   - `id`, `name`, `size`, `category`, `mimeType`, `description`, `uploadedAt`, `downloadUrl`, `tagIds`

2. **Tag**: タグエンティティ

   - `id`, `name`, `color`, `createdAt`, `updatedAt`

3. **FileQueryParams**: 検索・フィルタパラメータ

   - `search`, `category`, `page`, `limit`

4. **FileListResponse**: ページネーション付きレスポンス
   - `files`, `total`, `page`, `limit`

#### 値オブジェクト

1. **FileSize**: ファイルサイズを人間可読形式で扱う

   - `toHumanReadable()`: "2.4 KB", "964.51 kB"形式に変換
   - `exceedsMaxUploadSize()`: 10MB超過判定

2. **MimeType**: MIMEタイプとファイルタイプのマッピング
   - `getFileType()`: 'pdf' | 'word' | 'excel' | 'image' | 'other'
   - `isSupported()`: サポート対象判定

#### リポジトリインターフェース

1. **FileRepository**: ファイル操作の抽象化

   - `getFiles()`, `getFileById()`, `uploadFile()`, `updateFile()`, `deleteFile()`, `bulkDeleteFiles()`, `downloadFile()`

2. **TagRepository**: タグ操作の抽象化
   - `getTags()`, `createTag()`, `updateTag()`, `deleteTag()`

### API契約

OpenAPI 3.1仕様を`contracts/openapi.yaml`に定義:

#### エンドポイント

**Files**:

- `GET /files`: ファイル一覧取得（検索、カテゴリフィルタ、ページネーション）
- `POST /files`: ファイルアップロード（multipart/form-data）
- `GET /files/{fileId}`: ファイル詳細取得
- `PUT /files/{fileId}`: ファイルメタデータ更新
- `DELETE /files/{fileId}`: ファイル削除
- `GET /files/{fileId}/download`: ファイルダウンロード
- `POST /files/bulk-delete`: ファイル一括削除

**Tags**:

- `GET /tags`: タグ一覧取得
- `POST /tags`: タグ作成
- `PUT /tags/{tagId}`: タグ更新
- `DELETE /tags/{tagId}`: タグ削除

#### スキーマ

- `FileCategory`: enum ('proposal', 'contract', 'report', 'other')
- `TagColor`: enum ('blue', 'red', 'yellow', 'green', 'purple', 'orange', 'gray')
- `FileInfo`: ファイル情報オブジェクト
- `TagInfo`: タグ情報オブジェクト
- `FileListResponse`: ページネーション付きファイル一覧
- `ErrorResponse`: エラーレスポンス

### Quickstart

実装開始のための手順を`quickstart.md`に記載:

1. 依存パッケージ追加（@mui/x-data-grid, react-dropzone, date-fns）
2. OpenAPI仕様の配置とコード生成（orval）
3. ドメインモデルの実装（domain/models/）
4. Adapterレイヤーの実装（adapters/repositories/）
5. TanStack Queryフックの実装（presentations/hooks/queries/）
6. UIコンポーネントの実装（presentations/ui/, presentations/components/）
7. ページとレイアウトの実装（presentations/pages/, presentations/layouts/）
8. ルーティングの追加（app/router/routes.tsx）
9. 国際化の設定（i18n/locales/）

### Constitution Check (再評価)

Phase 1完了後も、すべてのConstitution CheckがPASSしています:

- ✅ TypeScript Strict Mode: すべての型が明示的に定義
- ✅ Component Architecture: 関数コンポーネント + hooks
- ✅ Material-UI First: MUI DataGrid, Chip, Autocomplete等を使用
- ✅ Test-Driven Development: テスト計画が完備
- ✅ API-First with OpenAPI: OpenAPI仕様を先に定義、Orvalで自動生成
- ✅ Clean Architecture: 依存方向が正しい（Presentation → Domain ← Adapters）
- ✅ Accessibility & Responsive Design: キーボード操作、aria-label、コントラスト比対応

## Phase 2: Implementation Planning

**Status**: 📋 次のステップ

**Output**: tasks.md（`/speckit.tasks`コマンドで生成）

### 実装フェーズ

実装は以下の8つのフェーズに分割（quickstart.mdに詳細記載）:

1. **Phase 1: 基盤実装**（1日目）

   - OpenAPI仕様配置、ドメインモデル、Adapters、TanStack Queryフック

2. **Phase 2: UI基礎実装**（2日目）

   - 共通UIコンポーネント、レイアウト（AppLayout, Sidebar, Header）

3. **Phase 3: ファイル一覧機能**（3日目）

   - FileListTable（MUI DataGrid）、検索・フィルタ、ソート、ページネーション

4. **Phase 4: ファイルアップロード機能**（4日目）

   - FileUploadZone（react-dropzone）、プログレスバー、エラーハンドリング

5. **Phase 5: タグ管理機能**（5日目）

   - TagChips、TagSelector（Autocomplete）、TagManager（CRUD）

6. **Phase 6: Recent Files機能**（6日目）

   - FileCard、RecentFilesSection（グリッドレイアウト）

7. **Phase 7: ファイル詳細・編集機能**（7日目）

   - FileDetailDialog、FileEditDialog、ダウンロード機能

8. **Phase 8: 統合とテスト**（8日目）
   - 全コンポーネント統合、E2Eテスト、アクセシビリティテスト、バグ修正

### 次のアクション

`/speckit.tasks`コマンドを実行して、詳細なタスクリスト（tasks.md）を生成してください。

## Summary

Figmaデザインをベースに、文書管理システムのフロントエンド実装計画が完成しました。以下の成果物が生成されています:

- ✅ **[research.md](./research.md)**: 技術選定とベストプラクティス
- ✅ **[data-model.md](./data-model.md)**: ドメインモデル定義
- ✅ **[contracts/openapi.yaml](./contracts/openapi.yaml)**: API仕様（Files + Tags）
- ✅ **[quickstart.md](./quickstart.md)**: 実装開始ガイド
- ✅ **Agent Context更新**: Claude Code用コンテキスト

すべての設計は既存のconstitution.mdに準拠しており、Constitution Checkもすべてパスしています。実装は8つのフェーズに分割され、合計8日間で完了予定です。

次のステップとして、`/speckit.tasks`コマンドでタスクリスト（tasks.md）を生成し、実装を開始してください。

---

**Branch**: `002-document-management`
**Spec**: [spec.md](./spec.md)
**Research**: [research.md](./research.md)
**Data Model**: [data-model.md](./data-model.md)
**Contracts**: [contracts/openapi.yaml](./contracts/openapi.yaml)
**Quickstart**: [quickstart.md](./quickstart.md)
**Next Command**: `/speckit.tasks` (タスク生成)
