import { mockTagVariations } from '@/__fixtures__/tags';
import { customInstance } from '@/adapters/axios';
import { getTags } from '@/adapters/repositories/tags/getTags';
import { WebApiException } from '@/domain/errors';
import { TagColor } from '@/domain/models/tag';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('getTags', () => {
  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にTag配列に変換される',
      async () => {
        const mockApiResponse = {
          tags: [
            {
              id: 'tag-001',
              name: 'Important',
              color: TagColor.RED,
              createdAt: '2025-01-01T10:00:00Z',
              updatedAt: '2025-01-01T10:00:00Z',
            },
            {
              id: 'tag-002',
              name: 'Review',
              color: TagColor.BLUE,
              createdAt: '2025-01-02T10:00:00Z',
              updatedAt: '2025-01-02T10:00:00Z',
            },
            {
              id: 'tag-003',
              name: 'Urgent',
              color: TagColor.ORANGE,
              createdAt: '2025-01-03T10:00:00Z',
              updatedAt: '2025-01-03T10:00:00Z',
            },
          ],
        };

        mocked.mockResolvedValue(mockApiResponse);

        const result = await getTags();

        expect(mocked).toHaveBeenCalledWith({
          method: 'GET',
          url: `/tags`,
        });

        expect(result).toEqual([
          {
            id: 'tag-001',
            name: 'Important',
            color: TagColor.RED,
            createdAt: new Date('2025-01-01T10:00:00Z'),
            updatedAt: new Date('2025-01-01T10:00:00Z'),
          },
          {
            id: 'tag-002',
            name: 'Review',
            color: TagColor.BLUE,
            createdAt: new Date('2025-01-02T10:00:00Z'),
            updatedAt: new Date('2025-01-02T10:00:00Z'),
          },
          {
            id: 'tag-003',
            name: 'Urgent',
            color: TagColor.ORANGE,
            createdAt: new Date('2025-01-03T10:00:00Z'),
            updatedAt: new Date('2025-01-03T10:00:00Z'),
          },
        ]);
      }
    );

    test.concurrent('タグが空の配列の場合、空配列が返される', async () => {
      const mockApiResponse = {
        tags: [],
      };

      mocked.mockResolvedValue(mockApiResponse);

      const result = await getTags();

      expect(result).toEqual([]);
    });

    test.concurrent('多数のタグが存在する場合も正しく変換される', async () => {
      const multipleTags = mockTagVariations.multiple(10);
      const mockApiResponse = {
        tags: multipleTags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          createdAt: tag.createdAt.toISOString(),
          updatedAt: tag.updatedAt.toISOString(),
        })),
      };

      mocked.mockResolvedValue(mockApiResponse);

      const result = await getTags();

      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({
        id: multipleTags[0].id,
        name: multipleTags[0].name,
        color: multipleTags[0].color,
        createdAt: multipleTags[0].createdAt,
        updatedAt: multipleTags[0].updatedAt,
      });
    });

    test.concurrent(
      '日時文字列が正しくDateオブジェクトに変換される',
      async () => {
        const mockApiResponse = {
          tags: [
            {
              id: 'tag-001',
              name: 'Test Tag',
              color: TagColor.RED,
              createdAt: '2025-01-15T12:34:56.789Z',
              updatedAt: '2025-01-20T09:30:45.123Z',
            },
          ],
        };

        mocked.mockResolvedValue(mockApiResponse);

        const result = await getTags();

        expect(result[0].createdAt).toBeInstanceOf(Date);
        expect(result[0].updatedAt).toBeInstanceOf(Date);
        expect(result[0].createdAt.toISOString()).toBe(
          '2025-01-15T12:34:56.789Z'
        );
        expect(result[0].updatedAt.toISOString()).toBe(
          '2025-01-20T09:30:45.123Z'
        );
      }
    );
  });

  describe('異常系', () => {
    test.concurrent('500エラーでWebApiExceptionがthrowされる', async () => {
      const serverError = new WebApiException(500, 'Internal Server Error', {
        message: 'Server error occurred',
      });
      mocked.mockRejectedValue(serverError);

      await expect(getTags()).rejects.toThrow(WebApiException);
    });
  });
});
