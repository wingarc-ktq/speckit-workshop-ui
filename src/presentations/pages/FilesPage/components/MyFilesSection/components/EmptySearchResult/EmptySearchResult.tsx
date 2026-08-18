import React from 'react';

import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n/tKeys';

import * as S from './styled';

export const EmptySearchResult: React.FC = () => {
  const { t } = useTranslation();

  return (
    <S.EmptyState data-testid="emptySearchResult">
      <S.EmptyStateTitle>
        {t(tKeys.filesPage.myFilesSection.noResults)}
      </S.EmptyStateTitle>
      <S.EmptyStateDescription>
        {t(tKeys.filesPage.myFilesSection.noResultsDescription)}
      </S.EmptyStateDescription>
    </S.EmptyState>
  );
};
