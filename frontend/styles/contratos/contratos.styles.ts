import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const getContratoStatusColors = (theme: AppTheme = DefaultAppTheme) => ({
  BORRADOR: { bg: theme.colors.surface2, text: theme.colors.textSecondary, border: theme.colors.border },
  PENDIENTE_FIRMA: { bg: theme.colors.warningLight, text: theme.colors.warningText, border: `${theme.colors.warning}34` },
  FIRMADO: { bg: theme.colors.successLight, text: theme.colors.successText, border: `${theme.colors.success}30` },
  RECHAZADO: { bg: theme.colors.dangerLight, text: theme.colors.dangerText, border: `${theme.colors.danger}28` },
  ANULADO: { bg: theme.colors.surface2, text: theme.colors.textTertiary, border: theme.colors.border },
});

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    fontSize: theme.typography.caption,
    fontWeight: '800',
    color: theme.colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: theme.typography.hero,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  selectorContent: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.typography.label,
    fontWeight: '800',
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    gap: theme.spacing.base,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.base,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    color: theme.colors.text,
  },
  meta: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  badgeText: {
    fontSize: theme.typography.caption,
    fontWeight: '800',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.warningLight,
    borderColor: `${theme.colors.warning}34`,
  },
  warningText: {
    flex: 1,
    fontSize: theme.typography.label,
    color: theme.colors.warningText,
    lineHeight: 20,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  smallButton: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  smallButtonText: {
    fontSize: theme.typography.caption,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    color: theme.colors.text,
  },
  field: {
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.caption,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.base,
    fontSize: theme.typography.input,
    color: theme.colors.text,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
