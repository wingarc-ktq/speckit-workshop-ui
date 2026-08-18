import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

import { QUERY_KEYS } from '../constants';

export const useDeleteTag = () => {
  const {
    tags: { deleteTag },
  } = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      // タグ一覧を再取得
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TAGS.LIST });
    },
  });
};
