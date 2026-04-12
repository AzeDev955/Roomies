import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

// Soft tint system para prioridad (coherente con módulo de incidencias #171)
export const PRIORIDAD_BG: Record<string, string> = {
  VERDE:    Theme.colors.successLight,
  AMARILLO: Theme.colors.warningLight,
  ROJO:     Theme.colors.dangerLight,
};
export const PRIORIDAD_TEXT: Record<string, string> = {
  VERDE:    Theme.colors.successText,
  AMARILLO: Theme.colors.warningText,
  ROJO:     Theme.colors.dangerText,
};
export const PRIORIDAD_BORDER: Record<string, string> = {
  VERDE:    Theme.colors.successText,
  AMARILLO: Theme.colors.warningText,
  ROJO:     Theme.colors.dangerText,
};
export const ETIQUETAS_PRIORIDAD: Record<string, string> = {
  VERDE:    'Sugerencia',
  AMARILLO: 'Aviso',
  ROJO:     'Urgente',
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.base, paddingBottom: 96 },

  titulo: {
    fontSize: Theme.typography.heading,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  contextoAviso: {
    backgroundColor: Theme.colors.warningLight,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.warning + '30',
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.xs,
  },
  contextoAvisoTitulo: {
    fontSize: Theme.typography.body,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  contextoAvisoTexto: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },

  // — Campos —
  label: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.base,
  },
  inputTexto: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    minHeight: 52,
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  inputFocused: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },
  inputDescripcion: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  // — Selector de ubicación —
  habitacionFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.base,
  },
  habitacionPill: {
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: 'transparent',
  },
  habitacionPillActivo: {
    backgroundColor: Theme.colors.primary + '18',
    borderColor: Theme.colors.primary,
  },
  habitacionPillTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  habitacionPillTextoActivo: {
    color: Theme.colors.primary,
  },

  // — Selector de prioridad —
  selectorFila: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  selectorBtn: {
    flex: 1,
    borderRadius: Theme.radius.full,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  selectorBtnTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '700',
  },

  // — Botón enviar —
  botonEnviar: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    paddingVertical: Theme.spacing.base,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonEnviarTexto: {
    color: Theme.colors.surface,
    fontSize: 17,
    fontWeight: '700',
  },
  botonEnviarDisabled: {
    backgroundColor: Theme.colors.primaryDisabled,
  },
});
