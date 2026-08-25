import { useContext } from 'react';

import { ThemeModeContext } from '../context';

import type { ThemeModeContextValue } from '../context';

/**
 * 現在のテーマモードと切替関数を取得するフック
 */
export const useThemeMode = (): ThemeModeContextValue =>
  useContext(ThemeModeContext);
