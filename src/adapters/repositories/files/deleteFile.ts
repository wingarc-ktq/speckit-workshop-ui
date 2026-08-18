import { deleteFile as deleteFileApi } from '@/adapters/generated/files';
import type { FileId } from '@/domain/models/file';

export async function deleteFile(fileId: FileId): Promise<void> {
  await deleteFileApi(fileId);
}
