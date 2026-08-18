import Box, { type BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography, { type TypographyProps } from '@mui/material/Typography';

export const SectionContainer: React.FC<BoxProps> = styled(Box)(() => ({}));

export const SectionHeader: React.FC<TypographyProps> = styled(Typography)(
  ({ theme }) => ({
    ...theme.typography.caption,
  })
);
