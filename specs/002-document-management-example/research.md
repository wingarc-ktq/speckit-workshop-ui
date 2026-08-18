# Research: 文書管理システム

**Feature Branch**: `002-document-management`
**Date**: 2025-11-24

## 概要

Figmaデザインをベースに、文書管理システムのフロントエンド実装を行います。MUI DataGrid（Free版）を使用したファイル一覧表示、タグ管理、検索・フィルタリング機能を実装します。

## Figmaデザイン分析

### デザインURL

https://www.figma.com/design/8R8P2zlp5FO2PjwTqHRstW/インターン用?node-id=69-428

### 主要UIコンポーネント

#### 1. レイアウト構造

- **サイドバー**: 左側固定ナビゲーション
  - ロゴエリア（"UI Proto"）
  - セクション: GENERAL, TAGS
  - メニュー項目: My Files, Recent, Shared with Me, Deleted Files
  - タグ一覧（色付きアイコン付き）
- **ヘッダー**: トップバー
  - 検索バー（"Search something..."）
  - 通知アイコン
  - ユーザーアバター
- **メインコンテンツ**: 右側エリア
  - Recent Files（カード表示）
  - Upload Files（ドロップゾーン）
  - My Files（テーブル表示）

#### 2. Recent Filesセクション

- カード形式のグリッドレイアウト（4列）
- 各カード表示内容:
  - ファイルアイコン（PDF等）
  - タグバッジ（複数、色付き）
  - ファイル名
  - アップロード日時
  - アクションボタン（"文書を見る"）

#### 3. Upload Filesセクション

- ドラッグ&ドロップエリア
- アップロードアイコン
- 説明テキスト: "Click to upload or drag and drop"
- 対応フォーマット表示: "PDF, Word, Excel, Images - Max 20MB"

#### 4. My Filesセクション（メインテーブル）

- MUI DataGridを使用
- カラム構成:
  - チェックボックス（選択用）
  - Name（ファイルアイコン + ファイル名）
  - Tags（色付きバッジ、複数対応）
  - Last Modified（日時）
  - File Size
- ページネーション: "Rows per page: 10▼" "1-5 of 13"
- ソート機能（Name列に▼アイコン）

#### 5. ストレージ表示

- サイドバー下部
- プログレスバー
- "Storage" ラベル
- 使用量表示: "0.2 GB of 15 GB"
- "Upgrade" ボタン

### カラースキーム

- プライマリカラー: 青系（リンク、アクションボタン）
- タグカラー: 青、赤、黄、緑（カテゴリ別）
- 背景: ライトグレー系
- カード背景: 白

## 技術選定と実装アプローチ

### 1. MUI DataGrid（Free版）の使用

**Decision**: MUI DataGrid（Community版）を使用してファイル一覧テーブルを実装

**Rationale**:

- MUI DataGridは標準のTableコンポーネントより高機能（ソート、ページネーション、選択機能が組み込み済み）
- Free版で以下の機能が利用可能:
  - Column sorting
  - Pagination
  - Row selection
  - Column resizing
  - Filtering (basic)
  - CSV export
- 既存のMUIテーマと統合が容易
- Figmaデザインのテーブルレイアウトに適合

**Alternatives Considered**:

- **標準のMUI Table**: ソート、ページネーション、選択機能を全て手動実装する必要があり、開発コストが高い
- **Tanstack Table**: 高度にカスタマイズ可能だが、MUIとの統合に追加の実装が必要
- **AG Grid**: 高機能だが、Free版でも学習コストが高く、MUIとのデザイン統合が難しい

**実装パターン**:

```typescript
// src/presentations/components/files/FileListTable/FileListTable.tsx
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 300 },
  { field: 'tags', headerName: 'Tags', width: 200, renderCell: (params) => <TagChips tags={params.value} /> },
  { field: 'lastModified', headerName: 'Last Modified', width: 200 },
  { field: 'fileSize', headerName: 'File Size', width: 150 },
];

export function FileListTable({ files }: FileListTableProps) {
  return (
    <DataGrid
      rows={files}
      columns={columns}
      checkboxSelection
      disableRowSelectionOnClick
      pageSizeOptions={[10, 20, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
    />
  );
}
```

### 2. ファイルアップロード UI/UX

**Decision**: react-dropzoneを使用してドラッグ&ドロップアップロード機能を実装

**Rationale**:

- react-dropzoneは軽量で、MUIと統合しやすい
- ドラッグ&ドロップとファイル選択ダイアログの両方をサポート
- ファイルバリデーション（タイプ、サイズ）機能が組み込まれている
- アクセシビリティ対応（キーボード操作可能）

**Alternatives Considered**:

- **ネイティブHTML input[type=file]**: ドラッグ&ドロップを手動実装する必要があり、UXが劣る
- **MUI Dropzone系ライブラリ**: 機能過多で、シンプルなUIには不要

**実装パターン**:

```typescript
// src/presentations/components/files/FileUploadZone/FileUploadZone.tsx
import { useDropzone } from 'react-dropzone';

export function FileUploadZone({ onUpload }: FileUploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.jpg', '.jpeg', '.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <Box {...getRootProps()} sx={{ /* MUI styling */ }}>
      <input {...getInputProps()} />
      {/* Upload UI */}
    </Box>
  );
}
```

### 3. タグ管理コンポーネント

**Decision**: MUI Chip + Autocompleteを使用してタグ選択・表示を実装

**Rationale**:

- MUI Chipはタグ表示に最適（色、アイコン、削除ボタンをサポート）
- MUI Autocompleteは複数選択、フィルタリング、新規タグ作成に対応
- Figmaデザインの色付きタグバッジに適合

**実装パターン**:

```typescript
// src/presentations/components/tags/TagChips/TagChips.tsx
export function TagChips({ tags }: TagChipsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {tags.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.name}
          size="small"
          sx={{ backgroundColor: tag.color }}
        />
      ))}
    </Box>
  );
}

// src/presentations/components/tags/TagSelector/TagSelector.tsx
export function TagSelector({ value, onChange, availableTags }: TagSelectorProps) {
  return (
    <Autocomplete
      multiple
      options={availableTags}
      value={value}
      onChange={onChange}
      renderTags={(value, getTagProps) =>
        value.map((tag, index) => (
          <Chip label={tag.name} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => <TextField {...params} label="Tags" />}
    />
  );
}
```

### 4. レイアウト構造

**Decision**: MUI Drawer（permanent variant）+ AppBarでレイアウトを構築

**Rationale**:

- Figmaデザインの固定サイドバー + ヘッダー構造に適合
- MUIの標準パターンで、レスポンシブ対応が容易
- 既存のAppLayoutコンポーネントパターンに準拠

**実装パターン**:

```typescript
// src/presentations/layouts/AppLayout/AppLayout.tsx
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        {/* Header content */}
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{ width: 240, flexShrink: 0 }}
      >
        {/* Sidebar content */}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
```

### 5. 状態管理とデータフロー

**Decision**: TanStack Query（React Query）を使用したサーバー状態管理

**Rationale**:

- 既存の実装パターン（`src/presentations/hooks/queries`）に準拠
- キャッシュ管理、楽観的更新、再取得ロジックが組み込み済み
- ファイル一覧の頻繁な更新に適している

**実装パターン**:

```typescript
// src/presentations/hooks/queries/useFiles.ts
export function useFiles(params: FileQueryParams) {
  const repository = useRepository();

  return useQuery({
    queryKey: QUERY_KEYS.FILES.LIST(params),
    queryFn: () => repository.files.getFiles(params),
  });
}

export function useUploadFile() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => repository.files.uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES.LIST() });
    },
  });
}
```

### 6. ファイルサイズとMIMEタイプのフォーマット

**Decision**: カスタムユーティリティ関数を実装

**Rationale**:

- ファイルサイズの人間可読フォーマット（2.4 KB, 964.51 kB等）が必要
- MIMEタイプからファイルアイコンへのマッピングが必要

**実装パターン**:

```typescript
// src/presentations/utils/fileFormatters.ts
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileIcon(mimeType: string): React.ReactNode {
  if (mimeType.includes('pdf')) return <PdfIcon />;
  if (mimeType.includes('word')) return <WordIcon />;
  if (mimeType.includes('excel')) return <ExcelIcon />;
  if (mimeType.includes('image')) return <ImageIcon />;
  return <FileIcon />;
}
```

### 7. 検索とフィルタリング

**Decision**: URLクエリパラメータ + debounced inputで検索状態を管理

**Rationale**:

- URLでの状態共有（リンク共有、ブックマーク）が可能
- ブラウザの戻る/進むボタンに対応
- debounceでAPI呼び出しを最適化

**Alternatives Considered**:

- **ローカルステート（useState）**: URLでの状態共有ができず、ページリロード時に検索条件が失われる
- **Global State（Zustand等）**: サーバー状態はReact Queryで管理するため、追加の状態管理ライブラリは不要

**実装パターン**:

```typescript
// src/presentations/hooks/useFileFilters.ts
export function useFileFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') as FileCategory | null,
    page: Number(searchParams.get('page')) || 1,
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    setSearchParams(params);
  };

  return { filters, updateFilters };
}
```

## OpenAPI仕様の更新

### 現状分析

既存の`schema/files/openapi.yaml`は基本的なCRUD操作をカバーしていますが、以下の拡張が必要です:

1. **タグのエンドポイント追加**: タグCRUD操作
2. **ファイル更新エンドポイント追加**: メタデータ編集用
3. **一括操作エンドポイント追加**: 複数ファイルの削除/ダウンロード

### 必要な修正

#### 1. タグ管理エンドポイント

```yaml
/tags:
  get:
    summary: タグ一覧取得
    operationId: getTags
  post:
    summary: タグ作成
    operationId: createTag

/tags/{tagId}:
  put:
    summary: タグ更新
    operationId: updateTag
  delete:
    summary: タグ削除
    operationId: deleteTag
```

#### 2. ファイルメタデータ更新

```yaml
/files/{fileId}:
  put:
    summary: ファイルメタデータ更新
    operationId: updateFile
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string
              category:
                $ref: '#/components/schemas/FileCategory'
              description:
                type: string
```

#### 3. 一括削除

```yaml
/files/bulk-delete:
  post:
    summary: ファイル一括削除
    operationId: bulkDeleteFiles
    requestBody:
      content:
        application/json:
          schema:
            type: object
            required:
              - fileIds
            properties:
              fileIds:
                type: array
                items:
                  type: string
```

## テスト戦略

### 1. Unit Tests（Vitest）

- **ユーティリティ関数**: `formatFileSize`, `getFileIcon`
- **カスタムフック**: `useFileFilters`, `useFiles`
- **ドメインロジック**: ファイルバリデーション

### 2. Component Tests（React Testing Library）

- **FileListTable**: ソート、選択、ページネーション
- **FileUploadZone**: ドラッグ&ドロップ、ファイルバリデーション
- **TagSelector**: 選択、フィルタリング

### 3. E2E Tests（Playwright）

- **ファイルアップロードフロー**: ドラッグ&ドロップ → 一覧表示確認
- **検索フロー**: キーワード検索 → 結果確認
- **タグフィルタフロー**: タグ選択 → フィルタリング結果確認

## パフォーマンス最適化

### 1. 仮想化（Virtualization）

MUI DataGrid Free版は仮想化をサポートしていますが、1000行以下であれば標準のページネーションで十分です。

**Decision**: 初期実装では仮想化なし、ページサイズ10/20/50で対応

### 2. 画像の遅延読み込み

Recent Filesセクションのファイルサムネイルには、React Lazy Loadを使用します。

### 3. Debounced Search

検索入力は300msのdebounceを適用し、API呼び出しを最適化します。

## アクセシビリティ考慮事項

### 1. キーボード操作

- ファイル選択: Spaceキーでチェックボックスをトグル
- アップロードゾーン: Enterキーでファイル選択ダイアログを開く
- テーブルナビゲーション: 矢印キーで行移動

### 2. スクリーンリーダー対応

- すべてのアイコンに`aria-label`を設定
- DataGridの行に`aria-label`でファイル名を設定
- アップロードゾーンに`role="button"`と説明テキストを設定

### 3. コントラスト比

- MUIのデフォルトテーマはWCAG AA準拠
- カスタムタグカラーはコントラスト比4.5:1以上を確保

## まとめ

この調査結果を基に、以下のアプローチで実装を進めます:

1. **MUI DataGrid（Free版）**: テーブル表示、ソート、ページネーション
2. **react-dropzone**: ドラッグ&ドロップアップロード
3. **MUI Chip + Autocomplete**: タグ管理
4. **TanStack Query**: サーバー状態管理
5. **URLクエリパラメータ**: 検索・フィルタ状態管理
6. **既存パターン準拠**: Repository pattern、Clean Architecture

すべての技術選定は既存のconstitution.mdおよび実装パターンに準拠しています。
