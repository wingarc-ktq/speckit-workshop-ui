import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const StyledCard = styled(Box)(({ theme }) => ({
  width: 250,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
}));

export const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(1.5),
}));

export const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

export const IconContainer = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.info.light, 0.1),
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const FileIcon = styled(DescriptionIcon)(({ theme }) => ({
  fontSize: 42,
  color: theme.palette.info.main,
}));

export const TagChipsContainer = styled(Box)({
  minHeight: 24, // small Chipの高さと同じ領域を確保
  display: 'flex',
  alignItems: 'center',
});

export const FileName = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
}));

export const DateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

export const DateIcon = styled(CalendarTodayOutlinedIcon)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
}));

export const DateText = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
}));

export const StyledCardActions = styled(CardActions)(({ theme }) => ({
  padding: theme.spacing(1.5),
  paddingTop: 0,
}));

export const ViewButton = styled(Button)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'light'
      ? theme.palette.common.black
      : theme.palette.common.white,
  color:
    theme.palette.mode === 'light'
      ? theme.palette.common.white
      : theme.palette.common.black,
  borderRadius: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.text.primary,
    opacity: 0.9,
  },
}));
