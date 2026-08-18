import Box, { type BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const StorageSectionContainer: React.FC<BoxProps> = styled(Box)(() => ({
  marginTop: 'auto',
}));

export const StorageCard: React.FC<BoxProps> = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  boxShadow: theme.shadows[1],
}));

export const StorageHeader: React.FC<BoxProps> = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));
