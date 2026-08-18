import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { styled } from '@mui/material/styles';

export const StyledListItem = styled(ListItem)(() => ({
  padding: 0,
  '&:hover': {
    backgroundColor: 'transparent',
  },
}));

export const TagButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  minHeight: 36,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));
