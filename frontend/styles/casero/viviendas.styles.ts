import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  list: {
    padding: Theme.spacing.base,
    paddingBottom: 100,
  },

  // — Header —
  header: {
    marginBottom: Theme.spacing.lg,
    marginTop: Theme.spacing.sm,
  },
  headerTitulo: {
    fontSize: 28,
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
    opacity: 0.88,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    height: 120,
    backgroundColor: Theme.colors.primary + '1A',
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
    fontSize: 20,
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
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipHabitacionesTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  chipInquilinos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipInquilinosTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },

  // — Empty state —
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyTitulo: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
    marginTop: Theme.spacing.base,
    textAlign: 'center',
  },
  emptySubtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
    lineHeight: 22,
  },
  emptyBoton: {
    marginTop: Theme.spacing.lg,
    width: '100%',
  },

  // — FAB —
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Theme.colors.primary,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabTexto: {
    color: Theme.colors.surface,
    fontWeight: '700',
    fontSize: Theme.typography.body,
  },
  fabPressed: {
    opacity: 0.8,
  },
});
