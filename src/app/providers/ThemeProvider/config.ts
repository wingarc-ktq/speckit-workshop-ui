import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  colorSchemes: {
    dark: true,
  },
  components: {
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
  },
});
