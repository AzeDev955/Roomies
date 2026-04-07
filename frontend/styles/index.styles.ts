import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.xl,
  },
  logo: {
    fontSize: Theme.typography.hero,
    fontWeight: '800',
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  enlaceRegistro: {
    marginTop: Theme.spacing.lg,
    alignItems: 'center',
  },
  enlaceRegistroTexto: {
    fontSize: Theme.typography.label,
    color: Theme.colors.primary,
    fontWeight: '500',
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xs,
  },
  separadorLinea: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  separadorTexto: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textTertiary,
  },
  botonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    gap: 10,
    marginTop: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    minHeight: 52,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  botonGoogleTexto: {
    fontSize: Theme.typography.input,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
