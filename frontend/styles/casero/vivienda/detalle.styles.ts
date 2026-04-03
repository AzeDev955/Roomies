import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.base, paddingBottom: 48 },
  errorTexto: { textAlign: 'center', marginTop: 40, color: Theme.colors.textTertiary },
  enlacePressed: { opacity: 0.6 },

  // — Header card —
  headerCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.base,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerNombre: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerDireccion: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: Theme.spacing.md,
  },
  headerChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chipHabitaciones: {
    backgroundColor: '#EFF6FF',
    borderRadius: Theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipHabitacionesTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  chipInquilinos: {
    backgroundColor: '#ECFDF5',
    borderRadius: Theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipInquilinosTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },

  // — Accesos rápidos —
  accionesGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.base,
  },
  accionBtn: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  accionBtnPressed: { opacity: 0.75 },
  accionIconIncidencias: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 12,
  },
  accionIconTablon: {
    backgroundColor: Theme.colors.primary + '12',
    borderRadius: 16,
    padding: 12,
  },
  accionLabel: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.text,
  },

  // — Sección título —
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
  },

  // — Habitación card —
  habCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.md,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: Theme.spacing.md,
  },
  habCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  habIconBox: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 12,
  },
  habNombre: {
    fontSize: Theme.typography.body,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  habTipo: {
    fontSize: 12,
    color: Theme.colors.textTertiary,
    marginTop: 2,
  },
  habInquilinoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  habInquilinoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  sinInquilino: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textTertiary,
    fontStyle: 'italic',
    flexShrink: 0,
  },

  // — Código de invitación —
  codigoContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
  },
  codigoLabel: { fontSize: 11, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.xs },
  codigo: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Courier New',
    letterSpacing: 2,
    color: Theme.colors.text,
  },
  codigoHint: {
    fontSize: 10,
    color: Theme.colors.textTertiary,
    marginTop: 2,
  },
  codigoReveladoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codigoReveladoTextoArea: { flex: 1 },
  codigoOcultoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.colors.surface2,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
  },
  revelarTexto: { fontSize: 12, fontWeight: '600', color: Theme.colors.textSecondary },

  // — Incidencias en card —
  incidenciasHabitacion: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Theme.spacing.sm,
    gap: 6,
  },
  incidenciaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  incidenciaDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  incidenciaTitulo: {
    flex: 1,
    fontSize: Theme.typography.caption,
    color: Theme.colors.textMedium,
  },

  // — Expulsar —
  expulsarFila: {
    borderTopWidth: 1,
    borderTopColor: '#FEF2F2',
    paddingTop: Theme.spacing.sm,
    alignItems: 'flex-end',
  },
  expulsarTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.danger,
    letterSpacing: 0.5,
  },

  // — Editar / Eliminar —
  accionFila: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },

  // — Botón añadir habitación —
  botonAnadir: {
    marginTop: Theme.spacing.sm,
  },
});
