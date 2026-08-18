import { downloadFile as downloadFileApi } from '@/adapters/generated/files';
import type { FileId } from '@/domain/models/file';

export async function downloadFile(fileId: FileId): Promise<Blob> {
  const response = await downloadFileApi(fileId);
  return response;
}
