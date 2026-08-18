import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateTagRequest } from '@/adapters/repositories/tags';
import { useRepository } from '@/app/providers/RepositoryProvider';
import type { TagId } from '@/domain/models/tag';

import { QUERY_KEYS } from '../constants';

export const useUpdateTag = () => {
  const {
    tags: { updateTag },
  } = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tagId,
      request,
    }: {
      tagId: TagId;
      request: UpdateTagRequest;
    }) => updateTag(tagId, request),
    onSuccess: () => {
      // タグ一覧を再取得
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TAGS.LIST });
    },
  });
};
