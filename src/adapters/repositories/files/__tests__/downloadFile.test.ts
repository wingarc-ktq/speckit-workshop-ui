import { mockFileInfo } from '@/__fixtures__/files';
import { customInstance } from '@/adapters/axios';
import { downloadFile } from '@/adapters/repositories/files/downloadFile';
import { WebApiException } from '@/domain/errors';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('downloadFile', () => {
  describe('正常系', () => {
    test.concurrent('ファイルIDを指定してBlobデータが取得できる', async () => {
      const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
      mocked.mockResolvedValue(mockBlob);

      const result = await downloadFile(mockFileInfo.id);

      expect(mocked).toHaveBeenCalledWith({
        method: 'GET',
        url: `/files/${mockFileInfo.id}/download`,
        responseType: 'blob',
      });

      expect(result).toBe(mockBlob);
    });

    test.concurrent('異なるファイルIDでもダウンロードが成功する', async () => {
      const differentFileId = 'file-999';
      const mockBlob = new Blob(['different content'], {
        type: 'text/plain',
      });
      mocked.mockResolvedValue(mockBlob);

      const result = await downloadFile(differentFileId);

      expect(mocked).toHaveBeenCalledWith({
        method: 'GET',
        url: `/files/${differentFileId}/download`,
        responseType: 'blob',
      });

      expect(result).toBe(mockBlob);
    });

    test.concurrent('取得したBlobがそのまま返される', async () => {
      const mockBlob = new Blob(['binary data'], {
        type: 'application/octet-stream',
      });
      mocked.mockResolvedValue(mockBlob);

      const result = await downloadFile(mockFileInfo.id);

      expect(result).toBeInstanceOf(Blob);
      expect(result).toBe(mockBlob);
    });

    test.concurrent('空のBlobでも正常に取得できる', async () => {
      const emptyBlob = new Blob([], { type: 'application/pdf' });
      mocked.mockResolvedValue(emptyBlob);

      const result = await downloadFile(mockFileInfo.id);

      expect(result).toBe(emptyBlob);
      expect(result.size).toBe(0);
    });

    test.concurrent('大きなBlobデータも正常に取得できる', async () => {
      const largeContent = new Array(1024 * 1024).fill('x').join(''); // 約1MB
      const largeBlob = new Blob([largeContent], { type: 'application/pdf' });
      mocked.mockResolvedValue(largeBlob);

      const result = await downloadFile(mockFileInfo.id);

      expect(result).toBe(largeBlob);
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('異常系', () => {
    test.concurrent('500エラーでWebApiExceptionがthrowされる', async () => {
      const serverError = new WebApiException(500, 'Internal Server Error', {
        message: 'Server error occurred while downloading file',
      });
      mocked.mockRejectedValue(serverError);

      await expect(downloadFile(mockFileInfo.id)).rejects.toThrow(
        WebApiException
      );
    });
  });
});
