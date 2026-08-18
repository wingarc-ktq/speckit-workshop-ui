import { updateTag as updateTagApi } from '@/adapters/generated/files';
import type { Tag, TagColor, TagId } from '@/domain/models/tag';

export interface UpdateTagRequest {
  name?: string;
  color?: TagColor;
}

export async function updateTag(
  tagId: TagId,
  request: UpdateTagRequest
): Promise<Tag> {
  const response = await updateTagApi(tagId, request);

  return {
    id: response.tag.id,
    name: response.tag.name,
    color: response.tag.color,
    createdAt: new Date(response.tag.createdAt),
    updatedAt: new Date(response.tag.updatedAt),
  };
}
