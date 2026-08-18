import { useSuspenseQuery } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';
import type { FileQueryParams } from '@/domain/models/file';

import { QUERY_KEYS } from '../constants';

export const useFiles = (params: FileQueryParams = {}) => {
  const {
    files: { getFiles },
  } = useRepository();

  return useSuspenseQuery({
    queryKey: QUERY_KEYS.FILES.LIST(params),
    queryFn: () => getFiles(params),
  });
};
