import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const COLORES_PRIORIDAD: Record<string, string> = {
  VERDE:    Theme.colors.success,
  AMARILLO: Theme.colors.warning,
  ROJO:     Theme.colors.danger,
};

export const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE:  'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTA:   'Resuelta',
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.base, paddingBottom: Theme.spacing.xl },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: Theme.colors.textTertiary, fontSize: 14, marginTop: 40 },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  indicador: {
    width: Theme.spacing.md,
    height: Theme.spacing.md,
    borderRadius: 6,
    marginTop: Theme.spacing.xs,
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTitulo: { fontSize: Theme.typography.body, fontWeight: '600', color: Theme.colors.text, marginBottom: Theme.spacing.xs },
  cardDescripcion: { fontSize: Theme.typography.label, color: Theme.colors.textSecondary, lineHeight: 18, marginBottom: Theme.spacing.sm },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm, marginBottom: Theme.spacing.sm, alignItems: 'center' },
  cardCreador: { fontSize: Theme.typography.caption, color: Theme.colors.textMedium, fontWeight: '500' },
  cardSeparador: { fontSize: Theme.typography.caption, color: Theme.colors.border },
  cardHabitacion: { fontSize: Theme.typography.caption, color: Theme.colors.primary },
  cardFecha: { fontSize: Theme.typography.caption, color: Theme.colors.textMuted },
  estadoSelector: { flexDirection: 'row', gap: 6, marginTop: Theme.spacing.xs },
  estadoPill: {
    flex: 1,
    borderRadius: Theme.radius.sm,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: Theme.colors.surface2,
  },
  estadoPillActivo: { backgroundColor: Theme.colors.primary },
  estadoPillTexto: { fontSize: 11, fontWeight: '600', color: Theme.colors.textMedium },
  estadoPillTextoActivo: { color: Theme.colors.surface },

  // — Historial —
  historialToggle: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.sm,
  },
  historialToggleTexto: {
    fontSize: Theme.typography.label,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  historialSeparador: {
    height: 1,
    backgroundColor: Theme.colors.surface2,
    marginBottom: Theme.spacing.md,
  },

});
