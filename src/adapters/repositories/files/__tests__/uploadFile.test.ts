import {
  mockFileResponse,
  mockFileResponseVariations,
  mockUploadFileRequest,
  mockUploadFileRequestWithoutDescription,
} from '@/__fixtures__/files';
import { customInstance } from '@/adapters/axios';
import { uploadFile } from '@/adapters/repositories/files/uploadFile';
import { WebApiException } from '@/domain/errors';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('uploadFile', () => {
  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にFileに変換される',
      async () => {
        mocked.mockResolvedValue(mockFileResponse);

        const result = await uploadFile(mockUploadFileRequest);

        expect(mocked).toHaveBeenCalledWith({
          method: 'POST',
          url: '/files',
          headers: { 'Content-Type': 'multipart/form-data' },
          data: expect.any(FormData),
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

    test.concurrent(
      'descriptionが未指定の場合、正常にアップロードされる',
      async () => {
        mocked.mockResolvedValue(mockFileResponse);

        const result = await uploadFile(
          mockUploadFileRequestWithoutDescription
        );

        expect(mocked).toHaveBeenCalledWith({
          method: 'POST',
          url: '/files',
          headers: { 'Content-Type': 'multipart/form-data' },
          data: expect.any(FormData),
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

    test.concurrent(
      'descriptionがundefinedの場合、nullに変換される',
      async () => {
        const mockData = mockFileResponseVariations.withoutDescription();
        mocked.mockResolvedValue(mockData);

        const result = await uploadFile(mockUploadFileRequest);

        expect(result.description).toBeNull();
      }
    );

    test.concurrent('descriptionがnullの場合、nullが保持される', async () => {
      const mockData = mockFileResponseVariations.withNullDescription();
      mocked.mockResolvedValue(mockData);

      const result = await uploadFile(mockUploadFileRequest);

      expect(result.description).toBeNull();
    });

    test.concurrent(
      'uploadedAtが正しくDateオブジェクトに変換される',
      async () => {
        mocked.mockResolvedValue(mockFileResponse);

        const result = await uploadFile(mockUploadFileRequest);

        expect(result.uploadedAt).toBeInstanceOf(Date);
        expect(result.uploadedAt).toEqual(
          new Date(mockFileResponse.file.uploadedAt)
        );
      }
    );

    test.concurrent(
      'tagIdsがAPIレスポンスから正しくマッピングされること',
      async () => {
        const mockDataWithTags = mockFileResponseVariations.withTagIds([
          'tag-001',
          'tag-002',
        ]);
        mocked.mockResolvedValue(mockDataWithTags);

        const result = await uploadFile(mockUploadFileRequest);

        expect(result.tagIds).toEqual(['tag-001', 'tag-002']);
        expect(Array.isArray(result.tagIds)).toBe(true);
      }
    );
  });

  describe('異常系', () => {
    test.concurrent('500エラーでWebApiExceptionがthrowされる', async () => {
      const internalServerError = new WebApiException(
        500,
        'Internal Server Error',
        {
          message: 'Server error occurred',
        }
      );
      mocked.mockRejectedValue(internalServerError);

      await expect(uploadFile(mockUploadFileRequest)).rejects.toThrow(
        WebApiException
      );
    });
  });
});
