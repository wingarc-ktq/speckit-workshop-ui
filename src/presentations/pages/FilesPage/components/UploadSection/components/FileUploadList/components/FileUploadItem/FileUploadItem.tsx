import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

import type { FileUploadStatus } from '@/domain/models/file';
import { FileUploadStatus as FileUploadStatusConst } from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import { formatFileSize } from '@/presentations/utils/fileFormatters';

import * as S from './styled';

interface FileUploadItemProps {
  id: string;
  file: File;
  progress: number;
  status: FileUploadStatus;
  error?: string;
  onRemove: (id: string) => void;
}

export const FileUploadItem: React.FC<FileUploadItemProps> = ({
  id,
  file,
  progress,
  status,
  error,
  onRemove,
}) => {
  const { t } = useTranslation();

  return (
    <S.FileItemPaper elevation={1} data-testid={`fileUploadItem-${id}`}>
      <S.StatusIconBox>
        {status === FileUploadStatusConst.UPLOADING && (
          <S.ProgressContainer>
            <S.ProgressText variant="caption">
              {t(tKeys.filesPage.uploadSection.progressPercent, {
                progress,
              })}
            </S.ProgressText>
          </S.ProgressContainer>
        )}
        {status === FileUploadStatusConst.SUCCESS && <S.SuccessIcon />}
        {status === FileUploadStatusConst.ERROR && <S.StyledErrorIcon />}
      </S.StatusIconBox>

      <S.FileInfoContainer>
        <S.FileNameRow>
          <S.FileName variant="body2">{file.name}</S.FileName>
          <S.FileSizeChip label={formatFileSize(file.size)} size="small" />
        </S.FileNameRow>

        {status === FileUploadStatusConst.UPLOADING && (
          <S.StyledLinearProgress variant="determinate" value={progress} />
        )}

        {status === FileUploadStatusConst.ERROR && error && (
          <S.ErrorMessage variant="caption">{error}</S.ErrorMessage>
        )}

        {status === FileUploadStatusConst.SUCCESS && (
          <S.SuccessMessage variant="caption">
            {t(tKeys.filesPage.uploadSection.uploadComplete)}
          </S.SuccessMessage>
        )}
      </S.FileInfoContainer>

      {status !== FileUploadStatusConst.UPLOADING && (
        <S.RemoveButton
          size="small"
          onClick={() => onRemove(id)}
          data-testid="deleteButton"
        >
          <CloseIcon fontSize="small" />
        </S.RemoveButton>
      )}
    </S.FileItemPaper>
  );
};
