import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.base, paddingBottom: 48 },

  // — Empty / sin vivienda —
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: Theme.colors.textTertiary,
    fontSize: Theme.typography.body,
    lineHeight: 22,
  },

  // — Cabecera —
  header: {
    marginBottom: Theme.spacing.lg + 4,
  },
  headerSemana: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitulo: {
    fontSize: 30,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  headerSubtitulo: {
    fontSize: 15,
    color: Theme.colors.textSecondary,
    marginTop: 5,
  },

  // — Título de sección —
  seccionTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },

  // — Mis tareas: estado vacío inline —
  miTareaVacia: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  miTareaVaciaTexto: {
    color: Theme.colors.textTertiary,
    fontSize: Theme.typography.body,
    textAlign: 'center',
  },

  // — Card de mi turno —
  miTareaCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.lg,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  miTareaCardHecha: {
    opacity: 0.75,
  },
  miTareaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  miTareaTexto: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  miTareaZona: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  miTareaEsfuerzo: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 5,
  },
  miTareaIconBox: {
    backgroundColor: Theme.colors.primary + '0D',
    padding: 14,
    borderRadius: 16,
  },
  miTareaIconBoxHecha: {
    backgroundColor: '#E1F5E8',
  },

  // — Botón Marcar como Hecho —
  botonHecho: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botonHechoPressed: { opacity: 0.8 },
  botonHechoTexto: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },

  // — Badge "Completado" —
  badgeHecho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E1F5E8',
    borderRadius: 12,
    paddingVertical: 10,
  },
  badgeHechoTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '700',
    color: '#248A3D',
  },

  // — Filas de compañeros —
  companeroRow: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: Theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: Theme.spacing.sm,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  companeroInfo: {
    flex: 1,
  },
  companeroTurnoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  companeroZonaNombre: {
    fontSize: Theme.typography.body,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  companeroEstadoPendiente: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Theme.colors.warning,
  },
  companeroEstadoHecho: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#248A3D',
  },
  companeroAsignado: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
