import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  disabled: { opacity: 0.45 },

  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.surface2 },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  danger: { backgroundColor: theme.colors.danger },
  success: { backgroundColor: theme.colors.success },

  textLight: {
    color: theme.colors.background,
    fontSize: theme.typography.body,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textDark: {
    color: theme.colors.textMedium,
    fontSize: theme.typography.body,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export const styles = createStyles();
