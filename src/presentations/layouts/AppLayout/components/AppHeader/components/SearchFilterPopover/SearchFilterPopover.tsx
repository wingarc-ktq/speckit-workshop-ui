import React, { useCallback, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import type { Tag } from '@/domain/models/tag';
import { tKeys } from '@/i18n';
import { TagSelector } from '@/presentations/components/tags';
import { useTags } from '@/presentations/hooks/queries/tags/useTags';
import { useFilesSearchParams } from '@/presentations/pages/FilesPage/hooks/useFilesSearchParams';

interface SearchFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export const SearchFilterPopover: React.FC<SearchFilterPopoverProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { searchQuery, tagIds, setSearchQuery, setTagIds } =
    useFilesSearchParams();
  const { data: allTags } = useTags();

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localSelectedTags, setLocalSelectedTags] = useState<Tag[]>([]);

  // Popoverが開かれた時に現在の値で初期化
  const handleEntered = useCallback(() => {
    setLocalSearchQuery(searchQuery ?? '');
    // tagIdsからTagオブジェクトの配列を復元（選択順序を維持）
    const selectedTags = tagIds
      .map((id) => allTags.find((tag) => tag.id === id))
      .filter((tag): tag is Tag => tag !== undefined);
    setLocalSelectedTags(selectedTags);
  }, [searchQuery, tagIds, allTags]);

  const handleApply = useCallback(() => {
    setSearchQuery(localSearchQuery);
    setTagIds(localSelectedTags.map((tag) => tag.id));

    onClose();
  }, [localSearchQuery, localSelectedTags, setSearchQuery, setTagIds, onClose]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setTagIds([]);
    onClose();
  }, [setSearchQuery, setTagIds, onClose]);

  const handleTagChange = useCallback((tags: Tag[]) => {
    setLocalSelectedTags(tags);
  }, []);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: { width: 400, p: 2 },
        },
        transition: {
          onEntered: handleEntered,
        },
      }}
    >
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {t(tKeys.layouts.appHeader.filterPopover.title)}
        </Typography>

        <Divider />

        <TextField
          label={t(tKeys.layouts.appHeader.filterPopover.searchLabel)}
          placeholder={t(
            tKeys.layouts.appHeader.filterPopover.searchPlaceholder
          )}
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          size="small"
          fullWidth
        />
        <TagSelector
          label={t(tKeys.layouts.appHeader.filterPopover.tagsLabel)}
          placeholder={t(tKeys.layouts.appHeader.filterPopover.tagsPlaceholder)}
          options={allTags}
          value={localSelectedTags}
          onChange={handleTagChange}
          size="small"
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Button onClick={handleClear} variant="outlined" size="small">
            {t(tKeys.layouts.appHeader.filterPopover.clear)}
          </Button>
          <Button onClick={handleApply} variant="contained" size="small">
            {t(tKeys.layouts.appHeader.filterPopover.apply)}
          </Button>
        </Box>
      </Stack>
    </Popover>
  );
};
