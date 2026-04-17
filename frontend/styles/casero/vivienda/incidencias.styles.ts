import { StyleSheet } from 'react-native';
import { DefaultAppTheme, type AppTheme } from '@/constants/theme';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';
type Estado = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTA';

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

export const getColorPrioridad = (theme: AppTheme, prioridad: Prioridad) => ({
  VERDE: theme.colors.success,
  AMARILLO: theme.colors.warning,
  ROJO: theme.colors.danger,
})[prioridad];

export const ETIQUETAS_PRIORIDAD: Record<Prioridad, string> = {
  VERDE: 'Baja',
  AMARILLO: 'Media',
  ROJO: 'Alta',
};

export const ETIQUETAS_ESTADO: Record<Estado, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En curso',
  RESUELTA: 'Resuelta',
};

export const getEstadoPillBg = (theme: AppTheme, estado: Estado) => ({
  PENDIENTE: theme.colors.warningLight,
  EN_PROCESO: theme.colors.primaryLight,
  RESUELTA: theme.colors.successLight,
})[estado];

export const getEstadoPillText = (theme: AppTheme, estado: Estado) => ({
  PENDIENTE: theme.colors.warningText,
  EN_PROCESO: theme.colors.primary,
  RESUELTA: theme.colors.successText,
})[estado];

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyTitulo: {
    fontSize: theme.typography.title,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: 0,
  },
  emptySubtitulo: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.base,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardStripe: {
    height: 4,
    width: '100%',
  },
  cardBody: {
    padding: theme.spacing.base,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  cardTitulo: {
    flex: 1,
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 24,
  },
  prioridadBadge: {
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  prioridadBadgeTexto: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  cardDescripcion: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  cardCreador: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMedium,
    fontWeight: '600',
  },
  cardSeparador: {
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  cardHabitacion: {
    fontSize: theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  cardFecha: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
  },

  estadoSelector: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  estadoPill: {
    flex: 1,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.surface2,
    minHeight: 36,
    justifyContent: 'center',
  },
  estadoPillTexto: {
    fontSize: theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textMedium,
  },

  historialToggle: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  historialToggleTexto: {
    fontSize: theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  historialSeparador: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
});

export const styles = createStyles();
