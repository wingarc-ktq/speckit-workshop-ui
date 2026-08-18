import { useSuspenseQuery } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';
import type { FileId } from '@/domain/models/file';

import { QUERY_KEYS } from '../constants';

export const useFileById = (fileId: FileId) => {
  const {
    files: { getFileById },
  } = useRepository();

  return useSuspenseQuery({
    queryKey: QUERY_KEYS.FILES.DETAIL(fileId),
    queryFn: () => getFileById(fileId),
  });
};
