import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

import { getTagInfo } from '@/domain/constants/tags';

interface FileTagsProps {
  tagIds?: string[];
}

export const FileTags: React.FC<FileTagsProps> = ({ tagIds = [] }) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {tagIds.map((tagId) => {
        const tag = getTagInfo(tagId);

        return (
          <Chip
            key={tag.id}
            label={tag.name}
            size="small"
            sx={{
              backgroundColor: tag.backgroundColor,
              color: tag.color,
              fontWeight: 500,
              fontSize: '12px',
              height: '24px',
              borderRadius: '6px',
              padding: '2px 8px',
              '& .MuiChip-label': {
                padding: '0',
              },
            }}
          />
        );
      })}
    </Box>
  );
};