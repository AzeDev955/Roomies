import { StyleSheet } from 'react-native';
import { DefaultAppTheme, type AppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // — Empty / sin vivienda —
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textTertiary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  emptyIconBox: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyIconBoxLarge: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyTitleLarge: {
    fontSize: theme.typography.title,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },

  // — Cabecera —
  header: {
    marginBottom: theme.spacing.xl,
  },
  headerSemana: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitulo: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  headerSubtitulo: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 5,
    lineHeight: 22,
  },

  // — Título de sección —
  seccionTitulo: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },

  // — Mis tareas: estado vacío inline —
  miTareaVacia: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  miTareaVaciaTexto: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },

  // — Card de mi turno —
  miTareaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
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
    marginRight: theme.spacing.md,
  },
  miTareaZona: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  miTareaEsfuerzo: {
    fontSize: theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 5,
  },
  miTareaIconBox: {
    backgroundColor: theme.colors.primaryLight,
    padding: 14,
    borderRadius: theme.radius.md,
  },
  miTareaIconBoxHecha: {
    backgroundColor: theme.colors.successLight,
  },

  // — Botón Marcar como Hecho —
  botonHecho: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
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
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },

  // — Badge "Completado" —
  badgeHecho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
  },
  badgeHechoTexto: {
    fontSize: theme.typography.label,
    fontWeight: '700',
    color: theme.colors.successText,
  },

  // — Filas de compañeros —
  companeroRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
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
    fontSize: theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
  companeroEstadoPendiente: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: theme.colors.warningText,
  },
  companeroEstadoHecho: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: theme.colors.successText,
  },
  companeroAsignado: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export const styles = createStyles();
