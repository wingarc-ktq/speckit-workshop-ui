import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const FilesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  overflowX: 'hidden',
  '& > *': {
    flexShrink: 0,
  },
}));

export const Card = styled(Box)(({ theme }) => ({
  width: 250,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
}));
