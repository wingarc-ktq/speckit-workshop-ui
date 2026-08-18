import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const DropZoneContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'disabled',
})<{ isDragActive?: boolean; disabled?: boolean }>(
  ({ theme, isDragActive, disabled }) => ({
    width: '100%',
    height: 228,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px dashed ${
      isDragActive ? theme.palette.primary.main : theme.palette.divider
    }`,
    borderRadius: theme.spacing(2),
    backgroundColor: isDragActive
      ? theme.palette.action.hover
      : theme.palette.background.paper,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',

    '&:hover': {
      borderColor: disabled
        ? theme.palette.divider
        : theme.palette.primary.main,
      backgroundColor: disabled
        ? theme.palette.background.paper
        : theme.palette.action.hover,
    },
  })
);

export const UploadIcon = styled(CloudUploadOutlinedIcon, {
  shouldForwardProp: (prop) => prop !== 'isDragActive',
})<{ isDragActive?: boolean }>(({ theme, isDragActive }) => ({
  fontSize: 64,
  color: isDragActive
    ? theme.palette.primary.main
    : theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
}));

export const MainText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isDragActive',
})<{ isDragActive?: boolean }>(({ theme, isDragActive }) => ({
  ...theme.typography.body1,
  color: isDragActive ? theme.palette.primary.main : theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

export const SubText = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.palette.text.secondary,
}));
