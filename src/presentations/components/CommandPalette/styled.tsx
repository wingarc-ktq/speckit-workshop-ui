import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

/** Raycast風に画面上部寄せで表示するダイアログ */
export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    alignItems: 'flex-start',
  },
  '& .MuiDialog-paper': {
    marginTop: theme.spacing(12),
  },
}));

export const SearchField = styled(TextField)(({ theme }) => ({
  padding: theme.spacing(1, 1),
  '& .MuiOutlinedInput-root': {
    fontSize: theme.typography.h6.fontSize,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

export const ResultsList = styled(List)(({ theme }) => ({
  maxHeight: 400,
  overflowY: 'auto',
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: 0,
}));

export const ResultItem = styled(ListItemButton)(({ theme }) => ({
  '&.Mui-selected, &.Mui-selected:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

export const ResultItemText = styled(ListItemText)(() => ({
  '& .MuiListItemText-primary': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

export const SkeletonRow = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
}));

export const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
  gap: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const EmptyStateTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.palette.text.secondary,
}));
