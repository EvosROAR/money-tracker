import { ColorScheme, darkColors, lightColors } from './colors';
import { borderRadius, spacing } from './spacing';
import { shadows } from './shadows';
import { typography } from './typography';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: ColorScheme;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  shadows: typeof shadows;
}

export const createTheme = (mode: ThemeMode): Theme => ({
  mode,
  colors: mode === 'dark' ? darkColors : lightColors,
  spacing,
  borderRadius,
  typography,
  shadows,
});

export { lightColors, darkColors, spacing, borderRadius, typography, shadows };
