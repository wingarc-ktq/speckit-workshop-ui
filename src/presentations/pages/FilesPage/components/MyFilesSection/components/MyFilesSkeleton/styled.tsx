import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

/** セクション本体（MyFilesSection）の Container / Header / Title と同じレイアウト */
export const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

export const Title = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
}));

/** DataGrid のデフォルト寸法に合わせる */
const COLUMN_HEADER_HEIGHT = 56;
const ROW_HEIGHT = 52;
const FOOTER_HEIGHT = 52;
const CHECKBOX_COLUMN_WIDTH = 50;

/** DataGrid ルートを模した枠 */
export const Root = styled(Box)(({ theme }) => ({
  width: '100%',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

export const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: COLUMN_HEADER_HEIGHT,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: ROW_HEIGHT,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const Cell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexGrow: 1,
  flexBasis: 0,
  minWidth: 0,
  padding: '0 10px',
});

export const CheckboxCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 'none',
  width: CHECKBOX_COLUMN_WIDTH,
});

export const Footer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  height: FOOTER_HEIGHT,
  padding: theme.spacing(0, 2),
}));
