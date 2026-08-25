import { createContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

/**
 * ThemeProviderの外で使われた場合でも壊れないよう、
 * デフォルト値（ダークモード・no-opトグル）を持たせている
 */
export const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'dark',
  toggleMode: () => {},
});
