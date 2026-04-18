import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/constants/theme';

export const getEstadoBadgeBg = (theme: AppTheme): Record<string, string> => ({
  PENDIENTE: theme.colors.warningLight,
  EN_PROCESO: theme.colors.primaryLight,
  RESUELTA: theme.colors.successLight,
});

export const getEstadoBadgeColor = (theme: AppTheme): Record<string, string> => ({
  PENDIENTE: theme.colors.warningText,
  EN_PROCESO: theme.colors.primary,
  RESUELTA: theme.colors.successText,
});

export const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE:  'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTA:   'Resuelta',
};

export const ETIQUETAS_TIPO: Record<string, string> = {
  DORMITORIO: 'Dormitorio',
  BANO:       'Baño',
  COCINA:     'Cocina',
  SALON:      'Salón',
  OTRO:       'Otro',
};

export const createAvatarInitialsStyle = (theme: AppTheme, size: number) => ({
  container: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  text: {
    fontSize: size * 0.32,
    fontWeight: '700' as const,
    color: theme.colors.primary,
  },
});

export const emptyIncidenciasStyles = (theme: AppTheme) => ({
  container: {
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.successLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  title: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700' as const,
    color: theme.colors.text,
    textAlign: 'center' as const,
  },
  description: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
});

export const createStyles = (theme: AppTheme) => StyleSheet.create({
  // — Onboarding (sin casa) —
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.colors.text,
  },
  onboardingSubtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputFila: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 20,
    paddingVertical: theme.spacing.base,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inputPrefijo: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.textTertiary,
  },
  inputSufijo: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 4,
    color: theme.colors.text,
    padding: 0,
  },
  botonCanjear: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.base,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  botonCanjearTexto: {
    color: theme.colors.surface,
    fontSize: 17,
    fontWeight: '700',
  },
  botonCanjearDisabled: {
    backgroundColor: theme.colors.primaryDisabled,
  },

  // — Dashboard container —
  dashboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  dashboardContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 100,
  },

  // — Saludo —
  greeting: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  greetingHola: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  greetingSubtitulo: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 6,
  },
  greetingViviendaPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingViviendaPillTexto: {
    fontSize: theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  precioHabitacionPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  precioHabitacionLabel: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.success,
  },
  precioHabitacionValor: {
    fontSize: theme.typography.label,
    fontWeight: '800',
    color: theme.colors.success,
  },

  // — Sección genérica —
  seccion: {
    marginBottom: theme.spacing.xl,
  },
  seccionLabel: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: 2,
  },

  // — Compañeros (scroll horizontal) —
  companerosRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  companeroItem: {
    alignItems: 'center',
    gap: 8,
    width: 68,
  },
  companeroNombreCorto: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },

  // — Zonas comunes (lista) —
  zonaRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.base,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  zonaIconBox: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zonaRowNombre: {
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },

  // — Incidencia card —
  incidenciaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  incidenciaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  incidenciaTitulo: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 3,
  },
  incidenciaReporter: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  estadoBadgeTexto: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  incidenciaDescripcion: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  // — Selector de estado (editable) —
  estadoSelector: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  estadoPill: {
    flex: 1,
    borderRadius: theme.radius.full,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: theme.colors.surface2,
  },
  estadoPillActivo: {
    backgroundColor: theme.colors.primary,
  },
  estadoPillTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMedium,
  },
  estadoPillTextoActivo: {
    color: theme.colors.surface,
  },

  // — Reportar problema —
  botonReportar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    marginTop: theme.spacing.md,
    minHeight: 52,
  },
  botonReportarTexto: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textMedium,
  },

  // — Historial toggle —
  historialToggle: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  historialToggleTexto: {
    fontSize: theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // — Loader —
  loaderIncidencias: {
    marginTop: theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textTertiary,
    fontSize: theme.typography.label,
    marginVertical: theme.spacing.md,
  },

  // — Abandonar vivienda —
  botonAbandonar: {
    marginTop: theme.spacing.xl,
  },

  // — Modal compañero —
  modalBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalCardWrapper: {
    width: '100%',
  },
  modalContenido: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  modalNombre: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalDato: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    paddingHorizontal: 4,
  },
  modalDatoTexto: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  modalCargando: {
    marginVertical: theme.spacing.md,
  },

  // — FAB —
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabTexto: {
    color: theme.colors.surface,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
  fabPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.95 }],
  },
});
