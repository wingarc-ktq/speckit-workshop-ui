import { createTag as createTagApi } from '@/adapters/generated/files';
import type { Tag, TagColor } from '@/domain/models/tag';

export interface CreateTagRequest {
  name: string;
  color: TagColor;
}

export async function createTag(request: CreateTagRequest): Promise<Tag> {
  const response = await createTagApi(request);

  return {
    id: response.tag.id,
    name: response.tag.name,
    color: response.tag.color,
    createdAt: new Date(response.tag.createdAt),
    updatedAt: new Date(response.tag.updatedAt),
  };
}
