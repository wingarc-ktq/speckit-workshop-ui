import React, { useCallback } from 'react';

import { useDropzone, type FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n/tKeys';
import {
  exceedsMaxUploadSize,
  isSupportedFileType,
} from '@/presentations/utils/fileFormatters';

import * as S from './styled';

interface FileUploadZoneProps {
  maxFiles?: number;
  disabled?: boolean;
  onFilesAccepted: (files: File[]) => void;
  onFilesRejected?: (files: File[]) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  maxFiles = 20,
  disabled = false,
  onFilesAccepted,
  onFilesRejected,
}) => {
  const { t } = useTranslation();

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // バリデーション
      const validFiles: File[] = [];
      const invalidFiles: File[] = [];

      acceptedFiles.forEach((file) => {
        if (!isSupportedFileType(file.type)) {
          invalidFiles.push(file);
        } else if (exceedsMaxUploadSize(file.size)) {
          invalidFiles.push(file);
        } else {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        onFilesAccepted(validFiles);
      }

      const rejectedFiles = fileRejections.map((rejection) => rejection.file);
      if (invalidFiles.length > 0 || rejectedFiles.length > 0) {
        onFilesRejected?.([...invalidFiles, ...rejectedFiles]);
      }
    },
    [onFilesAccepted, onFilesRejected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles,
    disabled,
    multiple: true,
    onDrop,
  });

  return (
    <S.DropZoneContainer
      {...getRootProps()}
      isDragActive={isDragActive}
      disabled={disabled}
      data-testid="dragAndDropArea"
    >
      <input {...getInputProps()} data-testid="dropInput" />
      <S.UploadIcon isDragActive={isDragActive} />
      <S.MainText variant="body1" isDragActive={isDragActive}>
        {isDragActive
          ? t(tKeys.filesPage.fileUploadZone.dragActive)
          : t(tKeys.filesPage.fileUploadZone.dragInactive)}
      </S.MainText>
      <S.SubText variant="caption">
        {t(tKeys.filesPage.fileUploadZone.supportedFormats)}
      </S.SubText>
    </S.DropZoneContainer>
  );
};
