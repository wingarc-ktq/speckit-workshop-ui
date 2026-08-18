import {
  mockUpdateFileRequest,
  mockUpdateFileRequestPartial,
  mockUpdateFileRequestWithTags,
  mockUpdateFileRequestWithoutTagIds,
  mockUpdatedFileResponse,
  mockFileResponseVariations,
} from '@/__fixtures__/files';
import { customInstance } from '@/adapters/axios';
import { updateFile } from '@/adapters/repositories/files/updateFile';
import { WebApiException } from '@/domain/errors';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('updateFile', () => {
  const fileId = 'file-001';

  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にFileモデルに変換される',
      async () => {
        mocked.mockResolvedValue(mockUpdatedFileResponse);

        const result = await updateFile(fileId, mockUpdateFileRequest);

        expect(mocked).toHaveBeenCalledWith({
          method: 'PUT',
          url: `/files/${fileId}`,
          headers: { 'Content-Type': 'application/json' },
          data: mockUpdateFileRequest,
        });

        expect(result).toEqual({
          id: mockUpdatedFileResponse.file.id,
          name: mockUpdatedFileResponse.file.name,
          size: mockUpdatedFileResponse.file.size,
          mimeType: mockUpdatedFileResponse.file.mimeType,
          description: mockUpdatedFileResponse.file.description,
          uploadedAt: new Date(mockUpdatedFileResponse.file.uploadedAt),
          downloadUrl: mockUpdatedFileResponse.file.downloadUrl,
          tagIds: mockUpdatedFileResponse.file.tagIds,
        });
      }
    );

    test.concurrent(
      'ファイル名のみを更新する場合、正常に処理される',
      async () => {
        // ファイル名のみを更新した場合のレスポンス（tagIdsは空配列）
        const mockResponse = mockFileResponseVariations.withTagIds([]);
        mockResponse.file.name = mockUpdateFileRequestPartial.name!;
        mocked.mockResolvedValue(mockResponse);

        const result = await updateFile(fileId, mockUpdateFileRequestPartial);

        expect(mocked).toHaveBeenCalledWith({
          method: 'PUT',
          url: `/files/${fileId}`,
          headers: { 'Content-Type': 'application/json' },
          data: mockUpdateFileRequestPartial,
        });

        expect(result.name).toBe(mockResponse.file.name);
        expect(result.tagIds).toEqual(mockResponse.file.tagIds);
      }
    );

    test.concurrent('タグIDのみを更新する場合、正常に処理される', async () => {
      // タグIDのみを更新した場合のレスポンス
      const mockResponse = mockFileResponseVariations.withTagIds(
        mockUpdateFileRequestWithTags.tagIds!
      );
      mocked.mockResolvedValue(mockResponse);

      const result = await updateFile(fileId, mockUpdateFileRequestWithTags);

      expect(mocked).toHaveBeenCalledWith({
        method: 'PUT',
        url: `/files/${fileId}`,
        headers: { 'Content-Type': 'application/json' },
        data: mockUpdateFileRequestWithTags,
      });

      expect(result.tagIds).toEqual(mockResponse.file.tagIds);
    });

    test.concurrent('tagIdsが未指定の場合、空配列がセットされる', async () => {
      // tagIdsが未指定の場合のレスポンス（空配列が返される）
      const mockResponse = mockFileResponseVariations.withTagIds([]);
      mockResponse.file.name = mockUpdateFileRequestWithoutTagIds.name!;
      mockResponse.file.description =
        mockUpdateFileRequestWithoutTagIds.description;
      mocked.mockResolvedValue(mockResponse);

      const result = await updateFile(
        fileId,
        mockUpdateFileRequestWithoutTagIds
      );

      expect(result.tagIds).toEqual(mockResponse.file.tagIds);
    });

    test.concurrent(
      'descriptionがundefinedの場合、nullに変換される',
      async () => {
        const mockData = mockFileResponseVariations.withoutDescription();
        mocked.mockResolvedValue(mockData);

        const result = await updateFile(fileId, mockUpdateFileRequest);

        expect(result.description).toBeNull();
      }
    );

    test.concurrent('descriptionがnullの場合、nullが保持される', async () => {
      const mockData = mockFileResponseVariations.withNullDescription();
      mocked.mockResolvedValue(mockData);

      const result = await updateFile(fileId, mockUpdateFileRequest);

      expect(result.description).toBeNull();
    });

    test.concurrent(
      'uploadedAtが正しくDateオブジェクトに変換される',
      async () => {
        mocked.mockResolvedValue(mockUpdatedFileResponse);

        const result = await updateFile(fileId, mockUpdateFileRequest);

        expect(result.uploadedAt).toBeInstanceOf(Date);
        expect(result.uploadedAt.toISOString()).toBe(
          new Date(mockUpdatedFileResponse.file.uploadedAt).toISOString()
        );
      }
    );
  });

  describe('異常系', () => {
    test.concurrent('500エラーでWebApiExceptionがthrowされる', async () => {
      const serverError = new WebApiException(500, 'Internal Server Error', {
        message: 'Server error',
      });
      mocked.mockRejectedValue(serverError);

      await expect(updateFile(fileId, mockUpdateFileRequest)).rejects.toThrow(
        WebApiException
      );
    });
  });
});
