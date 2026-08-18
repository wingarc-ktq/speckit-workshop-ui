import ListItem, { type ListItemProps } from '@mui/material/ListItem';
import ListItemButton, {
  type ListItemButtonProps,
} from '@mui/material/ListItemButton';
import { styled } from '@mui/material/styles';
import { NavLink, type NavLinkProps } from 'react-router-dom';

export const StyledListItem: React.FC<ListItemProps> = styled(ListItem)(() => ({
  paddingLeft: 0,
  paddingRight: 0,
}));

export const NavigationLink: React.FC<NavLinkProps> = styled(NavLink)(() => ({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  width: '100%',
}));

export const NavigationButton: React.FC<ListItemButtonProps> = styled(
  ListItemButton
)(({ theme }) => ({ borderRadius: theme.shape.borderRadius }));
