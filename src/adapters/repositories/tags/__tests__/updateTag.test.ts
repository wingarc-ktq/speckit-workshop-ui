import { mockTag, mockTagVariations } from '@/__fixtures__/tags';
import { customInstance } from '@/adapters/axios';
import type { TagResponse } from '@/adapters/generated/files';
import { updateTag } from '@/adapters/repositories/tags/updateTag';
import { WebApiException } from '@/domain/errors';
import { TagColor } from '@/domain/models/tag';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('updateTag', () => {
  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にTagに変換される',
      async () => {
        const mockResponse: TagResponse = {
          tag: {
            id: mockTag.id,
            name: 'Updated Tag',
            color: TagColor.GREEN,
            createdAt: mockTag.createdAt.toISOString(),
            updatedAt: new Date('2025-01-10T15:30:00Z').toISOString(),
          },
        };
        mocked.mockResolvedValue(mockResponse);

        const updateRequest = {
          name: 'Updated Tag',
          color: TagColor.GREEN,
        };
        const result = await updateTag(mockTag.id, updateRequest);

        expect(mocked).toHaveBeenCalledWith({
          method: 'PUT',
          url: `/tags/${mockTag.id}`,
          headers: { 'Content-Type': 'application/json' },
          data: updateRequest,
        });

        expect(result).toEqual({
          id: mockResponse.tag.id,
          name: mockResponse.tag.name,
          color: mockResponse.tag.color,
          createdAt: new Date(mockResponse.tag.createdAt),
          updatedAt: new Date(mockResponse.tag.updatedAt),
        });
      }
    );

    test.concurrent('タグ名のみを更新できる', async () => {
      const mockResponse: TagResponse = {
        tag: {
          id: mockTag.id,
          name: 'Only Name Updated',
          color: mockTag.color,
          createdAt: mockTag.createdAt.toISOString(),
          updatedAt: new Date('2025-01-10T15:30:00Z').toISOString(),
        },
      };
      mocked.mockResolvedValue(mockResponse);

      const updateRequest = {
        name: 'Only Name Updated',
      };
      const result = await updateTag(mockTag.id, updateRequest);

      expect(mocked).toHaveBeenCalledWith({
        method: 'PUT',
        url: `/tags/${mockTag.id}`,
        headers: { 'Content-Type': 'application/json' },
        data: updateRequest,
      });

      expect(result.name).toBe('Only Name Updated');
      expect(result.color).toBe(mockTag.color);
    });

    test.concurrent('色のみを更新できる', async () => {
      const mockResponse: TagResponse = {
        tag: {
          id: mockTag.id,
          name: mockTag.name,
          color: TagColor.PURPLE,
          createdAt: mockTag.createdAt.toISOString(),
          updatedAt: new Date('2025-01-10T15:30:00Z').toISOString(),
        },
      };
      mocked.mockResolvedValue(mockResponse);

      const updateRequest = {
        color: TagColor.PURPLE,
      };
      const result = await updateTag(mockTag.id, updateRequest);

      expect(mocked).toHaveBeenCalledWith({
        method: 'PUT',
        url: `/tags/${mockTag.id}`,
        headers: { 'Content-Type': 'application/json' },
        data: updateRequest,
      });

      expect(result.name).toBe(mockTag.name);
      expect(result.color).toBe(TagColor.PURPLE);
    });

    test.concurrent('すべての色が正しく更新される', async () => {
      const colors = [
        TagColor.BLUE,
        TagColor.RED,
        TagColor.YELLOW,
        TagColor.GREEN,
        TagColor.PURPLE,
        TagColor.ORANGE,
        TagColor.GRAY,
      ];

      for (const color of colors) {
        const mockResponse: TagResponse = {
          tag: {
            id: mockTag.id,
            name: mockTag.name,
            color,
            createdAt: mockTag.createdAt.toISOString(),
            updatedAt: new Date('2025-01-10T15:30:00Z').toISOString(),
          },
        };
        mocked.mockResolvedValue(mockResponse);

        const result = await updateTag(mockTag.id, { color });

        expect(result.color).toBe(color);
      }
    });

    test.concurrent('異なるタグIDで更新できる', async () => {
      const customTag = mockTagVariations.withId('custom-tag-999');
      const mockResponse: TagResponse = {
        tag: {
          id: customTag.id,
          name: 'Custom Updated',
          color: TagColor.ORANGE,
          createdAt: customTag.createdAt.toISOString(),
          updatedAt: new Date('2025-01-10T15:30:00Z').toISOString(),
        },
      };
      mocked.mockResolvedValue(mockResponse);

      const updateRequest = {
        name: 'Custom Updated',
        color: TagColor.ORANGE,
      };
      const result = await updateTag(customTag.id, updateRequest);

      expect(mocked).toHaveBeenCalledWith({
        method: 'PUT',
        url: `/tags/${customTag.id}`,
        headers: { 'Content-Type': 'application/json' },
        data: updateRequest,
      });

      expect(result.id).toBe(customTag.id);
    });

    test.concurrent('更新日時が正しくDate型に変換される', async () => {
      const updatedAt = '2025-01-10T15:30:45.123Z';
      const mockResponse: TagResponse = {
        tag: {
          id: mockTag.id,
          name: mockTag.name,
          color: mockTag.color,
          createdAt: mockTag.createdAt.toISOString(),
          updatedAt,
        },
      };
      mocked.mockResolvedValue(mockResponse);

      const result = await updateTag(mockTag.id, { name: mockTag.name });

      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.toISOString()).toBe(updatedAt);
    });

    test.concurrent('作成日時と更新日時が異なる値で変換される', async () => {
      const createdAt = '2025-01-01T10:00:00.000Z';
      const updatedAt = '2025-01-10T15:30:00.000Z';
      const mockResponse: TagResponse = {
        tag: {
          id: mockTag.id,
          name: 'Updated',
          color: mockTag.color,
          createdAt,
          updatedAt,
        },
      };
      mocked.mockResolvedValue(mockResponse);

      const result = await updateTag(mockTag.id, { name: 'Updated' });

      expect(result.createdAt.toISOString()).toBe(createdAt);
      expect(result.updatedAt.toISOString()).toBe(updatedAt);
      expect(result.createdAt.getTime()).toBeLessThan(
        result.updatedAt.getTime()
      );
    });
  });

  describe('異常系', () => {
    test.concurrent('500エラーでWebApiExceptionがthrowされる', async () => {
      const serverError = new WebApiException(500, 'Internal Server Error', {
        message: 'Server error occurred',
      });
      mocked.mockRejectedValue(serverError);

      await expect(updateTag(mockTag.id, { name: 'Updated' })).rejects.toThrow(
        WebApiException
      );
    });
  });
});
