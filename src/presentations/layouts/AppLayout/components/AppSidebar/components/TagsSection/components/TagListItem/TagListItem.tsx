import React from 'react';

import SellIcon from '@mui/icons-material/Sell';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import * as S from './styled';

interface TagListItemProps {
  name: string;
  color: string;
  selected?: boolean;
  onClick?: () => void;
}

export const TagListItem: React.FC<TagListItemProps> = ({
  name,
  color,
  selected = false,
  onClick,
}) => {
  const TagIcon = selected ? SellIcon : SellOutlinedIcon;

  return (
    <S.StyledListItem>
      <S.TagButton onClick={onClick}>
        <ListItemIcon>
          <TagIcon sx={{ color }} />
        </ListItemIcon>
        <ListItemText
          primary={name}
          slotProps={{
            primary: {
              sx: { fontWeight: selected ? 'bold' : 'normal' },
            },
          }}
        />
      </S.TagButton>
    </S.StyledListItem>
  );
};
