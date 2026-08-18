import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const PreviewContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 500,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 500,
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}));

export const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
});

export const PdfEmbedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 600,
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

export const PdfEmbed = styled('iframe')({
  width: '100%',
  height: '100%',
  border: 'none',
});

export const PreviewMessageTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
}));

export const PreviewMessageDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.palette.text.secondary,
}));

export const PdfIcon = styled(PictureAsPdfIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.error.main,
}));

export const WordIcon = styled(DescriptionIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.info.main,
}));
export const ExcelIcon = styled(DescriptionIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.success.main,
}));

export const OtherFileIcon = styled(ImageIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.action.active,
}));
