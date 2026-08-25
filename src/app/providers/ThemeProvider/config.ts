import { createTheme } from '@mui/material/styles';

import type { Components, Theme } from '@mui/material/styles';

/** Raycast風のダークテーマ配色 */
const darkColors = {
  background: '#1C1C1A',
  backgroundPaper: '#2C2C2A',
  backgroundHover: '#444441',
  divider: '#5F5E5A',
  textPrimary: '#F1EFE8',
  textSecondary: '#B4B2A9',
  accent: '#D85A30',
  accentLight: '#F0997B',
} as const;

/** ライト・ダーク共通のコンポーネント上書き設定 */
const sharedComponents: Components<Omit<Theme, 'components'>> = {
  MuiButton: {
    defaultProps: {
      color: 'inherit',
      variant: 'outlined',
    },
    styleOverrides: {
      root: {
        textTransform: 'none',
        variants: [
          {
            props: { variant: 'outlined', color: 'inherit' },
            style: ({ theme }) => ({
              borderColor: theme.palette.divider,
            }),
          },
        ],
      },
    },
  },
};

export const lightTheme = createTheme({
  components: sharedComponents,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: darkColors.background,
      paper: darkColors.backgroundPaper,
    },
    text: {
      primary: darkColors.textPrimary,
      secondary: darkColors.textSecondary,
    },
    divider: darkColors.divider,
    primary: {
      main: darkColors.accent,
      light: darkColors.accentLight,
    },
    action: {
      hover: darkColors.backgroundHover,
      selected: darkColors.backgroundHover,
    },
  },
  components: {
    ...sharedComponents,
    // MUI既定の配色だと、Paper/AppBarの背景がpalette.background.paperから
    // 微妙にずれる（elevation計算等）ため、明示的に上書きして浮きを防ぐ
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.backgroundPaper,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: darkColors.backgroundPaper,
        },
      },
    },
  },
});
