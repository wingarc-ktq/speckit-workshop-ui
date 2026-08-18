import Box, { type BoxProps } from '@mui/material/Box';
import Drawer, { type DrawerProps } from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';

export const SidebarDrawer: React.FC<DrawerProps> = styled(Drawer)(() => ({
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    border: 'none',
    position: 'relative',
    height: '100vh',
  },
  ['@media (min-width: 900px)']: {
    flexShrink: 0,
  },
}));

export const SidebarContent: React.FC<BoxProps> = styled(Box)(({ theme }) => ({
  overflow: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  height: '100%',
}));
