import type React from 'react';

import Box, { type BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';

/**
 * DataGridのrenderCellで使用する中央配置コンテナ
 * テキスト以外のJSX要素を縦方向中央に配置します
 */
export const DataGridCellContent: React.FC<BoxProps> = styled(Box)(
  ({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    gap: theme.spacing(1),
  })
);
