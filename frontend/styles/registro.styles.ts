import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 48,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitulo: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 36,
  },
  // — Selector de tipo de documento —
  labelDoc: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.sm,
  },
  docFila: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  docChip: {
    flex: 1,
    borderRadius: Theme.radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface2,
  },
  docChipActivo: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  docChipTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  docChipTextoActivo: {
    color: Theme.colors.surface,
  },
  errorTexto: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.danger,
    marginTop: -Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xs,
  },
  // — Selector de rol —
  labelRol: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.sm,
  },
  rolFila: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: 20,
  },
  rolPill: {
    flex: 1,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
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
  enlaceLogin: {
    marginTop: Theme.spacing.lg,
    alignItems: 'center',
  },
  enlaceLoginTexto: {
    fontSize: 14,
    color: Theme.colors.primary,
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginTop: 20,
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
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    gap: 10,
    marginTop: Theme.spacing.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  botonGoogleTexto: {
    fontSize: Theme.typography.input,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
});
