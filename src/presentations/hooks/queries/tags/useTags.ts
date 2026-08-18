import { useSuspenseQuery } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

import { QUERY_KEYS } from '../constants';

export const useTags = () => {
  const {
    tags: { getTags },
  } = useRepository();

  return useSuspenseQuery({
    queryKey: QUERY_KEYS.TAGS.LIST,
    queryFn: getTags,
  });
};
