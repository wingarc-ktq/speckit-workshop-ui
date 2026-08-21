import Box from '@mui/material/Box';

import { getAllTags } from '@/domain/constants/tags';

interface TagSelectorProps {
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onToggleTag }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {getAllTags().map((tag) => {
        const isSelected = selectedTags.includes(tag.id);

        return (
          <Box
            key={tag.id}
            component="button"
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggleTag(tag.id)}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              border: `0.667px solid ${tag.backgroundColor}`,
              backgroundColor: isSelected ? tag.backgroundColor : '#fff',
              color: isSelected ? tag.color : tag.backgroundColor,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'Arimo', 'Noto Sans JP', sans-serif",
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: tag.backgroundColor, color: tag.color },
            }}
          >
            {tag.name}
          </Box>
        );
      })}
    </Box>
  );
};