import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
  gap: theme.spacing(2),
}));

export const EmptyStateTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.h6,
  color: theme.palette.text.secondary,
}));

export const EmptyStateDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
}));
