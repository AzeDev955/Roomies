import { StyleSheet } from 'react-native';
import { DefaultAppTheme } from '@/constants/theme';
import type { AppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.base, paddingBottom: 96 },

  // — Botón generar turnos —
  botonGenerar: {
    margin: theme.spacing.base,
    marginBottom: 0,
  },

  // — Empty state —
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
    backgroundColor: theme.colors.success + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyTitulo: {
    fontSize: theme.typography.title,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitulo: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // — Quick Chips —
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipTexto: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // — T-Shirt Sizing —
  tshirtLabel: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  tshirtRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tshirtBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  tshirtBtnActivo: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '12',
  },
  tshirtBtnTexto: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textMedium,
  },
  tshirtBtnTextoActivo: {
    color: theme.colors.primary,
  },

  // — Card de zona —
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zonaNombre: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  badgeActiva: { backgroundColor: theme.colors.successLight },
  badgeInactiva: { backgroundColor: theme.colors.background },
  badgeTexto: {
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  badgeTextoActiva: { color: theme.colors.success },
  badgeTextoInactiva: { color: theme.colors.textTertiary },
  eliminarBtn: {
    fontSize: 14,
    color: theme.colors.danger,
    fontWeight: '600',
  },
  eliminarIconButton: {
    paddingLeft: theme.spacing.sm,
  },
  zonaPeso: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabTexto: { color: theme.colors.surface, fontSize: theme.typography.hero, lineHeight: 36, fontWeight: '300' },
  fabPressed: { opacity: 0.8 },

  // — Modal —
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    paddingBottom: 36,
    gap: theme.spacing.md,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalAcciones: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: theme.colors.textMedium,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonGuardarDisabled: { backgroundColor: theme.colors.primaryDisabled },
  botonGuardarTexto: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  botonPressed: { opacity: 0.7 },

  // — Asignación fija en card —
  asignacionRow: {
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  asignacionFija: {
    fontSize: theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  asignarLink: {
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
  },

  // — Modal asignación: lista de inquilinos —
  modalSubtitulo: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  inquilinoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  inquilinoRowActual: {
    backgroundColor: theme.colors.background,
  },
  inquilinoNombre: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  inquilinoNombreActual: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  botonQuitarAsignacion: {
    marginTop: theme.spacing.sm,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.danger,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  botonQuitarTexto: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },

  // — Segmented Control —
  segmentedControl: {
    flexDirection: 'row',
    margin: theme.spacing.base,
    marginBottom: 0,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  segTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segTabActivo: {
    backgroundColor: theme.colors.primary,
  },
  segTabTexto: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textMedium,
  },
  segTabTextoActivo: {
    color: theme.colors.surface,
  },

  // — Vista Calendario: cabecera ────────────────────────────────────────────
  calendarioHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  calendarioGestion: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  calendarioTitulo: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  calendarioBtnConfig: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary + '1A',
    borderRadius: theme.radius.md,
  },
  calendarioBtnConfigTexto: {
    fontSize: theme.typography.label,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  calendarioActions: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  calendarioBtnExport: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '33',
  },
  calendarioBtnExportTexto: {
    fontSize: theme.typography.label,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  calendarioBtnDisabled: {
    opacity: 0.45,
  },

  // — Navegación de semana ──────────────────────────────────────────────────
  semanaNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.base,
    marginBottom: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: theme.isDark ? 0.16 : 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  semanaNavBtn: {
    paddingHorizontal: theme.spacing.sm,
  },
  semanaNavTexto: {
    fontSize: 24,
    color: theme.colors.textMedium,
    lineHeight: 28,
  },
  semanaLabel: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },

  // — Card de usuario (calendario) ──────────────────────────────────────────
  filtroEstadoRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  filtroEstadoChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filtroEstadoChipActivo: {
    backgroundColor: theme.colors.primary + '18',
    borderColor: theme.colors.primary,
  },
  filtroEstadoTexto: {
    fontSize: theme.typography.label,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  filtroEstadoTextoActivo: {
    color: theme.colors.primary,
  },
  userCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.16 : 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  userNombre: {
    fontSize: theme.typography.body + 2,
    fontWeight: '700',
    color: theme.colors.text,
  },
  userSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  // — Fila de turno (nueva) ─────────────────────────────────────────────────
  turnoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    marginTop: theme.spacing.sm,
  },
  turnoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnoZona: {
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  turnoEstadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  turnoEstadoBadgeHecho: { backgroundColor: theme.colors.successLight },
  turnoEstadoBadgePendiente: { backgroundColor: theme.colors.surface2 },
  turnoEstadoTexto: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  turnoEstadoTextoHecho: { color: theme.colors.success },
  turnoEstadoTextoPendiente: { color: theme.colors.textTertiary },
});


export const styles = createStyles();
