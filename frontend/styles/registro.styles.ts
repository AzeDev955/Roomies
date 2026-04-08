import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl,
    paddingBottom: Theme.spacing.xxl,
  },
  titulo: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },

  // — Selector de tipo de documento —
  labelDoc: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textMedium,
    marginBottom: Theme.spacing.sm,
  },
  docFila: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.base,
  },
  docChip: {
    flex: 1,
    borderRadius: Theme.radius.full,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    minHeight: 44,
    justifyContent: 'center',
  },
  docChipActivo: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  docChipTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textMedium,
  },
  docChipTextoActivo: {
    color: Theme.colors.surface,
  },
  errorTexto: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.danger,
    fontWeight: '500',
    marginTop: -Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xs,
  },

  // — Selector de rol —
  labelRol: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textMedium,
    marginBottom: Theme.spacing.sm,
  },
  rolFila: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  rolPill: {
    flex: 1,
    borderRadius: Theme.radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    minHeight: 52,
    justifyContent: 'center',
  },
  rolPillActivo: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  rolPillTexto: {
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.textTertiary,
  },
  rolPillTextoActivo: {
    color: Theme.colors.surface,
  },

  // — Enlace / separador / Google —
  enlaceLogin: {
    marginTop: Theme.spacing.lg,
    alignItems: 'center',
  },
  enlaceLoginTexto: {
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
