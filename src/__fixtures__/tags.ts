import type { TagResponse } from '@/adapters/generated/files';
import type { CreateTagRequest } from '@/adapters/repositories/tags/createTag';
import { TagColor, type Tag } from '@/domain/models/tag';

/**
 * タグのモックデータ
 */
export const mockTag: Tag = {
  id: 'tag-001',
  name: 'Important',
  color: TagColor.RED,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T10:00:00Z'),
};

export const mockTag2: Tag = {
  id: 'tag-002',
  name: 'Review',
  color: TagColor.BLUE,
  createdAt: new Date('2025-01-02T10:00:00Z'),
  updatedAt: new Date('2025-01-02T10:00:00Z'),
};

export const mockTag3: Tag = {
  id: 'tag-003',
  name: 'Urgent',
  color: TagColor.ORANGE,
  createdAt: new Date('2025-01-03T10:00:00Z'),
  updatedAt: new Date('2025-01-03T10:00:00Z'),
};

/**
 * モックタグの配列
 */
export const mockTags: Tag[] = [mockTag, mockTag2, mockTag3];

/**
 * タグバリエーション生成ヘルパー
 */
export const mockTagVariations = {
  withColor: (color: Tag['color']): Tag => ({
    ...mockTag,
    color,
  }),
  withName: (name: string): Tag => ({
    ...mockTag,
    name,
  }),
  withId: (id: string): Tag => ({
    ...mockTag,
    id,
  }),
  multiple: (count: number): Tag[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `tag-${String(i + 1).padStart(3, '0')}`,
      name: `Tag ${i + 1}`,
      color: [
        TagColor.RED,
        TagColor.BLUE,
        TagColor.YELLOW,
        TagColor.GREEN,
        TagColor.PURPLE,
        TagColor.ORANGE,
        TagColor.GRAY,
      ][i % 7],
      createdAt: new Date(
        `2025-01-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`
      ),
      updatedAt: new Date(
        `2025-01-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`
      ),
    }));
  },
};

// API レスポンス用のモックデータ
export const mockCreateTagResponse: TagResponse = {
  tag: {
    id: 'tag-001',
    name: 'Important',
    color: TagColor.RED,
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
};

// リクエスト用のモックデータ
export const mockCreateTagRequest: CreateTagRequest = {
  name: 'Important',
  color: TagColor.RED,
};
