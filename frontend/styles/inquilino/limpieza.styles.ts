import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.base, paddingBottom: 40 },

  // — Empty / sin vivienda —
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: Theme.colors.textTertiary,
    fontSize: 14,
    lineHeight: 22,
  },

  // — Cabecera de semana —
  semanaLabel: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },

  // — Títulos de sección —
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },

  // — Mi Tarea: card de turno propio —
  zonaNombreMia: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  esfuerzoTexto: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  estadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    flexWrap: 'wrap',
    marginTop: Theme.spacing.xs,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  estadoBadgePendiente: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  estadoBadgeHecho: {
    backgroundColor: '#e6f4ea',
  },
  estadoBadgeNoHecho: {
    backgroundColor: '#fdecea',
  },
  estadoTexto: {
    fontSize: Theme.typography.caption,
    fontWeight: '600',
  },
  estadoTextoPendiente: { color: Theme.colors.textMedium },
  estadoTextoHecho: { color: '#2e7d32' },
  estadoTextoNoHecho: { color: Theme.colors.danger },

  // — Botón Marcar como Hecho —
  botonHecho: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minWidth: 160,
    alignItems: 'center',
  },
  botonHechoPressed: { opacity: 0.8 },
  botonHechoTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },

  // — Compañeros —
  companeroNombre: {
    fontSize: Theme.typography.body,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  companeroTurnoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  companeroZona: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textMedium,
  },
  companeroEstadoHecho: {
    fontSize: Theme.typography.caption,
    fontWeight: '600',
    color: '#2e7d32',
  },
  companeroEstadoPendiente: {
    fontSize: Theme.typography.caption,
    fontWeight: '600',
    color: Theme.colors.textTertiary,
  },
});
