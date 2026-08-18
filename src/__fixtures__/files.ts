import type {
  FileResponse,
  FileInfo,
  FileListResponse,
} from '@/adapters/generated/files';
import type {
  DocumentFile,
  FileListResponse as FileListResponseDomain,
  UploadFileRequest,
  UpdateFileRequest,
} from '@/domain/models/file';

// API レスポンス用のモックデータ
export const mockFileInfo: FileInfo = {
  id: 'file-001',
  name: 'document.pdf',
  size: 1024 * 100, // 100KB
  mimeType: 'application/pdf',
  description: 'Sample PDF document',
  uploadedAt: '2025-01-11T10:00:00Z',
  downloadUrl: 'https://api.example.com/files/file-001/download',
  tagIds: [],
};

export const mockFileResponse: FileResponse = {
  file: mockFileInfo,
};

// ファイルリスト取得用のAPIレスポンス
export const mockFileListApiResponse: FileListResponse = {
  files: [
    mockFileInfo,
    {
      id: 'file-002',
      name: 'contract.docx',
      size: 1024 * 256, // 256KB
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      description: 'Contract document',
      uploadedAt: '2025-01-10T15:30:00Z',
      downloadUrl: 'https://api.example.com/files/file-002/download',
      tagIds: ['tag-001'],
    },
    {
      id: 'file-003',
      name: 'report.xlsx',
      size: 1024 * 512, // 512KB
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      description: undefined,
      uploadedAt: '2025-01-09T09:00:00Z',
      downloadUrl: 'https://api.example.com/files/file-003/download',
      tagIds: [],
    },
  ],
  total: 3,
  page: 1,
  limit: 20,
};

// ドメインモデル用のモックデータ
export const mockFile: DocumentFile = {
  id: 'file-001',
  name: 'document.pdf',
  size: 1024 * 100,
  mimeType: 'application/pdf',
  description: 'Sample PDF document',
  uploadedAt: new Date('2025-01-11T10:00:00Z'),
  downloadUrl: 'https://api.example.com/files/file-001/download',
  tagIds: [],
};

// ファイルリスト取得のドメインモデル
export const mockFileListResponse: FileListResponseDomain = {
  files: [
    mockFile,
    {
      id: 'file-002',
      name: 'contract.docx',
      size: 1024 * 256,
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      description: 'Contract document',
      uploadedAt: new Date('2025-01-10T15:30:00Z'),
      downloadUrl: 'https://api.example.com/files/file-002/download',
      tagIds: ['tag-001'],
    },
    {
      id: 'file-003',
      name: 'report.xlsx',
      size: 1024 * 512,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      description: null,
      uploadedAt: new Date('2025-01-09T09:00:00Z'),
      downloadUrl: 'https://api.example.com/files/file-003/download',
      tagIds: [],
    },
  ],
  total: 3,
  page: 1,
  limit: 20,
};

// 検索テスト用の拡張モックデータ（MSWハンドラー用 - API形式）
export const mockExtendedFileListApi: FileInfo[] = [
  {
    id: 'file-001',
    name: 'document.pdf',
    size: 1024 * 100, // 100KB
    mimeType: 'application/pdf',
    description: 'Sample PDF document',
    uploadedAt: '2025-01-11T10:00:00Z',
    downloadUrl: 'https://api.example.com/files/file-001/download',
    tagIds: [],
  },
  {
    id: 'file-002',
    name: 'contract.docx',
    size: 1024 * 256, // 256KB
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    description: 'Contract document',
    uploadedAt: '2025-01-10T15:30:00Z',
    downloadUrl: 'https://api.example.com/files/file-002/download',
    tagIds: ['tag-001'],
  },
  {
    id: 'file-003',
    name: 'report.xlsx',
    size: 1024 * 512, // 512KB
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: undefined,
    uploadedAt: '2025-01-09T09:00:00Z',
    downloadUrl: 'https://api.example.com/files/file-003/download',
    tagIds: [],
  },
  {
    id: 'file-004',
    name: 'invoice.pdf',
    size: 1024 * 128, // 128KB
    mimeType: 'application/pdf',
    description: 'Invoice for January',
    uploadedAt: '2025-01-08T14:00:00Z',
    downloadUrl: 'https://api.example.com/files/file-004/download',
    tagIds: [],
  },
  {
    id: 'file-005',
    name: 'meeting-notes.txt',
    size: 1024 * 10, // 10KB
    mimeType: 'text/plain',
    description: 'Meeting notes for project review',
    uploadedAt: '2025-01-07T11:00:00Z',
    downloadUrl: 'https://api.example.com/files/file-005/download',
    tagIds: ['tag-002'],
  },
];

// 検索テスト用の拡張モックデータ（ドメインモデル形式）
export const mockExtendedFileList: FileListResponseDomain = {
  files: [
    mockFile, // document.pdf
    {
      id: 'file-002',
      name: 'contract.docx',
      size: 1024 * 256,
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      description: 'Contract document',
      uploadedAt: new Date('2025-01-10T15:30:00Z'),
      downloadUrl: 'https://api.example.com/files/file-002/download',
      tagIds: ['tag-001'],
    },
    {
      id: 'file-003',
      name: 'report.xlsx',
      size: 1024 * 512,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      description: null,
      uploadedAt: new Date('2025-01-09T09:00:00Z'),
      downloadUrl: 'https://api.example.com/files/file-003/download',
      tagIds: [],
    },
    {
      id: 'file-004',
      name: 'invoice.pdf',
      size: 1024 * 128,
      mimeType: 'application/pdf',
      description: 'Invoice for January',
      uploadedAt: new Date('2025-01-08T14:00:00Z'),
      downloadUrl: 'https://api.example.com/files/file-004/download',
      tagIds: [],
    },
    {
      id: 'file-005',
      name: 'meeting-notes.txt',
      size: 1024 * 10,
      mimeType: 'text/plain',
      description: 'Meeting notes for project review',
      uploadedAt: new Date('2025-01-07T11:00:00Z'),
      downloadUrl: 'https://api.example.com/files/file-005/download',
      tagIds: ['tag-002'],
    },
  ],
  total: 5,
  page: 1,
  limit: 20,
};

/**
 * 検索クエリに基づいてモックデータをフィルタリング
 */
export function filterMockFilesBySearch(
  search: string | undefined
): FileListResponseDomain {
  if (!search) {
    return mockExtendedFileList;
  }

  const lowerSearch = search.toLowerCase();
  const filteredFiles = mockExtendedFileList.files.filter((file) => {
    // 名前でマッチしたら早期リターン
    if (file.name.toLowerCase().includes(lowerSearch)) return true;
    // 名前でマッチしなければdescriptionをチェック
    return file.description?.toLowerCase().includes(lowerSearch) ?? false;
  });

  return {
    files: filteredFiles,
    total: filteredFiles.length,
    page: 1,
    limit: 20,
  };
}

// アップロード要求用のモックデータ
export const mockFile1 = new File(['test content'], 'document.pdf', {
  type: 'application/pdf',
});

export const mockUploadFileRequest: UploadFileRequest = {
  file: mockFile1,
  description: 'Sample PDF document',
};

export const mockUploadFileRequestWithoutDescription: UploadFileRequest = {
  file: mockFile1,
};

// ファイル更新要求用のモックデータ
export const mockUpdateFileRequest: UpdateFileRequest = {
  name: 'updated-document.pdf',
  description: 'Updated description',
  tagIds: ['tag-001', 'tag-002'],
};

export const mockUpdateFileRequestPartial: UpdateFileRequest = {
  name: 'renamed-document.pdf',
};

export const mockUpdateFileRequestWithTags: UpdateFileRequest = {
  tagIds: ['tag-001'],
};

export const mockUpdateFileRequestWithoutTagIds: UpdateFileRequest = {
  name: 'updated-document.pdf',
  description: 'Updated description',
};

// 更新後のAPIレスポンス用のモックデータ
export const mockUpdatedFileInfo: FileInfo = {
  id: 'file-001',
  name: 'updated-document.pdf',
  size: 1024 * 100,
  mimeType: 'application/pdf',
  description: 'Updated description',
  uploadedAt: '2025-01-11T10:00:00Z',
  downloadUrl: 'https://api.example.com/files/file-001/download',
  tagIds: ['tag-001', 'tag-002'],
};

export const mockUpdatedFileResponse: FileResponse = {
  file: mockUpdatedFileInfo,
};

// バリエーション
export const mockFileInfoVariations = {
  withoutDescription: (): FileInfo => ({
    ...mockFileInfo,
    description: undefined,
  }),
  withDifferentSize: (size: number): FileInfo => ({
    ...mockFileInfo,
    size,
  }),
  withNullDescription: (): FileInfo => ({
    ...mockFileInfo,
    description: null as unknown as undefined,
  }),
};

export const mockFileResponseVariations = {
  withoutDescription: (): FileResponse => ({
    file: mockFileInfoVariations.withoutDescription(),
  }),
  withDifferentSize: (size: number): FileResponse => ({
    file: mockFileInfoVariations.withDifferentSize(size),
  }),
  withNullDescription: (): FileResponse => ({
    file: mockFileInfoVariations.withNullDescription(),
  }),
  withTagIds: (tagIds: string[]): FileResponse => ({
    file: {
      ...mockFileInfo,
      tagIds,
    },
  }),
};

// ファイルリスト取得用のバリエーション
export const mockFileListApiResponseVariations = {
  withSingleFile: (): FileListResponse => ({
    files: [mockFileInfo],
    total: 1,
    page: 1,
    limit: 20,
  }),
  withEmptyList: (): FileListResponse => ({
    files: [],
    total: 0,
    page: 1,
    limit: 20,
  }),
  withNullDescriptions: (): FileListResponse => ({
    files: [
      {
        ...mockFileInfo,
        description: null as unknown as undefined,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  }),
  withCustomDate: (dateString: string): FileListResponse => ({
    files: [
      {
        ...mockFileInfo,
        uploadedAt: dateString,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  }),
  withPagination: (page: number, limit: number): FileListResponse => ({
    files: mockFileListApiResponse.files,
    total: mockFileListApiResponse.total,
    page,
    limit,
  }),
};
