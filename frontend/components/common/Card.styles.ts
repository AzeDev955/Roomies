import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.2 : 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
});

export const styles = createStyles();
