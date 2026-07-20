import React from 'react';

import { MyFilesSection, RecentFilesSection, UploadSection } from './components';
import { useFilesSearchParams } from './hooks/useFilesSearchParams';
import * as S from './styled';

export const FilesPage: React.FC = () => {
  const { searchQuery, tagIds } = useFilesSearchParams();
  const isSearching = !!searchQuery;

  return (
    <S.Page data-testid="filesPage">
      {!isSearching && (
        <>
          <RecentFilesSection />
          <UploadSection />
        </>
      )}
      <MyFilesSection searchQuery={searchQuery} tagIds={tagIds} />
    </S.Page>
  );
};
