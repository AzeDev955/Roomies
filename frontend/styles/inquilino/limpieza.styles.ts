import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },

  // — Empty / sin vivienda —
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: Theme.colors.textTertiary,
    fontSize: Theme.typography.body,
    lineHeight: 24,
  },
  emptyIconBox: {
    width: 88,
    height: 88,
    borderRadius: Theme.radius.xl,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },

  // — Cabecera —
  header: {
    marginBottom: Theme.spacing.xl,
  },
  headerSemana: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitulo: {
    fontSize: 30,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  headerSubtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: 5,
    lineHeight: 22,
  },

  // — Título de sección —
  seccionTitulo: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '700',
    color: Theme.colors.text,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },

  // — Mis tareas: estado vacío inline —
  miTareaVacia: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  miTareaVaciaTexto: {
    color: Theme.colors.textTertiary,
    fontSize: Theme.typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },

  // — Card de mi turno —
  miTareaCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.lg,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  miTareaCardHecha: {
    opacity: 0.72,
  },
  miTareaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  miTareaTexto: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  miTareaZona: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  miTareaEsfuerzo: {
    fontSize: Theme.typography.caption,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 5,
  },
  miTareaIconBox: {
    backgroundColor: Theme.colors.primary + '15',
    padding: 14,
    borderRadius: Theme.radius.md,
  },
  miTareaIconBoxHecha: {
    backgroundColor: Theme.colors.successLight,
  },

  // — Botón Marcar como Hecho —
  botonHecho: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.full,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
  },
  botonHechoPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  botonHechoTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },

  // — Badge "Completado" —
  badgeHecho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Theme.colors.successLight,
    borderRadius: Theme.radius.md,
    paddingVertical: 10,
  },
  badgeHechoTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '700',
    color: Theme.colors.successText,
  },

  // — Filas de compañeros —
  companeroRow: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: Theme.spacing.sm,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  companeroInfo: {
    flex: 1,
  },
  companeroTurnoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  companeroZonaNombre: {
    fontSize: Theme.typography.body,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  companeroEstadoPendiente: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Theme.colors.warning,
  },
  companeroEstadoHecho: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Theme.colors.successText,
  },
  companeroAsignado: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
