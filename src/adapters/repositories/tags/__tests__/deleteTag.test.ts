import { mockTag } from '@/__fixtures__/tags';
import { customInstance } from '@/adapters/axios';
import { deleteTag } from '@/adapters/repositories/tags/deleteTag';
import { WebApiException } from '@/domain/errors';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('deleteTag', () => {
  describe('正常系', () => {
    test.concurrent('正常なレスポンスの場合、voidが返される', async () => {
      mocked.mockResolvedValue(undefined);

      const result = await deleteTag(mockTag.id);

      expect(mocked).toHaveBeenCalledWith({
        method: 'DELETE',
        url: `/tags/${mockTag.id}`,
      });

      expect(result).toBeUndefined();
    });

    test.concurrent('タグIDが正しくURLパスに含まれる', async () => {
      const customTagId = 'tag-custom-123';
      mocked.mockResolvedValue(undefined);

      await deleteTag(customTagId);

      expect(mocked).toHaveBeenCalledWith({
        method: 'DELETE',
        url: `/tags/${customTagId}`,
      });
    });

    test.concurrent('UUIDフォーマットのタグIDが正しく処理される', async () => {
      const uuidTagId = '550e8400-e29b-41d4-a716-446655440000';
      mocked.mockResolvedValue(undefined);

      await deleteTag(uuidTagId);

      expect(mocked).toHaveBeenCalledWith({
        method: 'DELETE',
        url: `/tags/${uuidTagId}`,
      });
    });
  });

  describe('異常系', () => {
    test.concurrent(
      '500エラー（サーバーエラー）の場合、WebApiExceptionがthrowされる',
      async () => {
        const serverError = new WebApiException(500, 'Internal Server Error', {
          message: 'Database connection failed',
        });
        mocked.mockRejectedValue(serverError);

        await expect(deleteTag(mockTag.id)).rejects.toThrow(WebApiException);
      }
    );
  });
});
