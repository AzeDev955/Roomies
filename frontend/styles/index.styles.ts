import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
  },
  logo: {
    fontSize: theme.typography.hero,
    fontWeight: '800',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitulo: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  enlaceRegistro: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  enlaceRegistroTexto: {
    fontSize: theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  separadorLinea: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  separadorTexto: {
    fontSize: theme.typography.label,
    color: theme.colors.textTertiary,
  },
  botonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    gap: 10,
    marginTop: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    minHeight: 52,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.18 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  botonGoogleTexto: {
    fontSize: theme.typography.input,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});

export const styles = createStyles();
