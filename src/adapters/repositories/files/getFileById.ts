import { getFileById as getFileByIdApi } from '@/adapters/generated/files';
import type { DocumentFile, FileId } from '@/domain/models/file';

export async function getFileById(fileId: FileId): Promise<DocumentFile> {
  const response = await getFileByIdApi(fileId);

  return {
    id: response.file.id,
    name: response.file.name,
    size: response.file.size,
    mimeType: response.file.mimeType,
    description: response.file.description ?? null,
    uploadedAt: new Date(response.file.uploadedAt),
    downloadUrl: response.file.downloadUrl,
    tagIds: response.file.tagIds,
  };
}
