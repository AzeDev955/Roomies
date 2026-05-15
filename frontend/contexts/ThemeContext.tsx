import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as SystemUI from 'expo-system-ui';
import { buildAppTheme, AppTheme, DefaultAppTheme, ResolvedThemeMode, ThemeMode } from '@/constants/theme';

const THEME_MODE_KEY = 'roomies.themeMode';

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function normalizeSystemMode(colorScheme: ColorSchemeName): ResolvedThemeMode {
  return colorScheme === 'dark' ? 'dark' : 'light';
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let mounted = true;

    const loadMode = async () => {
      const storedMode = await SecureStore.getItemAsync(THEME_MODE_KEY);
      if (mounted && isThemeMode(storedMode)) {
        setModeState(storedMode);
      }
    };

    void loadMode();
    return () => {
      mounted = false;
    };
  }, []);

  const theme = useMemo(
    () => buildAppTheme(mode, normalizeSystemMode(colorScheme)),
    [colorScheme, mode],
  );

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);

  const setMode = async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await SecureStore.setItemAsync(THEME_MODE_KEY, nextMode);
  };

  const value = useMemo(
    () => ({ theme, mode, resolvedMode: theme.resolvedMode, setMode }),
    [mode, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    return {
      theme: DefaultAppTheme,
      mode: 'light' as ThemeMode,
      resolvedMode: 'light' as ResolvedThemeMode,
      setMode: async () => undefined,
    };
  }

  return value;
}
