import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: 100, // espacio para el FAB
  },

  // — Cabecera —
  header: {
    marginBottom: Theme.spacing.lg,
  },
  headerEtiqueta: {
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

  // — Hero Card Balance —
  heroCard: {
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heroEtiqueta: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Theme.spacing.sm,
  },
  heroImporte: {
    fontSize: Theme.typography.hero,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 38,
  },
  heroDescripcion: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    marginTop: Theme.spacing.xs,
    opacity: 0.75,
  },

  // — Sección —
  seccionTitulo: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },

  // — Tarjetas de Deuda —
  deudaCard: {
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    borderWidth: 1.5,
  },
  deudaInfo: {
    flex: 1,
  },
  deudaConcepto: {
    fontSize: Theme.typography.label,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.1,
  },
  deudaRelacion: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  deudaImporte: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '900',
    color: Theme.colors.text,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  botonSaldar: {
    backgroundColor: Theme.colors.danger,
    borderRadius: Theme.radius.full,
    paddingVertical: 10,
    paddingHorizontal: Theme.spacing.base,
    minWidth: 72,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonSaldarPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  botonSaldarTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.label,
    fontWeight: '700',
  },
  badgeEsperando: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.success + '18',
    borderRadius: Theme.radius.full,
    paddingVertical: 8,
    paddingHorizontal: Theme.spacing.md,
    minHeight: 34,
  },
  badgeEsperandoTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // — Card de Gasto —
  gastoCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gastoInfo: {
    flex: 1,
  },
  gastoConcepto: {
    fontSize: Theme.typography.body,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.2,
  },
  gastoPagador: {
    fontSize: Theme.typography.caption,
    fontWeight: '600',
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 3,
  },
  gastoFecha: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  gastoImporteBox: {
    alignItems: 'flex-end',
  },
  gastoImporte: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  gastoImporteSub: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textTertiary,
    marginTop: 2,
  },

  // — Empty State —
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.lg,
  },
  emptyIconBox: {
    width: 84,
    height: 84,
    borderRadius: Theme.radius.xl,
    backgroundColor: Theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emptyTitulo: {
    fontSize: Theme.typography.title,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // — Modal (bottom sheet) —
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: 40,
    gap: Theme.spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.border,
    alignSelf: 'center',
    marginBottom: Theme.spacing.md,
  },
  modalTitulo: {
    fontSize: Theme.typography.title,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  inputLabel: {
    fontSize: Theme.typography.label,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.base,
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
    minHeight: 52,
  },
  modalAcciones: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  botonCancelarTexto: {
    color: Theme.colors.textMedium,
    fontSize: Theme.typography.body,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  botonGuardarDisabled: {
    backgroundColor: Theme.colors.primaryDisabled,
  },
  botonGuardarTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },
  botonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },

  // — FAB —
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.xl,
    right: Theme.spacing.lg,
    width: 58,
    height: 58,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
