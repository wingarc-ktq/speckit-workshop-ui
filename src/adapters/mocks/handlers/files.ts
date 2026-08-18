import { http } from 'msw';

import {
  getGetTagsMockHandler,
  type FileInfo,
  type FileListResponse,
  type TagColor,
  type TagInfo,
  type TagListResponse,
} from '@/adapters/generated/files';

// Mutable mock files store - starts empty, only contains uploaded files
let mockFiles: FileInfo[] = [];

// Store uploaded file blobs by fileId
const uploadedFileBlobs = new Map<string, Blob>();

// Generate unique file ID
let fileIdCounter = 100;

// Custom handler for getFiles with pagination and search support
const getFilesWithPaginationHandler = http.get(
  '*/files',
  async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search') || undefined;
    const tagIdsParam = url.searchParams.get('tagIds') || undefined;

    // Filter files by search query and tags
    let filteredFiles: FileInfo[] = mockFiles;

    // Filter by search query
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredFiles = filteredFiles.filter((file) => {
        // 名前でマッチしたら早期リターン
        if (file.name.toLowerCase().includes(lowerSearch)) return true;
        // 名前でマッチしなければdescriptionをチェック
        return file.description?.toLowerCase().includes(lowerSearch) ?? false;
      });
    }

    // Filter by tags (OR condition - file must have at least one of the specified tags)
    if (tagIdsParam) {
      const requestedTagIds = tagIdsParam.split(',').filter(Boolean);
      if (requestedTagIds.length > 0) {
        filteredFiles = filteredFiles.filter((file) => {
          // Check if file has at least one of the requested tags
          return requestedTagIds.some((tagId) => file.tagIds?.includes(tagId));
        });
      }
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    const response: FileListResponse = {
      files: paginatedFiles,
      total: filteredFiles.length,
      page,
      limit,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
);

// Mutable mock tags store - starts with predefined tags
const mockTags: TagInfo[] = [
  {
    id: 'tag-001',
    name: '請求書',
    color: 'blue',
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'tag-002',
    name: '提案書',
    color: 'orange',
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'tag-003',
    name: '未処理',
    color: 'green',
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'tag-004',
    name: '完了',
    color: 'red',
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'tag-005',
    name: 'その他',
    color: 'gray',
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
];

// Generate unique tag ID
let tagIdCounter = 6;

// Custom handler for getTags
const getTagsHandler = getGetTagsMockHandler((): TagListResponse => {
  return {
    tags: mockTags,
  };
});

// Custom handler for uploadFile
const uploadFileHandler = http.post('*/files', async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const description = formData.get('description') as string | null;

  if (!file) {
    return new Response(
      JSON.stringify({
        message: 'File is required',
        code: 'FILE_REQUIRED',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return new Response(
      JSON.stringify({
        message: 'File size exceeds 10MB',
        code: 'FILE_SIZE_EXCEEDED',
      }),
      {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Generate new file ID
  const newFileId = `file-${String(fileIdCounter++).padStart(3, '0')}`;

  // Store the uploaded file blob
  uploadedFileBlobs.set(newFileId, file);

  // Create new file info
  const newFile: FileInfo = {
    id: newFileId,
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    description: description || undefined,
    uploadedAt: new Date().toISOString(),
    downloadUrl: `/api/v1/files/${newFileId}/download`,
    tagIds: [],
  };

  // Add to mock files
  mockFiles.push(newFile);

  return new Response(
    JSON.stringify({
      file: newFile,
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

// Custom handler for deleteFile
const deleteFileHandler = http.delete('*/files/:fileId', async ({ params }) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const fileId = params.fileId as string;
  const fileIndex = mockFiles.findIndex((f) => f.id === fileId);

  if (fileIndex === -1) {
    return new Response(
      JSON.stringify({
        message: 'File not found',
        code: 'FILE_NOT_FOUND',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Remove file from mockFiles
  mockFiles.splice(fileIndex, 1);

  // Remove uploaded blob
  uploadedFileBlobs.delete(fileId);

  return new Response(null, { status: 204 });
});

// Custom handler for bulkDeleteFiles
const bulkDeleteFilesHandler = http.post(
  '*/files/bulk-delete',
  async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const body = (await request.json()) as { fileIds: string[] };
    const { fileIds } = body;

    if (!fileIds || fileIds.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'fileIds is required and must not be empty',
          code: 'INVALID_REQUEST',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Remove files from mockFiles
    mockFiles = mockFiles.filter((file) => !fileIds.includes(file.id));

    // Remove uploaded blobs
    fileIds.forEach((id) => uploadedFileBlobs.delete(id));

    return new Response(null, { status: 204 });
  }
);

// Custom handler for updateFile
const updateFileHandler = http.put(
  '*/files/:fileId',
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const fileId = params.fileId as string;
    const file = mockFiles.find((f) => f.id === fileId);

    if (!file) {
      return new Response(
        JSON.stringify({
          message: 'File not found',
          code: 'FILE_NOT_FOUND',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      tagIds?: string[];
    };

    // Update file properties
    if (body.name !== undefined) {
      file.name = body.name;
    }
    if (body.description !== undefined) {
      file.description = body.description;
    }
    if (body.tagIds !== undefined) {
      file.tagIds = body.tagIds;
    }

    return new Response(
      JSON.stringify({
        file,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

// Custom handler for getFileById to return actual stored file data
const getFileByIdHandler = http.get('*/files/:fileId', async ({ params }) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const fileId = params.fileId as string;
  const file = mockFiles.find((f) => f.id === fileId);

  if (!file) {
    return new Response(
      JSON.stringify({
        message: 'File not found',
        code: 'FILE_NOT_FOUND',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(JSON.stringify({ file }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

// Custom handler for downloadFile with actual PDF blob
// Note: Generated getDownloadFileMockHandler uses JSON.stringify() on Blob (line 450-452)
// which results in empty object {}, and sets Content-Type to 'application/json'.
// We need to return the Blob directly with proper Content-Type, so we create our own handler.
const downloadFileHandler = http.get(
  '*/files/:fileId/download',
  async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    const fileId = params.fileId as string;
    const file = mockFiles.find((f) => f.id === fileId);

    if (!file) {
      return new Response(
        JSON.stringify({
          message: 'File not found',
          code: 'FILE_NOT_FOUND',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if we have the actual uploaded blob
    const uploadedBlob = uploadedFileBlobs.get(fileId);

    if (!uploadedBlob) {
      return new Response(
        JSON.stringify({
          message: 'File blob not found',
          code: 'FILE_BLOB_NOT_FOUND',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(uploadedBlob, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      },
    });
  }
);

// Custom handler for createTag
const createTagHandler = http.post('*/tags', async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const body = (await request.json()) as {
    name: string;
    color: TagColor;
  };

  if (!body.name || !body.color) {
    return new Response(
      JSON.stringify({
        message: 'Name and color are required',
        code: 'INVALID_REQUEST',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Generate new tag ID
  const newTagId = `tag-${String(tagIdCounter++).padStart(3, '0')}`;

  // Create new tag
  const newTag: TagInfo = {
    id: newTagId,
    name: body.name,
    color: body.color,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add to mock tags
  mockTags.push(newTag);

  return new Response(
    JSON.stringify({
      tag: newTag,
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

// Custom handler for updateTag
const updateTagHandler = http.put(
  '*/tags/:tagId',
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const tagId = params.tagId as string;
    const tag = mockTags.find((t) => t.id === tagId);

    if (!tag) {
      return new Response(
        JSON.stringify({
          message: 'Tag not found',
          code: 'TAG_NOT_FOUND',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      color?: TagColor;
    };

    // Update tag properties
    if (body.name !== undefined) {
      tag.name = body.name;
    }
    if (body.color !== undefined) {
      tag.color = body.color;
    }
    tag.updatedAt = new Date().toISOString();

    return new Response(
      JSON.stringify({
        tag,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

// Custom handler for deleteTag
const deleteTagHandler = http.delete('*/tags/:tagId', async ({ params }) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const tagId = params.tagId as string;
  const tagIndex = mockTags.findIndex((t) => t.id === tagId);

  if (tagIndex === -1) {
    return new Response(
      JSON.stringify({
        message: 'Tag not found',
        code: 'TAG_NOT_FOUND',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Remove tag from mockTags
  mockTags.splice(tagIndex, 1);

  // Remove tag from all files
  mockFiles.forEach((file) => {
    if (file.tagIds) {
      file.tagIds = file.tagIds.filter((id) => id !== tagId);
    }
  });

  return new Response(null, { status: 204 });
});

export const filesHandlers = [
  // Files handlers
  getFilesWithPaginationHandler, // Custom getFiles handler with pagination
  uploadFileHandler, // Custom upload handler to store uploaded files
  getFileByIdHandler, // Custom getFileById handler to return actual stored file data
  updateFileHandler, // Custom update handler to update file properties
  deleteFileHandler, // Custom delete handler to remove files
  bulkDeleteFilesHandler, // Custom bulk delete handler
  downloadFileHandler, // Custom download handler with actual uploaded blobs
  // Tags handlers
  getTagsHandler, // Custom getTags handler with meaningful tags
  createTagHandler, // Custom createTag handler to add new tags
  updateTagHandler, // Custom updateTag handler to modify tags
  deleteTagHandler, // Custom deleteTag handler to remove tags
];
