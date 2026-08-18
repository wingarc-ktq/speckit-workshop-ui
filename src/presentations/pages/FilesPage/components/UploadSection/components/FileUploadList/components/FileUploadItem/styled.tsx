import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const FileItemPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

export const StatusIconBox = styled(Box)({
  flexShrink: 0,
});

export const ProgressContainer = styled(Box)({
  width: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const ProgressText = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.palette.text.secondary,
}));

export const FileInfoContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

export const FileNameRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const FileName = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const FileSizeChip = styled(Chip)({
  height: 20,
  fontSize: 11,
});

export const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 4,
  borderRadius: theme.shape.borderRadius,
}));

export const SuccessIcon = styled(CheckCircleIcon)(({ theme }) => ({
  color: theme.palette.success.main,
  fontSize: 24,
}));

export const StyledErrorIcon = styled(ErrorIcon)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: 24,
}));

export const ErrorMessage = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.palette.error.main,
}));

export const SuccessMessage = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.palette.success.main,
}));

export const RemoveButton = styled(IconButton)({
  flexShrink: 0,
});
