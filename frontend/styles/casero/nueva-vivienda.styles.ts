import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.base,
    paddingBottom: Theme.spacing.xxl,
  },

  label: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textMedium,
    marginBottom: 6,
    marginTop: Theme.spacing.base,
  },
  labelSeccion: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
    minHeight: 52,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },

  // — Buscador Mapbox —
  buscadorFila: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    alignItems: 'center',
  },
  buscadorInput: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
    minHeight: 52,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  buscadorBoton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    minHeight: 52,
  },
  buscadorBotonDisabled: {
    backgroundColor: Theme.colors.primaryDisabled,
  },
  buscadorBotonTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },

  // — Lista de resultados —
  resultadosContainer: {
    marginTop: 6,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  resultadoItem: {
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.border,
  },
  resultadoTexto: {
    fontSize: Theme.typography.label,
    color: Theme.colors.text,
    lineHeight: 20,
  },

  // — Tipo pills —
  tipoFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  tipoPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.surface2,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 40,
    justifyContent: 'center',
  },
  tipoPillActivo: {
    backgroundColor: Theme.colors.primary + '18',
    borderColor: Theme.colors.primary,
  },
  tipoPillTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textMedium,
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
    paddingVertical: Theme.spacing.md,
  },
  switchLabel: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textMedium,
    flex: 1,
    marginRight: Theme.spacing.md,
  },

  // — Botón añadir habitación —
  botonAnadirHabitacion: {
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    minHeight: 52,
    justifyContent: 'center',
  },
  botonAnadirHabitacionTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },

  // — Lista de habitaciones añadidas —
  habitacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  habitacionItemWrapper: { flex: 1 },
  habitacionItemTexto: {
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  habitacionItemBadgeTexto: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  habitacionItemEliminar: {
    backgroundColor: Theme.colors.danger + '18',
    borderRadius: Theme.radius.full,
    borderWidth: 1.5,
    borderColor: Theme.colors.danger + '40',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.md,
  },
  habitacionItemEliminarTexto: {
    color: Theme.colors.danger,
    fontWeight: '700',
    fontSize: 16,
  },

  // — Botón guardar —
  boton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    minHeight: 52,
    justifyContent: 'center',
  },
  botonDisabled: {
    backgroundColor: Theme.colors.primaryDisabled,
  },
  botonTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.input,
    fontWeight: '700',
  },
});
