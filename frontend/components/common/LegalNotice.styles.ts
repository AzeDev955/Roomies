import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.18 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inline: {
    width: '100%',
    marginTop: theme.spacing.base,
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.label,
    lineHeight: 20,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: theme.typography.label,
    fontWeight: '700',
  },
  meta: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkboxCopy: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.label,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.75,
  },
});

export const styles = createStyles();
