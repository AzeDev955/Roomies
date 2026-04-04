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

export const ETIQUETAS_TIPO: Record<string, string> = {
  DORMITORIO: 'Dormitorio',
  BANO:       'Baño',
  COCINA:     'Cocina',
  SALON:      'Salón',
  OTRO:       'Otro',
};

export const styles = StyleSheet.create({
  // — Onboarding (sin casa) — sin cambios —
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

  // — Dashboard container —
  dashboardContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  dashboardContent: {
    padding: Theme.spacing.base,
    paddingBottom: 100,
  },

  // — Saludo —
  greeting: {
    marginBottom: 28,
    marginTop: Theme.spacing.sm,
  },
  greetingHola: {
    fontSize: 34,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  greetingSubtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },

  // — Sección genérica —
  seccion: {
    marginBottom: Theme.spacing.lg,
  },
  seccionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: Theme.colors.textTertiary,
    marginBottom: Theme.spacing.md,
    paddingHorizontal: 2,
  },

  // — Compañeros (scroll horizontal) —
  companerosRow: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
    paddingHorizontal: 2,
  },
  companeroItem: {
    alignItems: 'center',
    gap: 8,
    width: 64,
  },
  companeroNombreCorto: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.text,
    textAlign: 'center',
  },

  // — Zonas comunes (lista) —
  zonaRow: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.base,
    marginBottom: 8,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  zonaIconBox: {
    width: 40,
    height: 40,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zonaRowNombre: {
    flex: 1,
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.text,
  },

  // — Incidencia card —
  incidenciaCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.base + 4,
    marginBottom: Theme.spacing.md,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  incidenciaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  incidenciaTitulo: {
    fontSize: Theme.typography.body + 2,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 3,
  },
  incidenciaReporter: {
    fontSize: 12,
    color: Theme.colors.textTertiary,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radius.sm,
  },
  estadoBadgeTexto: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  incidenciaDescripcion: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },

  // — Selector de estado (editable) —
  estadoSelector: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
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

  // — Reportar problema —
  botonReportar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    marginTop: Theme.spacing.md,
  },
  botonReportarTexto: {
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.textMedium,
  },

  // — Historial toggle —
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

  // — Loader —
  loaderIncidencias: {
    marginTop: Theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: Theme.colors.textTertiary,
    fontSize: 14,
    marginVertical: Theme.spacing.md,
  },

  // — Abandonar vivienda —
  botonAbandonar: {
    marginTop: Theme.spacing.xl,
  },

  // — Modal compañero —
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  modalCardWrapper: {
    width: '100%',
  },
  modalContenido: {
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  modalNombre: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
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
  fabPressed: { opacity: 0.8 },
});
