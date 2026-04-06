import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const COLORES_PRIORIDAD: Record<string, string> = {
  VERDE:    Theme.colors.success,
  AMARILLO: Theme.colors.warning,
  ROJO:     Theme.colors.danger,
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

  label: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.sm,
  },
  inputTexto: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
    marginBottom: 20,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  inputDescripcion: {
    height: 120,
    textAlignVertical: 'top',
  },

  habitacionFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: 20,
  },
  habitacionPill: {
    backgroundColor: Theme.colors.surface2,
    borderRadius: Theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: Theme.spacing.sm,
  },
  habitacionPillActivo: {
    backgroundColor: Theme.colors.primary,
  },
  habitacionPillTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.textMedium,
  },
  habitacionPillTextoActivo: {
    color: Theme.colors.surface,
  },

  selectorFila: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Theme.spacing.xl,
  },
  selectorBtn: {
    flex: 1,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorBtnTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.label,
    fontWeight: '700',
  },

  botonEnviar: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.base,
    alignItems: 'center',
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
