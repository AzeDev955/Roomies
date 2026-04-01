import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const COLORES_PRIORIDAD: Record<string, string> = {
  VERDE:    Theme.colors.success,
  AMARILLO: Theme.colors.warning,
  ROJO:     Theme.colors.danger,
};

export const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTA: 'Resuelta',
};

export const ETIQUETAS_TIPO: Record<string, string> = {
  DORMITORIO: 'Dormitorio',
  BANO: 'Baño',
  COCINA: 'Cocina',
  SALON: 'Salón',
  OTRO: 'Otro',
};

export const styles = StyleSheet.create({
  // — Onboarding (sin casa) —
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: Theme.colors.text,
  },
  onboardingSubtitle: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputFila: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 20,
    paddingVertical: Theme.spacing.base,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputPrefijo: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
    color: Theme.colors.textTertiary,
  },
  inputSufijo: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 4,
    color: Theme.colors.text,
    padding: 0,
  },
  botonCanjear: {
    width: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.base,
    alignItems: 'center',
  },
  botonCanjearTexto: {
    color: Theme.colors.surface,
    fontSize: 17,
    fontWeight: '700',
  },
  botonCanjearDisabled: {
    backgroundColor: Theme.colors.primaryDisabled,
  },
  loaderIncidencias: {
    marginTop: Theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: Theme.colors.textTertiary,
    fontSize: 14,
    marginTop: Theme.spacing.lg,
  },

  // — Dashboard (con casa) —
  dashboardContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  dashboardContent: {
    padding: Theme.spacing.base,
    paddingBottom: 96,
  },
  bienvenida: {
    fontSize: Theme.typography.title,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  subtituloDashboard: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: 20,
  },
  seccionTitulo: {
    fontSize: Theme.typography.input,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },

  // — Compañeros de piso —
  companeroCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  companeroNombre: {
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  companeroHabitacion: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
  },

  // — Zonas comunes —
  zonasFilas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  zonaCard: {
    backgroundColor: Theme.colors.surface2,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  zonaNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  zonaTipo: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },

  // — Tarjeta de incidencia —
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
  cardBody: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  cardDescripcion: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: Theme.spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  cardEstado: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontWeight: '500',
  },
  cardFecha: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textMuted,
  },

  // — Abandonar vivienda —
  botonAbandonar: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: Theme.colors.danger,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.sm,
  },
  botonAbandonarTexto: {
    color: Theme.colors.danger,
    fontSize: Theme.typography.body,
    fontWeight: '600',
  },

  // — Selector de estado de incidencia —
  estadoSelector: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  estadoPill: {
    flex: 1,
    borderRadius: Theme.radius.sm,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: Theme.colors.surface2,
  },
  estadoPillActivo: {
    backgroundColor: Theme.colors.primary,
  },
  estadoPillTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textMedium,
  },
  estadoPillTextoActivo: {
    color: Theme.colors.surface,
  },
  estadoSoloLectura: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontWeight: '500',
    marginTop: 6,
  },

  // — Enlace tablón —
  enlaceTablon: {
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  enlaceTablonTexto: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '600',
  },

  // — Historial —
  historialToggle: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  historialToggleTexto: {
    fontSize: Theme.typography.label,
    color: Theme.colors.primary,
    fontWeight: '600',
  },

  // — FAB —
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    right: Theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabTexto: {
    color: Theme.colors.surface,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
});
