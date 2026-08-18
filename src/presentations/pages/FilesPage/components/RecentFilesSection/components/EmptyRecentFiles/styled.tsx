import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(5),
  textAlign: 'center',
}));

export const EmptyIcon = styled(InsertDriveFileOutlinedIcon)(({ theme }) => ({
  fontSize: 48,
  color: theme.palette.text.disabled,
}));

export const EmptyStateTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.palette.text.secondary,
}));

export const EmptyStateDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
}));
