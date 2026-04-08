import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.base, paddingBottom: 96 },

  // — Botón generar turnos —
  botonGenerar: {
    margin: Theme.spacing.base,
    marginBottom: 0,
  },

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

  // — Quick Chips —
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  chipTexto: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },

  // — T-Shirt Sizing —
  tshirtLabel: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.sm,
  },
  tshirtRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  tshirtBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  tshirtBtnActivo: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primary + '12',
  },
  tshirtBtnTexto: {
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.textMedium,
  },
  tshirtBtnTextoActivo: {
    color: Theme.colors.primary,
  },

  // — Card de zona —
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zonaNombre: {
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.text,
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  badgeActiva: { backgroundColor: '#e6f4ea' },
  badgeInactiva: { backgroundColor: Theme.colors.background },
  badgeTexto: {
    fontSize: Theme.typography.caption,
    fontWeight: '600',
  },
  badgeTextoActiva: { color: '#2e7d32' },
  badgeTextoInactiva: { color: Theme.colors.textTertiary },
  eliminarBtn: {
    fontSize: 14,
    color: Theme.colors.textTertiary,
    fontWeight: '600',
  },
  zonaPeso: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },

  // — FAB —
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    right: Theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabTexto: { color: Theme.colors.surface, fontSize: Theme.typography.hero, lineHeight: 36, fontWeight: '300' },
  fabPressed: { opacity: 0.8 },

  // — Modal —
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.radius.lg,
    borderTopRightRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    paddingBottom: 36,
    gap: Theme.spacing.md,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  modalAcciones: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: Theme.colors.textMedium,
    fontSize: Theme.typography.body,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonGuardarDisabled: { backgroundColor: Theme.colors.primaryDisabled },
  botonGuardarTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },
  botonPressed: { opacity: 0.7 },

  // — Asignación fija en card —
  asignacionRow: {
    marginTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: Theme.spacing.sm,
  },
  asignacionFija: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  asignarLink: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },

  // — Modal asignación: lista de inquilinos —
  modalSubtitulo: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: -Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  inquilinoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
  },
  inquilinoRowActual: {
    backgroundColor: Theme.colors.background,
  },
  inquilinoNombre: {
    fontSize: Theme.typography.body,
    color: Theme.colors.text,
  },
  inquilinoNombreActual: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  botonQuitarAsignacion: {
    marginTop: Theme.spacing.sm,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Theme.colors.danger,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
  },
  botonQuitarTexto: {
    color: Theme.colors.danger,
    fontSize: Theme.typography.body,
    fontWeight: '600',
  },

  // — Segmented Control —
  segmentedControl: {
    flexDirection: 'row',
    margin: Theme.spacing.base,
    marginBottom: 0,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  segTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segTabActivo: {
    backgroundColor: Theme.colors.primary,
  },
  segTabTexto: {
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.textMedium,
  },
  segTabTextoActivo: {
    color: Theme.colors.surface,
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
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  calendarioTitulo: {
    fontSize: 36,
    fontWeight: '900',
    color: Theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  calendarioBtnConfig: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Theme.colors.primary + '1A',
    borderRadius: Theme.radius.md,
  },
  calendarioBtnConfigTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.primary,
  },

  // — Navegación de semana ──────────────────────────────────────────────────
  semanaNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    paddingVertical: 12,
    paddingHorizontal: Theme.spacing.base,
    marginBottom: 20,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  semanaNavBtn: {
    paddingHorizontal: Theme.spacing.sm,
  },
  semanaNavTexto: {
    fontSize: 24,
    color: Theme.colors.textMedium,
    lineHeight: 28,
  },
  semanaLabel: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },

  // — Card de usuario (calendario) ──────────────────────────────────────────
  userCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: Theme.spacing.md,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  userNombre: {
    fontSize: Theme.typography.body + 2,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  userSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textTertiary,
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
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    marginTop: Theme.spacing.sm,
  },
  turnoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnoZona: {
    flex: 1,
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  turnoEstadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  turnoEstadoBadgeHecho: { backgroundColor: '#E1F5E8' },
  turnoEstadoBadgePendiente: { backgroundColor: Theme.colors.surface2 },
  turnoEstadoTexto: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  turnoEstadoTextoHecho: { color: '#248A3D' },
  turnoEstadoTextoPendiente: { color: Theme.colors.textTertiary },
});
