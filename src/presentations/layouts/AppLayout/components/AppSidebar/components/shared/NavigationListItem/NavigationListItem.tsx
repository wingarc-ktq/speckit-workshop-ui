import React from 'react';

import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import * as S from './styled';

interface NavigationListItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  selected?: boolean;
  onClick?: () => void;
}

export const NavigationListItem: React.FC<NavigationListItemProps> = ({
  icon,
  label,
  to,
  selected = false,
  onClick,
}) => {
  return (
    <S.StyledListItem>
      {to ? (
        <S.NavigationLink to={to}>
          {({ isActive }: { isActive: boolean }) => (
            <S.NavigationButton selected={isActive}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </S.NavigationButton>
          )}
        </S.NavigationLink>
      ) : (
        <S.NavigationButton selected={selected} onClick={onClick}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={label} />
        </S.NavigationButton>
      )}
    </S.StyledListItem>
  );
};
