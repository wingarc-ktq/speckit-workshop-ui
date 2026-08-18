import { getFiles as getFilesApi } from '@/adapters/generated/files';
import type { FileListResponse, FileQueryParams } from '@/domain/models/file';

export async function getFiles(
  params: FileQueryParams
): Promise<FileListResponse> {
  const response = await getFilesApi({
    search: params.search,
    tagIds: params.tagIds,
    page: params.page,
    limit: params.limit,
  });

  return {
    files: response.files.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      description: file.description ?? null,
      uploadedAt: new Date(file.uploadedAt),
      downloadUrl: file.downloadUrl,
      tagIds: file.tagIds,
    })),
    total: response.total,
    page: response.page,
    limit: response.limit,
  };
}
