import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: Theme.spacing.lg, paddingBottom: 48, alignItems: 'center' },

  // — Avatar —
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarTexto: {
    color: Theme.colors.surface,
    fontSize: 36,
    fontWeight: '700',
  },
  nombreCompleto: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },

  // — Badge de rol —
  badge: {
    borderRadius: Theme.radius.lg,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 6,
    marginBottom: 28,
  },
  badgeCasero: { backgroundColor: Theme.colors.primary },
  badgeInquilino: { backgroundColor: Theme.colors.success },
  badgeTexto: { color: Theme.colors.surface, fontSize: Theme.typography.label, fontWeight: '700' },

  // — Tarjetas de datos —
  tarjeta: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    marginBottom: 10,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tarjetaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.xs,
  },
  tarjetaValor: {
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
    fontWeight: '500',
  },

  // — Botón logout —
  botonLogout: {
    width: '100%',
    backgroundColor: Theme.colors.danger,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.base,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: Theme.colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  botonLogoutTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.input,
    fontWeight: '700',
  },
});
