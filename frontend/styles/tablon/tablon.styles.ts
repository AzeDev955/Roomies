import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  loader: { flex: 1 },
  content: { padding: Theme.spacing.base, paddingBottom: 96 },
  emptyText: {
    textAlign: 'center',
    color: Theme.colors.textTertiary,
    fontSize: 14,
    marginTop: 40,
    lineHeight: 22,
  },

  // — Tarjeta de anuncio —
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.md,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  cardTitulo: {
    flex: 1,
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.text,
    marginRight: Theme.spacing.sm,
  },
  eliminarBtn: {
    fontSize: 14,
    color: Theme.colors.textTertiary,
    fontWeight: '600',
    paddingLeft: Theme.spacing.sm,
  },
  cardContenido: {
    fontSize: 14,
    color: Theme.colors.textMedium,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAutor: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  cardFecha: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textMuted,
  },

  // — FAB —
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    right: Theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabTexto: { color: Theme.colors.surface, fontSize: Theme.typography.hero, lineHeight: 36, fontWeight: '300' },

  // — Modal —
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.radius.lg,
    borderTopRightRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    paddingBottom: 36,
    gap: Theme.spacing.md,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  inputTitulo: {
    backgroundColor: Theme.colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Theme.spacing.md,
    fontSize: Theme.typography.body,
    color: Theme.colors.text,
  },
  inputContenido: {
    backgroundColor: Theme.colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Theme.spacing.md,
    fontSize: 14,
    color: Theme.colors.text,
    height: 120,
    lineHeight: 20,
  },
  modalAcciones: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: Theme.colors.textMedium,
    fontSize: Theme.typography.body,
    fontWeight: '600',
  },
  botonPublicar: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonPublicarDisabled: {
    backgroundColor: Theme.colors.primaryDisabled,
  },
  botonPublicarTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },
});
