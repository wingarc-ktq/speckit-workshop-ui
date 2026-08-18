import { getTags as getTagsApi } from '@/adapters/generated/files';
import type { Tag } from '@/domain/models/tag';

export async function getTags(): Promise<Tag[]> {
  const response = await getTagsApi();

  return response.tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    createdAt: new Date(tag.createdAt),
    updatedAt: new Date(tag.updatedAt),
  }));
}
