import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const Title = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
}));

export const FilesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  overflowX: 'scroll',
  '& > *': {
    flexShrink: 0,
  },
}));
