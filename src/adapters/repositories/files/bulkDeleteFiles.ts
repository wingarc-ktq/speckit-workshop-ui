import { bulkDeleteFiles as bulkDeleteFilesApi } from '@/adapters/generated/files';
import type { FileId } from '@/domain/models/file';

export async function bulkDeleteFiles(fileIds: FileId[]): Promise<void> {
  await bulkDeleteFilesApi({ fileIds });
}
