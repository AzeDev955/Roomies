import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 100,
  },

  // Header
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  headerTitulo: {
    fontSize: theme.typography.hero,
    fontWeight: '800',
    color: theme.colors.text,
  },
  headerSubtitulo: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: theme.spacing.xs,
  },

  // Tarjeta vivienda
  cardWrapper: {
    marginBottom: theme.spacing.base,
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
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: theme.spacing.base,
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: theme.typography.title,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  cardDireccionFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  cardDireccion: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chipHabitaciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  chipHabitacionesTexto: {
    fontSize: theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  chipInquilinos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  chipInquilinosTexto: {
    fontSize: theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.success,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitulo: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptySubtitulo: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: theme.spacing.lg,
  },
  emptyBoton: {
    marginTop: theme.spacing.xl,
    width: '100%',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.28 : 0.32,
    shadowRadius: 8,
    elevation: 8,
  },
  fabTexto: {
    color: theme.colors.surface,
    fontWeight: '700',
    fontSize: theme.typography.body,
  },
  fabPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});

export const styles = createStyles();
