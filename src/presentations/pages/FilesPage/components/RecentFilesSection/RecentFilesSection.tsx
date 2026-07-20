import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type { FileId } from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import {
  FileCard,
  FileDetailDialog,
  QueryBoundary,
} from '@/presentations/components';
import { useFiles } from '@/presentations/hooks/queries/files/useFiles';

import { EmptyRecentFiles, RecentFilesSkeleton } from './components';
import * as S from './styled';

export const RecentFilesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <S.Container data-testid="recentFilesSection">
      <S.Title>{t(tKeys.filesPage.recentFilesSection.title)}</S.Title>
      <QueryBoundary skeleton={<RecentFilesSkeleton />}>
        <FilesContent />
      </QueryBoundary>
    </S.Container>
  );
};

const FilesContent: React.FC = () => {
  const { data } = useFiles({ limit: 4 });
  const [selectedFileId, setSelectedFileId] = useState<FileId | null>(null);

  const handleViewFile = useCallback((fileId: string) => {
    setSelectedFileId(fileId);
  }, []);

  const handleCloseDetailDialog = useCallback(() => {
    setSelectedFileId(null);
  }, []);

  return (
    <>
      {data.files.length === 0 ? (
        <EmptyRecentFiles />
      ) : (
        <S.FilesContainer>
          {data.files.map((file) => (
            <FileCard key={file.id} file={file} onView={handleViewFile} />
          ))}
        </S.FilesContainer>
      )}

      {selectedFileId !== null && (
        <FileDetailDialog
          fileId={selectedFileId}
          onClose={handleCloseDetailDialog}
        />
      )}
    </>
  );
};
