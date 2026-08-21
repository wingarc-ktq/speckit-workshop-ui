import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadFile } from '@/adapters/repositories/files';
import type { UploadFileBody, FileResponse } from '@/adapters/generated/files';

interface UseUploadFilesOptions {
  onSuccess?: (data: FileResponse) => void | Promise<void>;
  onError?: (error: Error) => void;
}

/**
 * ファイルアップロードのmutationカスタムフック
 * アップロード成功時にファイル一覧を更新
 */
export const useUploadFiles = (options?: UseUploadFilesOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const body: UploadFileBody = {
        file,
      };
      return uploadFile(body);
    },
    onSuccess: async (data) => {
      // アップロード成功時にファイル一覧キャッシュを無効化（検索パラメータに関わらず）
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey as unknown[];
          return Array.isArray(queryKey) && 
                 Array.isArray(queryKey[0]) && 
                 queryKey[0].includes('files') && 
                 queryKey[0].includes('list');
        }
      });
      await options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });

  return mutation;
};
