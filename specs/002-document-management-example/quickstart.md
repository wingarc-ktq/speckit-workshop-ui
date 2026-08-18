# Quickstart: 文書管理システム実装

**Feature Branch**: `002-document-management`
**Date**: 2025-11-24

## 概要

このガイドは、文書管理システムのフロントエンド実装を開始するための手順を説明します。既存のClean Architectureパターンに従い、API-Firstアプローチで実装します。

## 前提条件

- Node.js v22以上
- pnpm v10.12.4以上
- 既存の認証機能（001-user-auth）が実装済み

## セットアップ手順

### 1. 依存パッケージの追加

```bash
# MUI DataGrid（Free版）
pnpm add @mui/x-data-grid

# ファイルアップロード
pnpm add react-dropzone

# 日付フォーマット
pnpm add date-fns
```

### 2. OpenAPI仕様の配置とコード生成

```bash
# OpenAPI仕様をschema/files/ディレクトリにコピー
cp specs/002-document-management/contracts/openapi.yaml schema/files/openapi.yaml

# orval設定を更新（schema/orval.config.ts）
# 以下の設定を追加:
# files: {
#   output: {
#     mode: 'single',
#     target: '../src/adapters/generated/files.ts',
#     mock: true,
#     override: {
#       mutator: {
#         path: '../src/adapters/axios.ts',
#         name: 'customInstance',
#       },
#     },
#   },
#   input: {
#     target: './files/openapi.yaml',
#   },
# }

# API クライアントコードを生成
pnpm gen:api
```

### 3. ドメインモデルの実装

```bash
# ディレクトリ構造を作成
mkdir -p src/domain/models/file
mkdir -p src/domain/models/tag

# 以下のファイルを実装:
# File関連:
# - src/domain/models/file/type.ts    # すべての型定義を集約
# - src/domain/models/file/index.ts   # export * from './type'

# Tag関連:
# - src/domain/models/tag/type.ts     # すべての型定義を集約
# - src/domain/models/tag/index.ts    # export * from './type'

# 注意: 既存のsrc/domain/models/authと同じ構造に準拠
```

### 4. Adapterレイヤーの実装

```bash
# ディレクトリ構造を作成
mkdir -p src/adapters/repositories/files
mkdir -p src/adapters/repositories/tags

# 以下のファイルを実装:
# Files:
# - src/adapters/repositories/files/getFiles.ts
# - src/adapters/repositories/files/getFileById.ts
# - src/adapters/repositories/files/uploadFile.ts
# - src/adapters/repositories/files/updateFile.ts
# - src/adapters/repositories/files/deleteFile.ts
# - src/adapters/repositories/files/bulkDeleteFiles.ts
# - src/adapters/repositories/files/downloadFile.ts
# - src/adapters/repositories/files/index.ts

# Tags:
# - src/adapters/repositories/tags/getTags.ts
# - src/adapters/repositories/tags/createTag.ts
# - src/adapters/repositories/tags/updateTag.ts
# - src/adapters/repositories/tags/deleteTag.ts
# - src/adapters/repositories/tags/index.ts

# repositoryComposition.tsに追加:
# import * as files from './files';
# import * as tags from './tags';
#
# export type RepositoryComposition = {
#   auth: typeof auth;
#   files: typeof files;
#   tags: typeof tags;
# };
```

### 5. TanStack Queryフックの実装

```bash
# ディレクトリ構造を作成
mkdir -p src/presentations/hooks/queries/files
mkdir -p src/presentations/hooks/queries/tags

# クエリキーをconstants.tsに追加:
# FILES: {
#   LIST: (params?: FileQueryParams) => [GLOBAL_LOADING, 'files', 'list', params],
#   DETAIL: (id: string) => [GLOBAL_LOADING, 'files', 'detail', id],
# },
# TAGS: {
#   LIST: [GLOBAL_LOADING, 'tags', 'list'],
# }

# 以下のファイルを実装:
# - src/presentations/hooks/queries/files/useFiles.ts
# - src/presentations/hooks/queries/files/useFileById.ts
# - src/presentations/hooks/queries/files/useUploadFile.ts
# - src/presentations/hooks/queries/files/useUpdateFile.ts
# - src/presentations/hooks/queries/files/useDeleteFile.ts
# - src/presentations/hooks/queries/files/useBulkDeleteFiles.ts
# - src/presentations/hooks/queries/tags/useTags.ts
# - src/presentations/hooks/queries/tags/useCreateTag.ts
# - src/presentations/hooks/queries/tags/useUpdateTag.ts
# - src/presentations/hooks/queries/tags/useDeleteTag.ts
```

### 6. UIコンポーネントの実装

```bash
# ディレクトリ構造を作成
mkdir -p src/presentations/components/tags

# 複数箇所で使われる共通コンポーネント（src/presentations/components/）:
# Tags（複数ページで使用）:
# - tags/TagChips/TagChips.tsx      # ファイルカード、テーブル、詳細で使用
# - tags/TagSelector/TagSelector.tsx # アップロード、編集で使用

# ページ固有コンポーネントは各セクションの実装時に作成:
# - FilesPage/components/RecentFilesSection/components/FileCard/
# - FilesPage/components/UploadSection/components/FileUploadZone/
# - FilesPage/components/MyFilesSection/components/FileListTable/
# - FilesPage/components/MyFilesSection/components/FileDetailDialog/
# - FilesPage/components/MyFilesSection/components/FileEditDialog/
```

### 7. ページとレイアウトの実装

```bash
# ディレクトリ構造を作成
mkdir -p src/presentations/pages/FilesPage/components
mkdir -p src/presentations/layouts/AppLayout/components

# レイアウト:
# - src/presentations/layouts/AppLayout/AppLayout.tsx
# - src/presentations/layouts/AppLayout/components/AppSidebar/AppSidebar.tsx
# - src/presentations/layouts/AppLayout/components/AppHeader/AppHeader.tsx

# ページ:
# - src/presentations/pages/FilesPage/FilesPage.tsx

# セクションコンポーネント（ページ固有）:
# - src/presentations/pages/FilesPage/components/RecentFilesSection/
#   ├── RecentFilesSection.tsx
#   └── components/
#       └── FileCard/FileCard.tsx
#
# - src/presentations/pages/FilesPage/components/UploadSection/
#   ├── UploadSection.tsx
#   └── components/
#       └── FileUploadZone/FileUploadZone.tsx
#
# - src/presentations/pages/FilesPage/components/MyFilesSection/
#   ├── MyFilesSection.tsx
#   └── components/
#       ├── FileListTable/FileListTable.tsx
#       ├── FileDetailDialog/FileDetailDialog.tsx
#       └── FileEditDialog/FileEditDialog.tsx
```

### 8. ルーティングの追加

```typescript
// src/app/router/routes.tsx に以下を追加:

import { FilesPage } from '@/presentations/pages/FilesPage/FilesPage';

// ProtectedRoute内に追加:
{
  path: 'files',
  element: <FilesPage />,
}
```

### 9. 国際化（i18n）の設定

```typescript
// src/i18n/locales/ja.json に追加:
{
  "filesPage": {
    "title": "ファイル管理",
    "recentFiles": "最近のファイル",
    "uploadFiles": "ファイルをアップロード",
    "myFiles": "マイファイル",
    "uploadDescription": "クリックまたはドラッグ&ドロップでアップロード",
    "supportedFormats": "PDF, Word, Excel, 画像 - 最大10MB"
  }
}

// src/i18n/locales/en.json に追加:
{
  "filesPage": {
    "title": "File Management",
    "recentFiles": "Recent Files",
    "uploadFiles": "Upload Files",
    "myFiles": "My Files",
    "uploadDescription": "Click to upload or drag and drop",
    "supportedFormats": "PDF, Word, Excel, Images - Max 10MB"
  }
}
```

## 実装の順序

実装は以下の順序で進めることを推奨します:

### Phase 1: 基盤実装（1日目）

1. ✅ OpenAPI仕様の配置とコード生成
2. ✅ ドメインモデルの実装
3. ✅ Adapterレイヤーの実装
4. ✅ TanStack Queryフックの実装
5. ⚠️ ユニットテストの作成（models、adapters）

### Phase 2: UI基礎実装（2日目）

1. ✅ 共通UIコンポーネントの実装
   - TagChip
   - FileDropZone
2. ✅ レイアウトの実装
   - AppLayout
   - AppSidebar
   - AppHeader
3. ⚠️ コンポーネントテストの作成

### Phase 3: ファイル一覧機能（3日目）

1. ✅ FileListTableの実装（MUI DataGrid使用）
2. ✅ MyFilesSectionの実装
3. ✅ 検索・フィルタ機能の実装
4. ✅ ソート・ページネーション機能
5. ⚠️ コンポーネントテストの作成

### Phase 4: ファイルアップロード機能（4日目）

1. ✅ FileUploadZoneの実装
2. ✅ UploadSectionの実装
3. ✅ プログレスバー表示
4. ✅ エラーハンドリング
5. ⚠️ E2Eテストの作成（アップロードフロー）

### Phase 5: タグ管理機能（5日目）

1. ✅ TagChipsの実装
2. ✅ TagSelectorの実装（Autocomplete使用）
3. ✅ TagManagerの実装（CRUD操作）
4. ⚠️ コンポーネントテストの作成

### Phase 6: Recent Files機能（6日目）

1. ✅ FileCardの実装
2. ✅ RecentFilesSectionの実装（グリッドレイアウト）
3. ✅ カード表示の最適化
4. ⚠️ コンポーネントテストの作成

### Phase 7: ファイル詳細・編集機能（7日目）

1. ✅ FileDetailDialogの実装
2. ✅ FileEditDialogの実装
3. ✅ ファイルダウンロード機能
4. ⚠️ E2Eテストの作成（編集フロー）

### Phase 8: 統合とテスト（8日目）

1. ✅ 全コンポーネントの統合
2. ⚠️ E2Eテストの完成（全ユーザーフロー）
3. ⚠️ アクセシビリティテスト
4. ⚠️ パフォーマンステスト
5. ⚠️ バグ修正

## 開発時の注意事項

### 1. TypeScript Strict Mode

すべてのコードはTypeScript strict modeに準拠する必要があります:

```typescript
// ❌ Bad
const file: any = response.data;

// ✅ Good
const file: File = {
  id: response.data.id,
  name: response.data.name,
  // ... 明示的な型変換
};
```

### 2. Material-UI First

MUIコンポーネントを優先して使用:

```typescript
// ❌ Bad - カスタムボタン
<button onClick={handleUpload}>Upload</button>

// ✅ Good - MUIボタン
<Button variant="contained" onClick={handleUpload}>
  Upload
</Button>
```

### 3. Clean Architecture

依存の方向を守る:

```
Presentation (UI) → Application (Hooks) → Domain (Models) ← Adapters (API)
```

ドメイン層は外部依存を持たない:

```typescript
// ❌ Bad - domainがadapterに依存
import { getFilesApi } from '@/adapters/generated/files';

// ✅ Good - repositoryインターフェースのみ参照
export interface FileRepository {
  getFiles(params: FileQueryParams): Promise<FileListResponse>;
}
```

### 4. API-First Development

すべてのAPI変更はOpenAPI仕様の更新から始める:

```bash
# 1. OpenAPI仕様を更新
vim schema/files/openapi.yaml

# 2. コード生成
pnpm gen:api

# 3. 生成されたコードを使用
import { getFiles } from '@/adapters/generated/files';
```

### 5. テスト駆動開発

コードを書く前にテストを書く:

```typescript
// 1. テストを書く
describe('FileSize', () => {
  it('should format bytes to human readable', () => {
    const fileSize = new FileSize(2048576);
    expect(fileSize.toHumanReadable()).toBe('2 MB');
  });
});

// 2. 実装する
export class FileSize {
  toHumanReadable(): string {
    // 実装
  }
}
```

### 6. アクセシビリティ

すべてのインタラクティブ要素にアクセシビリティ対応:

```typescript
// ✅ Good - MUIコンポーネントは既にアクセシビリティ対応済み
<Button aria-label="Upload files" onClick={handleUpload}>
  {/* Content */}
</Button>

// ✅ Good - カスタム要素の場合は明示的に対応が必要
<Box
  role="button"
  tabIndex={0}
  aria-label="Upload files"
  onClick={handleUpload}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleUpload();
    }
  }}
>
  {/* Content */}
</Box>
```

## デバッグとトラブルシューティング

### 開発サーバーの起動

```bash
pnpm dev
```

### ビルドとタイプチェック

```bash
# タイプチェック
pnpm type-check

# ビルド
pnpm build

# Lint
pnpm lint

# Format
pnpm format:check
```

### テストの実行

```bash
# ユニットテスト
pnpm test:run <path-to-test-file>

# E2Eテスト
pnpm test:e2e

# テストカバレッジ
pnpm test:coverage
```

### MSWモックの確認

開発中はMSWハンドラーを使用してAPIをモック:

```typescript
// カスタマイズが不要な場合: Orvalが生成したハンドラをそのまま使用
// src/adapters/generated/files.ts に以下が自動生成される:
// - getGetFilesMockHandler()
// - getGetFileByIdMockHandler()
// - get{ApiName}Mock() - すべてのハンドラをまとめたもの

// src/adapters/mocks/handlers.ts
import { getSimpleSessionAuthenticationAPIMock } from '@/adapters/generated/auth';
import { getFileManagementAPIMock } from '@/adapters/generated/files';

export const handlers = [
  ...getSimpleSessionAuthenticationAPIMock(),
  ...getFileManagementAPIMock(),
];

// カスタマイズが必要な場合: 独自のハンドラを定義
// src/adapters/mocks/handlers/files.ts
import { http, HttpResponse } from 'msw';

export const customFilesHandlers = [
  http.get('/api/v1/files', () => {
    return HttpResponse.json({
      files: [
        {
          id: 'file_1',
          name: 'test.pdf',
          size: 1024,
          // ... カスタムモックデータ
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });
  }),
];
```

## パフォーマンス最適化

### 1. React Query のキャッシュ設定

```typescript
// useSuspenseQueryを使用し、グローバル設定を利用
// staleTimeやcacheTimeは個別に設定せず、QueryClientのデフォルト設定を使用
import { useSuspenseQuery } from '@tanstack/react-query';

const { data } = useSuspenseQuery({
  queryKey: QUERY_KEYS.FILES.LIST(params),
  queryFn: () => repository.files.getFiles(params),
});

// グローバル設定は src/main.tsx または App.tsx で設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分
      gcTime: 10 * 60 * 1000, // 10分（旧cacheTime）
    },
  },
});
```

### 2. 検索のデバウンス

```typescript
import { useState, useEffect } from 'react';

const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 300);

  return () => clearTimeout(timer);
}, [search]);

// debouncedSearchでクエリを実行
```

### 3. DataGridの仮想化

MUI DataGrid（Free版）は自動的に仮想化されますが、大量データの場合はページネーションを使用:

```typescript
<DataGrid
  rows={files}
  columns={columns}
  pagination
  paginationMode="server" // サーバーサイドページネーション
  rowCount={total}
  onPaginationModelChange={handlePaginationChange}
/>
```

## 次のステップ

1. Phase 1から順に実装を開始
2. 各フェーズ完了後にテストを実行
3. PR作成前にチェックリストを確認:
   - [ ] 型チェックが通る
   - [ ] すべてのテストが通る
   - [ ] Lintエラーがない
   - [ ] アクセシビリティチェック完了
   - [ ] パフォーマンステスト完了

## 参考資料

- [MUI DataGrid Documentation](https://mui.com/x/react-data-grid/)
- [react-dropzone Documentation](https://react-dropzone.js.org/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Orval Documentation](https://orval.dev/)
- [Project Constitution](./.specify/memory/constitution.md)
