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
  labelSeccion: {
    fontSize: Theme.typography.caption,
    fontWeight: '600',
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xs,
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
  buscadorBoton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
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
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  resultadoItem: {
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  resultadoTexto: {
    fontSize: 14,
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
    paddingHorizontal: 14,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.surface2,
  },
  tipoPillActivo: {
    backgroundColor: Theme.colors.primary,
  },
  tipoPillTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textMedium,
  },
  tipoPillTextoActivo: {
    color: Theme.colors.surface,
  },

  // — Switch habitable —
  switchFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.md,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  switchLabel: {
    fontSize: 14,
    color: Theme.colors.textMedium,
    flex: 1,
    marginRight: Theme.spacing.md,
  },

  // — Botón añadir habitación —
  botonAnadirHabitacion: {
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
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
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    backgroundColor: Theme.colors.danger,
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.md,
  },
  habitacionItemEliminarTexto: {
    color: Theme.colors.surface,
    fontWeight: '700',
  },

  // — Botón guardar —
  boton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.base,
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
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
