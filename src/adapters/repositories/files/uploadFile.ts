import { uploadFile as uploadFileApi } from '@/adapters/generated/files';
import type { DocumentFile, UploadFileRequest } from '@/domain/models/file';

export async function uploadFile(
  request: UploadFileRequest
): Promise<DocumentFile> {
  const response = await uploadFileApi({
    file: request.file,
    description: request.description,
  });

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
