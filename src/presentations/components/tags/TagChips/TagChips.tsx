import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import type { Tag } from '@/domain/models/tag';

import { TAG_COLOR_MAP } from '../constants';

interface TagChipsProps {
  tags: Tag[];
  size?: 'small' | 'medium';
  max?: number;
  onDelete?: (tagId: string) => void;
  onClick?: (tag: Tag) => void;
  'data-testid'?: string;
}

/**
 * TagChips コンポーネント
 *
 * タグのリストをChipコンポーネントで表示する共通UIコンポーネント
 *
 * @example
 * ```tsx
 * <TagChips tags={tags} size="small" />
 * <TagChips tags={tags} onDelete={handleDelete} max={5} />
 * ```
 */
export const TagChips = ({
  tags,
  size = 'medium',
  max,
  onDelete,
  onClick,
  'data-testid': dataTestId,
}: TagChipsProps) => {
  // 最大表示数による制限
  const displayTags = max && tags.length > max ? tags.slice(0, max) : tags;
  const remainingCount = max && tags.length > max ? tags.length - max : 0;

  if (tags.length === 0) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={0.5}
      useFlexGap
      sx={{ flexWrap: 'wrap' }}
      data-testid={dataTestId}
    >
      {displayTags.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.name}
          size={size}
          variant="outlined"
          icon={<SellOutlinedIcon />}
          onDelete={onDelete ? () => onDelete(tag.id) : undefined}
          onClick={onClick ? () => onClick(tag) : undefined}
          sx={{
            borderColor: TAG_COLOR_MAP[tag.color],
            color: TAG_COLOR_MAP[tag.color],
            '& .MuiChip-icon': {
              color: TAG_COLOR_MAP[tag.color],
            },
          }}
        />
      ))}
      {remainingCount > 0 && (
        <Chip label={`+${remainingCount}`} size={size} variant="outlined" />
      )}
    </Stack>
  );
};
