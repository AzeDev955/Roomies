import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  titulo: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitulo: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  labelDoc: {
    fontSize: theme.typography.label,
    fontWeight: '600',
    color: theme.colors.textMedium,
    marginBottom: theme.spacing.sm,
  },
  docFila: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.base,
  },
  docChip: {
    flex: 1,
    borderRadius: theme.radius.full,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: 44,
    justifyContent: 'center',
  },
  docChipActivo: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  docChipTexto: {
    fontSize: theme.typography.label,
    fontWeight: '600',
    color: theme.colors.textMedium,
  },
  docChipTextoActivo: {
    color: theme.colors.background,
  },
  errorTexto: {
    fontSize: theme.typography.caption,
    color: theme.colors.danger,
    fontWeight: '500',
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  labelRol: {
    fontSize: theme.typography.label,
    fontWeight: '600',
    color: theme.colors.textMedium,
    marginBottom: theme.spacing.sm,
  },
  rolFila: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  rolPill: {
    flex: 1,
    borderRadius: theme.radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: 52,
    justifyContent: 'center',
  },
  rolPillActivo: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rolPillTexto: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },
  rolPillTextoActivo: {
    color: theme.colors.background,
  },
  enlaceLogin: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  enlaceLoginTexto: {
    fontSize: theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  separadorLinea: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  separadorTexto: {
    fontSize: theme.typography.label,
    color: theme.colors.textTertiary,
  },
  botonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    gap: 10,
    marginTop: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    minHeight: 52,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.18 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  botonGoogleTexto: {
    fontSize: theme.typography.input,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});

export const styles = createStyles();
