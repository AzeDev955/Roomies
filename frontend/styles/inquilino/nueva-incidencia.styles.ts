import { StyleSheet } from 'react-native';
import { DefaultAppTheme, type AppTheme } from '@/constants/theme';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';

export const getPrioridadBg = (theme: AppTheme, prioridad: Prioridad) => ({
  VERDE: theme.colors.successLight,
  AMARILLO: theme.colors.warningLight,
  ROJO: theme.colors.dangerLight,
})[prioridad];

export const getPrioridadText = (theme: AppTheme, prioridad: Prioridad) => ({
  VERDE: theme.colors.successText,
  AMARILLO: theme.colors.warningText,
  ROJO: theme.colors.dangerText,
})[prioridad];

export const getPrioridadBorder = (theme: AppTheme, prioridad: Prioridad) => ({
  VERDE: theme.colors.successText,
  AMARILLO: theme.colors.warningText,
  ROJO: theme.colors.dangerText,
})[prioridad];

export const ETIQUETAS_PRIORIDAD: Record<Prioridad, string> = {
  VERDE: 'Sugerencia',
  AMARILLO: 'Aviso',
  ROJO: 'Urgente',
};

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.base, paddingBottom: 96 },

  titulo: {
    fontSize: theme.typography.heading,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  contextoAviso: {
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.warningText,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  contextoAvisoTitulo: {
    fontSize: theme.typography.body,
    fontWeight: '800',
    color: theme.colors.text,
  },
  contextoAvisoTexto: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  label: {
    fontSize: theme.typography.label,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.base,
  },
  inputTexto: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    minHeight: 52,
    fontSize: theme.typography.input,
    color: theme.colors.text,
    marginBottom: 4,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  inputDescripcion: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  habitacionFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.base,
  },
  habitacionPill: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  habitacionPillActivo: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  habitacionPillTexto: {
    fontSize: theme.typography.label,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  habitacionPillTextoActivo: {
    color: theme.colors.primary,
  },

  selectorFila: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  selectorBtn: {
    flex: 1,
    borderRadius: theme.radius.full,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  selectorBtnTexto: {
    fontSize: theme.typography.label,
    fontWeight: '700',
  },

  botonEnviar: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.base,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonEnviarTexto: {
    color: theme.colors.surface,
    fontSize: theme.typography.input,
    fontWeight: '700',
  },
  botonEnviarDisabled: {
    backgroundColor: theme.colors.primaryDisabled,
  },
});

export const styles = createStyles();
