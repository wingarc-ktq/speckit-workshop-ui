import React from 'react';

import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { DocumentFile } from '@/domain/models/file';
import type { Tag } from '@/domain/models/tag';
import { tKeys } from '@/i18n/tKeys';
import { TagChips } from '@/presentations/components/tags/TagChips/TagChips';
import { formatFileSize } from '@/presentations/utils/fileFormatters';

import * as S from './styled';

interface FileInfoProps {
  file: DocumentFile;
  tags: Tag[];
}

export const FileInfo: React.FC<FileInfoProps> = ({ file, tags }) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <S.FieldContainer>
        <S.FieldLabel>
          {t(tKeys.filesPage.fileDetailDialog.fileName)}
        </S.FieldLabel>
        <S.FieldValue>{file.name}</S.FieldValue>
      </S.FieldContainer>
      <Divider />
      <S.FieldContainer>
        <S.FieldLabel>
          {t(tKeys.filesPage.fileDetailDialog.fileSize)}
        </S.FieldLabel>
        <S.FieldValue>{formatFileSize(file.size)}</S.FieldValue>
      </S.FieldContainer>
      <Divider />
      <S.FieldContainer>
        <S.FieldLabel>
          {t(tKeys.filesPage.fileDetailDialog.uploadedAt)}
        </S.FieldLabel>
        <S.FieldValue>
          {format(file.uploadedAt, 'yyyy/MM/dd HH:mm')}
        </S.FieldValue>
      </S.FieldContainer>
      <Divider />
      <S.FieldContainer>
        <S.FieldLabel>{t(tKeys.filesPage.fileDetailDialog.tags)}</S.FieldLabel>
        {tags.length > 0 ? (
          <TagChips tags={tags} size="small" />
        ) : (
          <S.NoTagsText>
            {t(tKeys.filesPage.fileDetailDialog.noTags)}
          </S.NoTagsText>
        )}
      </S.FieldContainer>
      {file.description && (
        <>
          <Divider />
          <S.FieldContainer>
            <S.FieldLabel>
              {t(tKeys.filesPage.fileDetailDialog.description)}
            </S.FieldLabel>
            <S.FieldValue>{file.description}</S.FieldValue>
          </S.FieldContainer>
        </>
      )}
    </Stack>
  );
};
