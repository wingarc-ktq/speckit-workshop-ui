import React from 'react';

import type { UploadingFile } from '@/domain/models/file';

import { FileUploadItem } from './components';
import * as S from './styled';

interface FileUploadListProps {
  files: UploadingFile[];
  onRemoveFile: (id: string) => void;
}

export const FileUploadList: React.FC<FileUploadListProps> = ({
  files,
  onRemoveFile,
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <S.FileListContainer data-testid="fileUploadList">
      {files.map((file) => (
        <FileUploadItem
          key={file.id}
          id={file.id}
          file={file.file}
          progress={file.progress}
          status={file.status}
          error={file.error}
          onRemove={onRemoveFile}
        />
      ))}
    </S.FileListContainer>
  );
};
