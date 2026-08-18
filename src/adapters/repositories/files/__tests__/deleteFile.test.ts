import { mockFileInfo } from '@/__fixtures__/files';
import { customInstance } from '@/adapters/axios';
import { deleteFile } from '@/adapters/repositories/files/deleteFile';
import { WebApiException } from '@/domain/errors';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('deleteFile', () => {
  describe('正常系', () => {
    test.concurrent('ファイルIDを指定して削除が成功する', async () => {
      mocked.mockResolvedValue(undefined);

      await deleteFile(mockFileInfo.id);

      expect(mocked).toHaveBeenCalledWith({
        method: 'DELETE',
        url: `/files/${mockFileInfo.id}`,
      });
    });

    test.concurrent('異なるファイルIDでも削除が成功する', async () => {
      const differentFileId = 'file-999';
      mocked.mockResolvedValue(undefined);

      await deleteFile(differentFileId);

      expect(mocked).toHaveBeenCalledWith({
        method: 'DELETE',
        url: `/files/${differentFileId}`,
      });
    });

    test.concurrent('削除成功時は戻り値がundefinedである', async () => {
      mocked.mockResolvedValue(undefined);

      const result = await deleteFile(mockFileInfo.id);

      expect(result).toBeUndefined();
    });
  });

  describe('異常系', () => {
    test.concurrent('500エラーでWebApiExceptionがthrowされる', async () => {
      const serverError = new WebApiException(500, 'Internal Server Error', {
        message: 'Server error occurred',
      });
      mocked.mockRejectedValue(serverError);

      await expect(deleteFile(mockFileInfo.id)).rejects.toThrow(
        WebApiException
      );
    });
  });
});
