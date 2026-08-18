import {
  mockFileResponse,
  mockFileResponseVariations,
} from '@/__fixtures__/files';
import { customInstance } from '@/adapters/axios';
import { getFileById } from '@/adapters/repositories/files/getFileById';
import { WebApiException } from '@/domain/errors';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('getFileById', () => {
  const testFileId = 'file-001';

  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にFileモデルに変換される',
      async () => {
        mocked.mockResolvedValue(mockFileResponse);

        const result = await getFileById(testFileId);

        expect(mocked).toHaveBeenCalledWith({
          method: 'GET',
          url: `/files/${testFileId}`,
        });

        expect(result).toEqual({
          id: mockFileResponse.file.id,
          name: mockFileResponse.file.name,
          size: mockFileResponse.file.size,
          mimeType: mockFileResponse.file.mimeType,
          description: mockFileResponse.file.description,
          uploadedAt: new Date(mockFileResponse.file.uploadedAt),
          downloadUrl: mockFileResponse.file.downloadUrl,
          tagIds: mockFileResponse.file.tagIds,
        });
      }
    );

    test.concurrent('descriptionがnullの場合、nullが保持される', async () => {
      const mockData = mockFileResponseVariations.withNullDescription();
      mocked.mockResolvedValue(mockData);

      const result = await getFileById(testFileId);

      expect(result.description).toBeNull();
    });

    test.concurrent(
      'descriptionがundefinedの場合、nullに変換される',
      async () => {
        const mockData = mockFileResponseVariations.withoutDescription();
        mocked.mockResolvedValue(mockData);

        const result = await getFileById(testFileId);

        expect(result.description).toBeNull();
      }
    );

    test.concurrent(
      'uploadedAtが正しくDateオブジェクトに変換される',
      async () => {
        mocked.mockResolvedValue(mockFileResponse);

        const result = await getFileById(testFileId);

        expect(result.uploadedAt).toBeInstanceOf(Date);
        expect(result.uploadedAt.toISOString()).toBe(
          new Date(mockFileResponse.file.uploadedAt).toISOString()
        );
      }
    );

    test.concurrent(
      'tagIdsがAPIレスポンスから正しくマッピングされること',
      async () => {
        const expectedTagIds = ['tag-001', 'tag-002', 'tag-003'];
        const mockData = mockFileResponseVariations.withTagIds(expectedTagIds);
        mocked.mockResolvedValue(mockData);

        const result = await getFileById(testFileId);

        expect(result.tagIds).toEqual(expectedTagIds);
        expect(Array.isArray(result.tagIds)).toBe(true);
      }
    );

    test.concurrent('ファイルサイズが正しく保持される', async () => {
      const customSize = 1024 * 1024 * 5; // 5MB
      const mockData = mockFileResponseVariations.withDifferentSize(customSize);
      mocked.mockResolvedValue(mockData);

      const result = await getFileById(testFileId);

      expect(result.size).toBe(customSize);
    });
  });

  describe('異常系', () => {
    test.concurrent('500エラーでWebApiExceptionがthrowされる', async () => {
      const serverError = new WebApiException(500, 'Internal Server Error', {
        message: 'Server error occurred',
      });
      mocked.mockRejectedValue(serverError);

      await expect(getFileById(testFileId)).rejects.toThrow(WebApiException);
    });
  });
});
