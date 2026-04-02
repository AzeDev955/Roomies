import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.base,
    paddingBottom: Theme.spacing.xl,
    alignItems: 'center',
  },

  // — Avatar —
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  avatarTexto: {
    fontSize: 28,
    fontWeight: '700',
    color: Theme.colors.surface,
    letterSpacing: 1,
  },

  // — Nombre y subtítulo —
  nombre: {
    fontSize: Theme.typography.heading,
    fontWeight: '700',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  subtitulo: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },

  // — Card de datos de contacto —
  card: {
    width: '100%',
    marginBottom: Theme.spacing.base,
  },
  cardTitulo: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.md,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  filaTexto: {
    fontSize: Theme.typography.body,
    color: Theme.colors.text,
    flex: 1,
  },
  separador: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.xs,
  },

  // — Botón de email —
  botonEmail: {
    width: '100%',
    marginTop: Theme.spacing.sm,
  },
});
