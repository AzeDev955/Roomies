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
