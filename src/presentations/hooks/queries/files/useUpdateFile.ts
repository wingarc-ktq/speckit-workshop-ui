import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';
import type { FileId, UpdateFileRequest } from '@/domain/models/file';

import { QUERY_KEYS } from '../constants';

export const useUpdateFile = () => {
  const {
    files: { updateFile },
  } = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileId,
      request,
    }: {
      fileId: FileId;
      request: UpdateFileRequest;
    }) => updateFile(fileId, request),
    onSuccess: () => {
      // ファイル一覧と詳細を再取得
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES.LIST() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FILES.DETAIL() });
    },
  });
};
