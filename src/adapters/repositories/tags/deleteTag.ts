import { deleteTag as deleteTagApi } from '@/adapters/generated/files';
import type { TagId } from '@/domain/models/tag';

export async function deleteTag(tagId: TagId): Promise<void> {
  await deleteTagApi(tagId);
}
