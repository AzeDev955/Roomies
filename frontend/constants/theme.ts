const lightColors = {
  // Primarios
  primary: '#FF6B6B',
  primaryLight: '#FFF0F0',
  primaryDisabled: '#FFBCBC',
  // Semanticos
  success: '#06D6A0',
  successLight: '#E8FBF5',
  successText: '#0D7A5E',
  successDisabled: '#A3E8DA',
  info: '#4F8CFF',
  infoLight: '#EDF4FF',
  danger: '#FF4757',
  dangerLight: '#FFF0F2',
  dangerText: '#C0392B',
  warning: '#FFA726',
  warningLight: '#FFF7E8',
  warningText: '#A05C00',
  // Fondos
  background: '#F8F7F4',
  backgroundDark: '#151718',
  surface: '#FFFFFF',
  surface2: '#F2F0EB',
  // Texto
  text: '#1A1A2E',
  textSecondary: '#6B6B80',
  textTertiary: '#9E9EAF',
  textMuted: '#C4C4D0',
  textMedium: '#3D3D56',
  // UI
  border: '#E8E6E0',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.4)',
  google: '#DB4437',
};

const darkColors: typeof lightColors = {
  primary: '#FF8F8F',
  primaryLight: '#3A2328',
  primaryDisabled: '#8F5358',
  success: '#4DE0B5',
  successLight: '#163A32',
  successText: '#8AF0D2',
  successDisabled: '#2E7668',
  info: '#8EB2FF',
  infoLight: '#172A4D',
  danger: '#FF6F7C',
  dangerLight: '#3D1F28',
  dangerText: '#FFB3BA',
  warning: '#FFC46B',
  warningLight: '#3D2F16',
  warningText: '#FFD99A',
  background: '#151718',
  backgroundDark: '#151718',
  surface: '#202326',
  surface2: '#2B2E31',
  text: '#F5F1EA',
  textSecondary: '#C9C2B8',
  textTertiary: '#9F988F',
  textMuted: '#7D766E',
  textMedium: '#E4DED5',
  border: '#3A3D40',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.64)',
  google: '#F28B82',
} as const;

export const Theme = {
  colors: lightColors,
  palettes: {
    light: lightColors,
    dark: darkColors,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 100,
  },
  typography: {
    caption: 12,
    label: 14,
    body: 15,
    input: 16,
    subtitle: 18,
    title: 20,
    heading: 24,
    hero: 32,
  },
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  },
} as const;

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedThemeMode = 'light' | 'dark';
export type ThemeColors = typeof lightColors;
export type AppTheme = Omit<typeof Theme, 'colors' | 'palettes'> & {
  colors: ThemeColors;
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  isDark: boolean;
};

export function buildAppTheme(mode: ThemeMode, systemMode: ResolvedThemeMode): AppTheme {
  const resolvedMode = mode === 'system' ? systemMode : mode;

  return {
    spacing: Theme.spacing,
    radius: Theme.radius,
    typography: Theme.typography,
    shadows: Theme.shadows,
    colors: Theme.palettes[resolvedMode],
    mode,
    resolvedMode,
    isDark: resolvedMode === 'dark',
  };
}

export const DefaultAppTheme = buildAppTheme('light', 'light');

// Expo template compatibility, used by unused boilerplate components.
export const Colors = {
  light: { icon: lightColors.textSecondary, text: lightColors.text, background: lightColors.background },
  dark: { icon: darkColors.textTertiary, text: darkColors.text, background: darkColors.background },
} as const;
