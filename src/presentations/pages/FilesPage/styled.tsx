import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const Page = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));
