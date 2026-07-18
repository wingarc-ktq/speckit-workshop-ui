import type React from 'react';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import Box, { type BoxProps } from '@mui/material/Box';
import Stack, { type StackProps } from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import Typography, { type TypographyProps } from '@mui/material/Typography';

/** 縦横中央寄せコンテナ */
export const CenterContainer: React.FC<BoxProps> = styled(Box)({
  display: 'flex',
  flex: 1,
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
});

/** アイコン・メッセージ・再読み込みボタンを縦に中央寄せで並べるコンテナ。領域幅いっぱい（上限360px）に広げて幅を安定させる */
export const Content: React.FC<StackProps> = styled(Stack)(({ theme }) => ({
  width: '100%',
  maxWidth: 360,
  alignItems: 'center',
  gap: theme.spacing(1),
}));

/** データ取得失敗を示す薄グレーの大きめアイコン */
export const ErrorIcon: React.FC<SvgIconProps> = styled(ErrorOutlineIcon)(
  ({ theme }) => ({
    fontSize: theme.typography.h3.fontSize,
    color: theme.palette.action.disabled,
  })
);

/** エラーメッセージ。サーバーメッセージ内の改行を保持して中央寄せで表示する */
export const Message: React.FC<TypographyProps> = styled(
  (props: TypographyProps) => (
    <Typography variant="body2" color="textSecondary" {...props} />
  )
)({
  textAlign: 'center',
  whiteSpace: 'pre-line',
});
