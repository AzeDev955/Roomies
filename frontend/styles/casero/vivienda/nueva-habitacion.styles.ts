import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { padding: Theme.spacing.base, paddingBottom: 40 },
  label: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: Theme.spacing.base,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipoFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  tipoPill: {
    borderRadius: Theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
  },
  tipoPillActivo: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  tipoPillTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  tipoPillTextoActivo: {
    color: Theme.colors.surface,
  },
  switchFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  switchLabel: {
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
  },
  boton: {
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.base,
    alignItems: 'center',
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
