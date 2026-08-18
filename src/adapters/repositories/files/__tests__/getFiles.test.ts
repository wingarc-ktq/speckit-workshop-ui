import {
  mockFileListApiResponse,
  mockFileListApiResponseVariations,
} from '@/__fixtures__/files';
import { getFiles as getFilesApi } from '@/adapters/generated/files';
import { getFiles } from '@/adapters/repositories/files/getFiles';
import { WebApiException } from '@/domain/errors';
import type { FileQueryParams } from '@/domain/models/file';

vi.mock('@/adapters/generated/files');
const mocked = vi.mocked(getFilesApi);

describe('getFiles', () => {
  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にFileListResponseに変換される',
      async () => {
        mocked.mockResolvedValue(mockFileListApiResponse);

        const params: FileQueryParams = {
          page: 1,
          limit: 20,
        };

        const result = await getFiles(params);

        expect(mocked).toHaveBeenCalledWith({
          search: undefined,
          tagIds: undefined,
          page: 1,
          limit: 20,
        });

        expect(result).toEqual({
          files: [
            {
              id: mockFileListApiResponse.files[0].id,
              name: mockFileListApiResponse.files[0].name,
              size: mockFileListApiResponse.files[0].size,
              mimeType: mockFileListApiResponse.files[0].mimeType,
              description: mockFileListApiResponse.files[0].description ?? null,
              uploadedAt: new Date(mockFileListApiResponse.files[0].uploadedAt),
              downloadUrl: mockFileListApiResponse.files[0].downloadUrl,
              tagIds: mockFileListApiResponse.files[0].tagIds,
            },
            {
              id: mockFileListApiResponse.files[1].id,
              name: mockFileListApiResponse.files[1].name,
              size: mockFileListApiResponse.files[1].size,
              mimeType: mockFileListApiResponse.files[1].mimeType,
              description: mockFileListApiResponse.files[1].description ?? null,
              uploadedAt: new Date(mockFileListApiResponse.files[1].uploadedAt),
              downloadUrl: mockFileListApiResponse.files[1].downloadUrl,
              tagIds: mockFileListApiResponse.files[1].tagIds,
            },
            {
              id: mockFileListApiResponse.files[2].id,
              name: mockFileListApiResponse.files[2].name,
              size: mockFileListApiResponse.files[2].size,
              mimeType: mockFileListApiResponse.files[2].mimeType,
              description: null,
              uploadedAt: new Date(mockFileListApiResponse.files[2].uploadedAt),
              downloadUrl: mockFileListApiResponse.files[2].downloadUrl,
              tagIds: mockFileListApiResponse.files[2].tagIds,
            },
          ],
          total: mockFileListApiResponse.total,
          page: mockFileListApiResponse.page,
          limit: mockFileListApiResponse.limit,
        });
      }
    );

    test.concurrent(
      '検索条件を指定した場合、正しくパラメータが渡される',
      async () => {
        mocked.mockResolvedValue(mockFileListApiResponse);

        const params: FileQueryParams = {
          search: 'document',
          tagIds: ['tag-001', 'tag-002'],
          page: 2,
          limit: 10,
        };

        await getFiles(params);

        expect(mocked).toHaveBeenCalledWith({
          search: 'document',
          tagIds: ['tag-001', 'tag-002'],
          page: 2,
          limit: 10,
        });
      }
    );

    test.concurrent(
      'descriptionがundefinedの場合、nullに変換される',
      async () => {
        const mockData = mockFileListApiResponseVariations.withSingleFile();
        mockData.files[0].description = undefined;
        mocked.mockResolvedValue(mockData);

        const result = await getFiles({ page: 1, limit: 20 });

        expect(result.files[0].description).toBeNull();
      }
    );

    test.concurrent('descriptionがnullの場合、nullが保持される', async () => {
      const mockData = mockFileListApiResponseVariations.withNullDescriptions();
      mocked.mockResolvedValue(mockData);

      const result = await getFiles({ page: 1, limit: 20 });

      expect(result.files[0].description).toBeNull();
    });

    test.concurrent('空のファイルリストの場合、空配列が返される', async () => {
      const mockData = mockFileListApiResponseVariations.withEmptyList();
      mocked.mockResolvedValue(mockData);

      const result = await getFiles({ page: 1, limit: 20 });

      expect(result.files).toEqual([]);
      expect(result.total).toBe(0);
    });

    test.concurrent(
      'uploadedAtが正しくDateオブジェクトに変換される',
      async () => {
        const testDateString = '2025-01-15T12:34:56Z';
        const mockData =
          mockFileListApiResponseVariations.withCustomDate(testDateString);
        mocked.mockResolvedValue(mockData);

        const result = await getFiles({ page: 1, limit: 20 });

        expect(result.files[0].uploadedAt).toEqual(new Date(testDateString));
        expect(result.files[0].uploadedAt).toBeInstanceOf(Date);
      }
    );

    test.concurrent('ページネーション情報が正しく保持される', async () => {
      const mockData = mockFileListApiResponseVariations.withPagination(3, 50);
      mocked.mockResolvedValue(mockData);

      const result = await getFiles({ page: 3, limit: 50 });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(50);
      expect(result.total).toBe(mockFileListApiResponse.total);
    });

    test.concurrent('パラメータが空の場合でも正常に動作する', async () => {
      mocked.mockResolvedValue(mockFileListApiResponse);

      const result = await getFiles({});

      expect(mocked).toHaveBeenCalledWith({
        search: undefined,
        tagIds: undefined,
        page: undefined,
        limit: undefined,
      });
      expect(result.files).toHaveLength(3);
    });

    test.concurrent('tagIdsが正しく変換される', async () => {
      mocked.mockResolvedValue(mockFileListApiResponse);

      const result = await getFiles({ page: 1, limit: 20 });

      expect(result.files[0].tagIds).toEqual([]);
      expect(result.files[1].tagIds).toEqual(['tag-001']);
      expect(result.files[2].tagIds).toEqual([]);
    });
  });

  describe('異常系', () => {
    test.concurrent('500エラーでWebApiExceptionがthrowされる', async () => {
      const serverError = new WebApiException(500, 'Internal Server Error', {
        message: 'Server error occurred',
      });
      mocked.mockRejectedValue(serverError);

      await expect(getFiles({ page: 1, limit: 20 })).rejects.toThrow(
        WebApiException
      );
    });
  });
});
