import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.base,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: theme.isDark ? 0.2 : 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: theme.typography.label,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: '800',
  },
  summary: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metaPill: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
  },
  metaPillText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    gap: theme.spacing.xs,
  },
  noteTitle: {
    color: theme.colors.warningText,
    fontSize: theme.typography.label,
    fontWeight: '700',
  },
  noteText: {
    color: theme.colors.warningText,
    fontSize: theme.typography.label,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    gap: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: theme.isDark ? 0.18 : 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
  paragraph: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.label,
    lineHeight: 22,
  },
});

export const styles = createStyles();
