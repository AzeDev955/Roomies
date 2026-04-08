import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  list: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: 100,
  },

  // — Header —
  header: {
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.sm,
  },
  headerTitulo: {
    fontSize: 32,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },

  // — Tarjeta vivienda —
  cardWrapper: {
    marginBottom: Theme.spacing.base,
  },
  cardWrapperPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    height: 110,
    backgroundColor: Theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: Theme.spacing.base,
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: Theme.typography.title,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  cardDireccionFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Theme.spacing.md,
  },
  cardDireccion: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chipHabitaciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.primary + '18',
    borderRadius: Theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipHabitacionesTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  chipInquilinos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.success + '18',
    borderRadius: Theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipInquilinosTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.success,
  },

  // — Empty state —
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: Theme.radius.xl,
    backgroundColor: Theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emptyTitulo: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
    lineHeight: 24,
  },
  emptyBoton: {
    marginTop: Theme.spacing.xl,
    width: '100%',
  },

  // — FAB —
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    right: Theme.spacing.lg,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabTexto: {
    color: Theme.colors.surface,
    fontWeight: '700',
    fontSize: Theme.typography.body,
  },
  fabPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});
