import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.base,
  },
  titulo: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    letterSpacing: 0,
  },
  subtitulo: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.base,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: theme.isDark ? 0.2 : 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cardActivo: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  cardIconBox: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitulo: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  cardDescripcion: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  botonConfirmar: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    minHeight: 52,
    justifyContent: 'center',
  },
  botonConfirmarDisabled: {
    backgroundColor: theme.colors.primaryDisabled,
  },
  botonConfirmarTexto: {
    color: theme.colors.background,
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
});

export const styles = createStyles();
