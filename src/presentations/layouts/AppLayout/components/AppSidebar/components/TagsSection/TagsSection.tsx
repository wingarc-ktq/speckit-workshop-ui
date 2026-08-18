import React, { useCallback, useState } from 'react';

import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n';
import { useTags } from '@/presentations/hooks/queries/tags/useTags';
import { useFilesSearchParams } from '@/presentations/pages/FilesPage/hooks/useFilesSearchParams';

import { TagListItem, TagManagementDialog } from './components';
import * as S from './styled';

export const TagsSection: React.FC = () => {
  const { t } = useTranslation();
  const { tagIds, setTagIds } = useFilesSearchParams();
  const { data: tags = [], isLoading } = useTags();
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  const handleTagClick = useCallback(
    (tagId: string) => {
      // 選択されていなければ追加、選択されていれば解除
      if (tagIds.includes(tagId)) {
        setTagIds(tagIds.filter((id) => id !== tagId));
      } else {
        setTagIds([...tagIds, tagId]);
      }
    },
    [tagIds, setTagIds]
  );

  const handleManageDialogOpen = () => {
    setIsManageDialogOpen(true);
  };

  const handleManageDialogClose = () => {
    setIsManageDialogOpen(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <S.SectionContainer data-testid="tagsSection">
        <S.HeaderWithButton>
          <S.SectionHeader>
            {t(tKeys.layouts.appSidebar.tags.title)}
          </S.SectionHeader>
          <IconButton
            size="small"
            data-testid="addTagButton"
            onClick={handleManageDialogOpen}
          >
            <SettingsIcon fontSize="small" color="action" />
          </IconButton>
        </S.HeaderWithButton>
        <List dense>
          {tags.map((tag) => {
            const isSelected = tagIds.includes(tag.id);

            return (
              <TagListItem
                key={tag.id}
                name={tag.name}
                color={tag.color}
                selected={isSelected}
                onClick={() => handleTagClick(tag.id)}
              />
            );
          })}
        </List>
      </S.SectionContainer>
      <TagManagementDialog
        open={isManageDialogOpen}
        onClose={handleManageDialogClose}
      />
    </>
  );
};
