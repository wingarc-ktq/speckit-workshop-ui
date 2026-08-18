# Data Model: 文書管理システム

**Feature Branch**: `002-document-management`
**Date**: 2025-11-24

## 概要

文書管理システムのドメインモデルとデータ構造を定義します。Clean Architectureに基づき、`src/domain/models/`配下にドメインモデルを配置します。

## エンティティとスキーマ定義

すべての型定義は`src/domain/models/file/type.ts`と`src/domain/models/tag/type.ts`に集約します。

### File（ファイル）関連の型定義

システムで管理される文書の中核エンティティ。

```typescript
// src/domain/models/file/type.ts

export type FileId = string;

export const FileCategory = {
  PROPOSAL: 'proposal',
  CONTRACT: 'contract',
  REPORT: 'report',
  OTHER: 'other',
} as const;
export type FileCategory = (typeof FileCategory)[keyof typeof FileCategory];

export interface File {
  /** ファイルID */
  id: FileId;

  /** ファイル名 */
  name: string;

  /** ファイルサイズ（バイト） */
  size: number;

  /** カテゴリ */
  category: FileCategory;

  /** MIMEタイプ */
  mimeType: string;

  /** 説明（任意） */
  description: string | null;

  /** アップロード日時 */
  uploadedAt: Date;

  /** ダウンロードURL */
  downloadUrl: string;

  /** タグID一覧 */
  tagIds: string[];
}

/**
 * ファイルバリデーションルール
 * - name: 1〜255文字
 * - size: 0以上、10MB以下（アップロード時）
 * - category: 'proposal' | 'contract' | 'report' | 'other'のいずれか
 * - mimeType: サポート対象: PDF, DOCX, XLSX, JPEG, PNG
 * - description: 最大500文字
 */

/**
 * ファイル状態遷移
 * 1. Uploading: アップロード中
 * 2. Active: 正常にアップロード済み
 * 3. Deleted: 削除済み（ゴミ箱）
 * 4. PermanentlyDeleted: 完全削除済み（30日後）
 */

export interface FileQueryParams {
  /** キーワード検索（ファイル名） */
  search?: string;

  /** カテゴリフィルタ */
  category?: FileCategory;

  /** ページ番号（1始まり）デフォルト: 1 */
  page?: number;

  /** 1ページあたりの件数 デフォルト: 20 */
  limit?: number;
}

export interface FileListResponse {
  /** ファイル一覧 */
  files: File[];

  /** 総件数 */
  total: number;

  /** 現在のページ番号 */
  page: number;

  /** 1ページあたりの件数 */
  limit: number;
}

export interface UploadFileRequest {
  /** アップロードするファイル */
  file: File; // ネイティブFileオブジェクト

  /** カテゴリ */
  category: FileCategory;

  /** 説明（任意） */
  description?: string;
}

export interface UpdateFileRequest {
  /** 新しいファイル名（任意） */
  name?: string;

  /** 新しいカテゴリ（任意） */
  category?: FileCategory;

  /** 新しい説明（任意） */
  description?: string;

  /** 更新するタグID一覧（任意） */
  tagIds?: string[];
}

// src/domain/models/file/index.ts
export * from './type';
```

### Tag（タグ）関連の型定義

ファイルに付与するラベル。

```typescript
// src/domain/models/tag/type.ts

export type TagId = string;

export const TagColor = {
  BLUE: 'blue',
  RED: 'red',
  YELLOW: 'yellow',
  GREEN: 'green',
  PURPLE: 'purple',
  ORANGE: 'orange',
  GRAY: 'gray',
} as const;
export type TagColor = (typeof TagColor)[keyof typeof TagColor];

export interface Tag {
  /** タグID */
  id: TagId;

  /** タグ名 */
  name: string;

  /** 表示色 */
  color: TagColor;

  /** 作成日時 */
  createdAt: Date;

  /** 更新日時 */
  updatedAt: Date;
}

/**
 * タグバリデーションルール
 * - name: 1〜50文字、一意
 * - color: 定義された7色のいずれか
 *
 * 制約:
 * - タグ名は重複不可（ケース非依存）
 * - タグ削除時、関連する全ファイルからタグが削除される
 */

// src/domain/models/tag/index.ts
export * from './type';
```

## 値オブジェクトとユーティリティ（Value Objects & Utils）

値オブジェクトは`src/domain/models/file/type.ts`に定義するか、ユーティリティ関数として`src/presentations/utils/`に実装します。

### FileSize（ユーティリティ関数として実装）

ファイルサイズを人間可読形式で扱うためのユーティリティ。

```typescript
// src/presentations/utils/fileFormatters.ts

/**
 * バイト数を人間可読形式に変換（例: "2.4 KB", "964.51 kB"）
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 0) {
    throw new Error('File size cannot be negative');
  }
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 10MBを超えているか判定
 */
export function exceedsMaxUploadSize(bytes: number): boolean {
  const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
  return bytes > MAX_UPLOAD_SIZE;
}
```

### MimeType（ユーティリティ関数として実装）

MIMEタイプとファイルアイコンのマッピング。

```typescript
// src/presentations/utils/fileFormatters.ts

export const FileType = {
  PDF: 'pdf',
  WORD: 'word',
  EXCEL: 'excel',
  IMAGE: 'image',
  OTHER: 'other',
} as const;
export type FileType = (typeof FileType)[keyof typeof FileType];

/**
 * ファイルタイプを取得（アイコン表示用）
 */
export function getFileType(mimeType: string): FileType {
  if (mimeType.includes('pdf')) return FileType.PDF;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return FileType.WORD;
  if (mimeType.includes('excel') || mimeType.includes('sheet'))
    return FileType.EXCEL;
  if (mimeType.includes('image')) return FileType.IMAGE;
  return FileType.OTHER;
}

/**
 * サポート対象のMIMEタイプか判定
 */
export function isSupportedFileType(mimeType: string): boolean {
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
  ];
  return supportedTypes.some((type) => mimeType.includes(type));
}
```

## ドメインエラー

エラー型は`src/domain/models/file/type.ts`と`src/domain/models/tag/type.ts`に定義します。

### FileError

ファイル操作に関するエラー。

```typescript
// src/domain/models/file/type.ts に追加

export class FileError extends Error {
  constructor(
    message: string,
    public readonly code: FileErrorCode
  ) {
    super(message);
    this.name = 'FileError';
  }
}

export type FileErrorCode =
  | 'FILE_NOT_FOUND'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'UPLOAD_FAILED'
  | 'DELETE_FAILED'
  | 'DUPLICATE_FILE_NAME';
```

### TagException (削除済み)

タグ操作に関するエラーは、現在は `WebApiException` を使用しています。
将来的にタグ固有のビジネスロジックエラーが必要になった場合は、`src/domain/errors/TagException.ts` として `AuthException` と同じパターンで実装してください。

## データフロー

### 1. ファイルアップロードフロー

```
User Input (File + Metadata)
  ↓
Presentation Layer (FileUploadZone)
  ↓
Custom Hook (useUploadFile)
  ↓
Adapter Repository (src/adapters/repositories/files/uploadFile.ts)
  ↓
API Client (Orval generated)
  ↓
Backend API
```

### 2. ファイル一覧取得フロー

```
User Input (Search + Filter)
  ↓
Presentation Layer (FileListPage)
  ↓
Custom Hook (useFiles)
  ↓
Adapter Repository (src/adapters/repositories/files/getFiles.ts)
  ↓
API Client (Orval generated)
  ↓
Backend API
  ↓
Domain Model Transformation (Adapter層で実施)
  ↓
TanStack Query Cache
  ↓
Presentation Layer (DataGrid)
```

### 3. タグ管理フロー

```
User Input (Tag CRUD)
  ↓
Presentation Layer (TagManager)
  ↓
Custom Hook (useTags, useCreateTag, etc.)
  ↓
Adapter Repository (src/adapters/repositories/tags/*.ts)
  ↓
API Client (Orval generated)
  ↓
Backend API
```

## データ変換（Adapter層）

API ResponseからDomain Modelへの変換例:

```typescript
// src/adapters/repositories/files/getFiles.ts

import { getFiles as getFilesApi } from '@/adapters/generated/files';
import type {
  File,
  FileListResponse,
  FileQueryParams,
} from '@/domain/models/file';

export async function getFiles(
  params: FileQueryParams
): Promise<FileListResponse> {
  const response = await getFilesApi({
    search: params.search,
    category: params.category,
    page: params.page,
    limit: params.limit,
  });

  return {
    files: response.files.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      category: file.category,
      mimeType: file.mimeType,
      description: file.description ?? null,
      uploadedAt: new Date(file.uploadedAt),
      downloadUrl: file.downloadUrl,
      tagIds: file.tags?.map((tag) => tag.id) ?? [],
    })),
    total: response.total,
    page: response.page,
    limit: response.limit,
  };
}
```

## エンティティ関係図

```
┌─────────────┐       ┌─────────────┐
│    File     │───────│     Tag     │
│             │ N : M │             │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ name        │       │ name        │
│ size        │       │ color       │
│ category    │       │ createdAt   │
│ mimeType    │       │ updatedAt   │
│ description │       └─────────────┘
│ uploadedAt  │
│ downloadUrl │
│ tagIds[]    │
└─────────────┘
```

## ファイル構造

```
src/
├── domain/
│   └── models/
│       ├── file/
│       │   ├── type.ts          # すべての型定義を集約
│       │   ├── index.ts         # export * from './type'
│       │   └── __tests__/
│       │       └── type.test.ts
│       └── tag/
│           ├── type.ts          # すべての型定義を集約
│           ├── index.ts         # export * from './type'
│           └── __tests__/
│               └── type.test.ts
│
├── adapters/
│   └── repositories/
│       ├── files/
│       │   ├── getFiles.ts      # API ResponseをDomain Modelに変換
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
│       └── repositoryComposition.ts  # files, tags追加
│
└── presentations/
    └── utils/
        └── fileFormatters.ts    # formatFileSize, getFileType等
```

## まとめ

このデータモデルは以下の原則に従っています:

1. **既存パターン準拠**: `src/domain/models/auth`と同じ構造（type.ts + index.ts）
2. **型定義の集約**: すべての型を1つの`type.ts`ファイルに定義
3. **Clean Architecture**: ドメイン層は外部依存を持たない
4. **ユーティリティ関数**: ファイルサイズやMIMEタイプの処理は`presentations/utils`で実装
5. **明示的なエラー型**: FileError、TagErrorで型安全なエラーハンドリング
6. **Adapter層でデータ変換**: API ResponseからDomain Modelへの変換はAdapter層で実施
7. **TypeScript Strict Mode**: すべての型が明示的に定義され、null/undefinedが適切に処理される
