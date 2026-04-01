import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.base, paddingBottom: 96 },
  title: { fontSize: Theme.typography.heading, fontWeight: '700', marginBottom: Theme.spacing.xs },
  address: { fontSize: 14, color: Theme.colors.textSecondary, marginBottom: 20 },
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
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  cardTitle: { fontSize: Theme.typography.input, fontWeight: '600' },
  cardTipo: { fontSize: Theme.typography.caption, color: Theme.colors.textTertiary, textTransform: 'uppercase' },
  codigoContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: Theme.radius.sm,
    padding: 10,
    marginTop: Theme.spacing.sm,
  },
  codigoLabel: { fontSize: 11, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.xs },
  codigo: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Courier New',
    letterSpacing: 2,
    color: Theme.colors.text,
  },
  errorTexto: { textAlign: 'center', marginTop: 40, color: Theme.colors.textTertiary },
  enlaceIncidencias: {
    fontSize: Theme.typography.label,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.base,
  },

  // — Indicadores de incidencias en tarjeta de habitación —
  incidenciasHabitacion: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 10,
    paddingTop: 10,
    gap: 6,
  },
  incidenciaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  incidenciaDot: {
    width: Theme.spacing.sm,
    height: Theme.spacing.sm,
    borderRadius: 4,
    flexShrink: 0,
  },
  incidenciaTitulo: {
    flex: 1,
    fontSize: Theme.typography.caption,
    color: Theme.colors.textMedium,
  },
  codigoReveladoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codigoReveladoTextoArea: {
    flex: 1,
  },
  codigoHint: {
    fontSize: 10,
    color: Theme.colors.textTertiary,
    marginTop: 2,
  },
  compartirBoton: {
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  compartirBotonTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.caption,
    fontWeight: '700',
  },
  codigoOculto: {
    fontSize: 22,
    letterSpacing: 4,
    color: Theme.colors.textTertiary,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  revelarTexto: { fontSize: 11, color: Theme.colors.primary, marginTop: 2 },

  // — Inquilino info —
  inquilinoInfo: {
    backgroundColor: '#e8f4fd',
    borderRadius: Theme.radius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inquilinoTextos: {
    flex: 1,
  },
  inquilinoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a5a8a',
  },
  inquilinoEmail: {
    fontSize: Theme.typography.caption,
    color: '#0a5a8a',
    marginTop: 2,
  },
  botonExpulsar: {
    backgroundColor: Theme.colors.danger,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: Theme.spacing.sm,
  },
  botonExpulsarTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.caption,
    fontWeight: '700',
  },
  sinInquilino: {
    fontSize: Theme.typography.label,
    color: '#adb5bd',
    fontStyle: 'italic',
    marginBottom: Theme.spacing.sm,
  },

  // — Acciones editar/eliminar —
  accionFila: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  botonEditar: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.sm,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: Theme.colors.danger,
    borderRadius: Theme.radius.sm,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
  },
  botonAccionTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.label,
    fontWeight: '700',
  },

  // — FAB —
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    right: Theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: { color: Theme.colors.surface, fontSize: Theme.typography.hero, lineHeight: 36, fontWeight: '300' },
});
