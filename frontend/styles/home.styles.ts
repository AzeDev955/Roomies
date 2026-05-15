import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.base,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  button: {
    backgroundColor: theme.colors.textSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.input,
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: theme.colors.success,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    minWidth: 160,
    alignItems: 'center',
  },
});

export const styles = createStyles();
