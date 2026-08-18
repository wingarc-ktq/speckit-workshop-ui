import { useMutation } from '@tanstack/react-query';

import { useRepository } from '@/app/providers/RepositoryProvider';

export const useDownloadFile = () => {
  const {
    files: { downloadFile },
  } = useRepository();

  return useMutation({
    mutationFn: downloadFile,
  });
};
