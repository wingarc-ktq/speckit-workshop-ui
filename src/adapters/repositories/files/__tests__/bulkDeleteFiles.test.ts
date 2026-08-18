import { customInstance } from '@/adapters/axios';
import { bulkDeleteFiles } from '@/adapters/repositories/files/bulkDeleteFiles';
import { WebApiException } from '@/domain/errors';
import type { FileId } from '@/domain/models/file';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('bulkDeleteFiles', () => {
  describe('正常系', () => {
    test.concurrent(
      'ファイルIDリストを指定してファイルを一括削除できる',
      async () => {
        const fileIds: FileId[] = ['file-001', 'file-002', 'file-003'];
        mocked.mockResolvedValue(undefined);

        await bulkDeleteFiles(fileIds);

        expect(mocked).toHaveBeenCalledWith({
          url: '/files/bulk-delete',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: { fileIds },
        });
      }
    );

    test.concurrent('単一のファイルIDでも一括削除が実行される', async () => {
      const fileIds: FileId[] = ['file-001'];
      mocked.mockResolvedValue(undefined);

      await bulkDeleteFiles(fileIds);

      expect(mocked).toHaveBeenCalledWith({
        url: '/files/bulk-delete',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { fileIds },
      });
    });

    test.concurrent(
      '削除が正常に完了した場合、undefinedが返される',
      async () => {
        const fileIds: FileId[] = ['file-001', 'file-002'];
        mocked.mockResolvedValue(undefined);

        const result = await bulkDeleteFiles(fileIds);

        expect(result).toBeUndefined();
      }
    );
  });

  describe('異常系', () => {
    test.concurrent(
      '500エラーが発生した場合、WebApiExceptionがthrowされる',
      async () => {
        const fileIds: FileId[] = ['file-001'];
        const serverError = new WebApiException(500, 'Internal Server Error', {
          message: 'Server error occurred',
        });
        mocked.mockRejectedValueOnce(serverError);

        await expect(bulkDeleteFiles(fileIds)).rejects.toThrow(WebApiException);
      }
    );
  });
});
