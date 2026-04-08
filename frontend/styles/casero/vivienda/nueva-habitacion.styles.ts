import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { padding: Theme.spacing.base, paddingBottom: Theme.spacing.xxl + 20 },

  label: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: Theme.spacing.base,
  },

  // — Inputs —
  input: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    minHeight: 52,
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
  },
  inputFocused: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },

  // — Pills de tipo —
  tipoFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  tipoPill: {
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: 'transparent',
  },
  tipoPillActivo: {
    backgroundColor: Theme.colors.primary + '18',
    borderColor: Theme.colors.primary,
  },
  tipoPillTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  tipoPillTextoActivo: {
    color: Theme.colors.primary,
  },

  // — Switch habitable —
  switchFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.base,
    minHeight: 64,
  },
  switchLabel: {
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
    flex: 1,
    marginRight: Theme.spacing.base,
  },

  // — Botón guardar —
  boton: {
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.lg,
    paddingVertical: Theme.spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: Theme.spacing.xl,
  },
  botonDisabled: {
    backgroundColor: Theme.colors.successDisabled,
  },
  botonTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.input,
    fontWeight: '700',
  },
});
