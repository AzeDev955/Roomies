import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

// — Indicador de prioridad (soft tints) —
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

export const COLORES_PRIORIDAD: Record<string, string> = {
  VERDE:    Theme.colors.success,
  AMARILLO: Theme.colors.warning,
  ROJO:     Theme.colors.danger,
};

export const ETIQUETAS_PRIORIDAD: Record<string, string> = {
  VERDE:    'Baja',
  AMARILLO: 'Media',
  ROJO:     'Alta',
};

export const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE:  'Pendiente',
  EN_PROCESO: 'En curso',
  RESUELTA:   'Resuelta',
};

// — Colores activos por estado (pills) —
export const ESTADO_PILL_BG: Record<string, string> = {
  PENDIENTE:  Theme.colors.warningLight,
  EN_PROCESO: Theme.colors.primary + '20',
  RESUELTA:   Theme.colors.successLight,
};

export const ESTADO_PILL_TEXT: Record<string, string> = {
  PENDIENTE:  Theme.colors.warningText,
  EN_PROCESO: Theme.colors.primary,
  RESUELTA:   Theme.colors.successText,
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // — Empty state —
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: Theme.radius.xl,
    backgroundColor: Theme.colors.success + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  emptyTitulo: {
    fontSize: Theme.typography.title,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // — Tarjeta —
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.base,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  cardStripe: {
    height: 4,
    width: '100%',
  },
  cardBody: {
    padding: Theme.spacing.base,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xs,
    gap: Theme.spacing.sm,
  },
  cardTitulo: {
    flex: 1,
    fontSize: Theme.typography.subtitle,
    fontWeight: '700',
    color: Theme.colors.text,
    lineHeight: 24,
  },
  prioridadBadge: {
    borderRadius: Theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  prioridadBadgeTexto: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
  },
  cardDescripcion: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    alignItems: 'center',
  },
  cardCreador: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textMedium,
    fontWeight: '600',
  },
  cardSeparador: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.border,
  },
  cardHabitacion: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '500',
  },
  cardFecha: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textMuted,
  },

  // — Selector de estado (pills por color) —
  estadoSelector: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  estadoPill: {
    flex: 1,
    borderRadius: Theme.radius.full,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: Theme.colors.surface2,
    minHeight: 36,
    justifyContent: 'center',
  },
  estadoPillTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textMedium,
  },

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
