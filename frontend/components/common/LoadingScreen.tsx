import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

export function LoadingScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
