import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.base,
  },
  titulo: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
    letterSpacing: -0.3,
  },
  subtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.base,
  },
  card: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cardActivo: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: Theme.spacing.md,
  },
  cardTitulo: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 6,
  },
  cardDescripcion: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  botonConfirmar: {
    width: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    minHeight: 52,
    justifyContent: 'center',
  },
  botonConfirmarDisabled: {
    backgroundColor: Theme.colors.primaryDisabled,
  },
  botonConfirmarTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.subtitle,
    fontWeight: '700',
  },
});
