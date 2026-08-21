import { useQuery } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';
import type { GetFilesParams } from '@/adapters/generated/files';

import { QUERY_KEYS } from '../constants';

/**
 * ファイル一覧をフェッチするカスタムフック
 * @param params - クエリパラメータ（search, tagIds, page, limit）
 * @returns ファイル一覧データとクエリ状態
 */
export const useFileListQuery = (params?: GetFilesParams) => {
  const {
    files: { getFiles },
  } = useRepository();

  return useQuery({
    queryKey: [QUERY_KEYS.FILES.LIST, params],
    queryFn: () => getFiles(params),
    placeholderData: (previousData) => previousData, // 前のデータを保持してちらつき防止
  });
};
