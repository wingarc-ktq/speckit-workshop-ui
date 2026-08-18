import { updateFile as updateFileApi } from '@/adapters/generated/files';
import type {
  DocumentFile,
  FileId,
  UpdateFileRequest,
} from '@/domain/models/file';

export async function updateFile(
  fileId: FileId,
  request: UpdateFileRequest
): Promise<DocumentFile> {
  const response = await updateFileApi(fileId, request);

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
