import React from 'react';

import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { DocumentFile } from '@/domain/models/file';
import { tKeys } from '@/i18n/tKeys';
import { TagChips } from '@/presentations/components/tags/TagChips/TagChips';
import { useTags } from '@/presentations/hooks/queries/tags/useTags';

import * as S from './styled';

interface FileCardProps {
  file: DocumentFile;
  onView?: (fileId: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onView }) => {
  const { t } = useTranslation();
  const { data: tags } = useTags();

  const fileTags = tags.filter((tag) => file.tagIds.includes(tag.id));

  return (
    <S.StyledCard>
      <S.StyledCardContent>
        <S.ContentContainer>
          <S.IconContainer>
            <S.FileIcon />
          </S.IconContainer>
          <S.TagChipsContainer>
            {fileTags.length > 0 && <TagChips tags={fileTags} size="small" />}
          </S.TagChipsContainer>
          <S.FileName>{file.name}</S.FileName>
          <S.DateContainer>
            <S.DateIcon />
            <S.DateText variant="caption">
              {format(file.uploadedAt, 'yyyy/MM/dd')}
            </S.DateText>
          </S.DateContainer>
        </S.ContentContainer>
      </S.StyledCardContent>
      <S.StyledCardActions>
        <S.ViewButton
          fullWidth
          variant="contained"
          size="small"
          endIcon={<ArrowOutwardIcon />}
          onClick={() => onView?.(file.id)}
        >
          {t(tKeys.filesPage.recentFilesSection.fileCard.viewButton)}
        </S.ViewButton>
      </S.StyledCardActions>
    </S.StyledCard>
  );
};
