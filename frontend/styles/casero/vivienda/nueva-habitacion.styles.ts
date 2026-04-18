import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: theme.spacing.base, paddingBottom: theme.spacing.xxl + 20 },

  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.base,
  },
  errorTitle: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  secondaryButton: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.primaryLight,
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: '800',
  },

  label: {
    fontSize: theme.typography.label,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: theme.spacing.base,
  },

  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    minHeight: 52,
    fontSize: theme.typography.input,
    color: theme.colors.text,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },

  tipoFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tipoPill: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  tipoPillActivo: {
    backgroundColor: theme.colors.primary + '18',
    borderColor: theme.colors.primary,
  },
  tipoPillTexto: {
    fontSize: theme.typography.label,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tipoPillTextoActivo: {
    color: theme.colors.primary,
  },

  switchFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
    minHeight: 64,
  },
  switchLabel: {
    fontSize: theme.typography.input,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.base,
  },

  boton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: theme.spacing.xl,
  },
  botonDisabled: {
    backgroundColor: theme.colors.successDisabled,
  },
  botonTexto: {
    color: theme.colors.surface,
    fontSize: theme.typography.input,
    fontWeight: '700',
  },

  acordeonCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  zonaPeligroSeparador: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  zonaPeligroTitulo: {
    fontSize: theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.danger,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  botonDestructivoSoft: {
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1.5,
    borderColor: theme.colors.danger + '40',
    marginTop: theme.spacing.sm,
  },
  botonDestructivoSoftDisabled: {
    opacity: 0.5,
  },
  botonDestructivoSoftTexto: {
    fontSize: theme.typography.input,
    fontWeight: '600',
    color: theme.colors.danger,
  },
});
