import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },

  // — Avatar —
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.42 : 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarTexto: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.background,
    letterSpacing: 1,
  },

  // — Nombre y subtítulo —
  nombre: {
    fontSize: theme.typography.heading,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitulo: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },

  // — Card de datos de contacto —
  card: {
    width: '100%',
    marginBottom: theme.spacing.base,
  },
  cardTitulo: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  filaTexto: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  separador: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },

  // — Botón de email —
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.base,
    backgroundColor: theme.colors.background,
  },
  errorIconBox: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorAction: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },

  botonEmail: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
});

export const styles = createStyles();
