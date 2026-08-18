import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

import { QUERY_KEYS } from '../constants';

export const useDeleteFile = () => {
  const {
    files: { deleteFile },
  } = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      // ファイル一覧を再取得
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FILES.LIST()] });
    },
  });
};
