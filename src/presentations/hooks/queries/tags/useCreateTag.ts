import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

import { QUERY_KEYS } from '../constants';

export const useCreateTag = () => {
  const {
    tags: { createTag },
  } = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      // タグ一覧を再取得
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TAGS.LIST });
    },
  });
};
