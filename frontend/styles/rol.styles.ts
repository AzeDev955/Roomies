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
    fontSize: 26,
    fontWeight: '700',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  subtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing.base,
  },
  card: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardActivo: {
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: Theme.spacing.md,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 6,
  },
  cardDescripcion: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  botonConfirmar: {
    width: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.base,
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  botonConfirmarDisabled: {
    backgroundColor: Theme.colors.primaryDisabled,
  },
  botonConfirmarTexto: {
    color: Theme.colors.surface,
    fontSize: 17,
    fontWeight: '700',
  },
});
