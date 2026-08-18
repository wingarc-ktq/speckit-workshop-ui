import {
  mockCreateTagRequest,
  mockCreateTagResponse,
} from '@/__fixtures__/tags';
import { customInstance } from '@/adapters/axios';
import { createTag } from '@/adapters/repositories/tags/createTag';
import { WebApiException } from '@/domain/errors';
import { TagColor } from '@/domain/models/tag';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('createTag', () => {
  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にTagに変換される',
      async () => {
        mocked.mockResolvedValue(mockCreateTagResponse);

        const result = await createTag(mockCreateTagRequest);

        expect(mocked).toHaveBeenCalledWith({
          method: 'POST',
          url: '/tags',
          headers: { 'Content-Type': 'application/json' },
          data: mockCreateTagRequest,
        });

        expect(result).toEqual({
          id: mockCreateTagResponse.tag.id,
          name: mockCreateTagResponse.tag.name,
          color: mockCreateTagResponse.tag.color,
          createdAt: new Date(mockCreateTagResponse.tag.createdAt),
          updatedAt: new Date(mockCreateTagResponse.tag.updatedAt),
        });
      }
    );

    test.concurrent('各カラーの値が正しく変換される', async () => {
      const blueTagResponse = {
        tag: {
          ...mockCreateTagResponse.tag,
          color: TagColor.BLUE,
        },
      };
      mocked.mockResolvedValue(blueTagResponse);

      const result = await createTag({ name: 'Test', color: TagColor.BLUE });

      expect(result.color).toBe(TagColor.BLUE);
    });

    test.concurrent(
      'ISO8601形式の日付文字列が正しくDateオブジェクトに変換される',
      async () => {
        const customDateResponse = {
          tag: {
            ...mockCreateTagResponse.tag,
            createdAt: '2025-06-15T14:30:45Z',
            updatedAt: '2025-06-15T14:30:45Z',
          },
        };
        mocked.mockResolvedValue(customDateResponse);

        const result = await createTag(mockCreateTagRequest);

        expect(result.createdAt).toEqual(new Date('2025-06-15T14:30:45Z'));
        expect(result.updatedAt).toEqual(new Date('2025-06-15T14:30:45Z'));
      }
    );

    test.concurrent('タグ名の最大長(50文字)が正しく処理される', async () => {
      const longName = 'A'.repeat(50);
      const longNameResponse = {
        tag: {
          ...mockCreateTagResponse.tag,
          name: longName,
        },
      };
      mocked.mockResolvedValue(longNameResponse);

      const result = await createTag({ name: longName, color: TagColor.RED });

      expect(result.name).toBe(longName);
      expect(result.name).toHaveLength(50);
    });

    test.concurrent(
      '全てのカラーバリエーションが正しく処理される',
      async () => {
        const colors = [
          TagColor.RED,
          TagColor.BLUE,
          TagColor.YELLOW,
          TagColor.GREEN,
          TagColor.PURPLE,
          TagColor.ORANGE,
          TagColor.GRAY,
        ];

        for (const color of colors) {
          const colorResponse = {
            tag: {
              ...mockCreateTagResponse.tag,
              color,
            },
          };
          mocked.mockResolvedValue(colorResponse);

          const result = await createTag({ name: 'Test', color });

          expect(result.color).toBe(color);
        }
      }
    );
  });

  describe('異常系', () => {
    test.concurrent(
      'サーバーエラーが発生した場合、WebApiExceptionがthrowされる',
      async () => {
        const serverError = new WebApiException(500, 'Internal Server Error', {
          message: 'Server error occurred',
        });
        mocked.mockRejectedValue(serverError);

        await expect(createTag(mockCreateTagRequest)).rejects.toThrow(
          WebApiException
        );
      }
    );
  });
});
