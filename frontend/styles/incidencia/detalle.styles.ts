import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const COLORES_PRIORIDAD: Record<string, string> = {
  VERDE:    Theme.colors.success,
  AMARILLO: Theme.colors.warning,
  ROJO:     Theme.colors.danger,
};

export const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE:  'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTA:   'Resuelta',
};

export const ETIQUETAS_PRIORIDAD: Record<string, string> = {
  VERDE:    'Baja',
  AMARILLO: 'Media',
  ROJO:     'Alta',
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.base, paddingBottom: 40 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTexto: { textAlign: 'center', marginTop: 40, color: Theme.colors.textTertiary },

  // — Cabecera —
  cabecera: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: Theme.spacing.xs,
    flexShrink: 0,
  },
  cabeceraTextos: { flex: 1 },
  titulo: { fontSize: Theme.typography.title, fontWeight: '700', color: Theme.colors.text, marginBottom: Theme.spacing.xs },
  subtitulo: { fontSize: Theme.typography.label, color: Theme.colors.textTertiary },

  // — Secciones de datos —
  seccion: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.md,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  etiqueta: { fontSize: 11, color: Theme.colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', marginBottom: Theme.spacing.xs },
  valor: { fontSize: 14, color: Theme.colors.text, lineHeight: 20 },

  // — Edición inline —
  inputTexto: {
    fontSize: 14,
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.sm,
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  inputDescripcion: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // — Acciones —
  accionFila: { flexDirection: 'row', gap: 10, marginTop: Theme.spacing.sm },
  botonEditar: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    borderRadius: 10,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: Theme.colors.success,
    borderRadius: 10,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: Theme.colors.surface2,
    borderRadius: 10,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: Theme.colors.danger,
    borderRadius: 10,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  botonTextoClaro: { color: Theme.colors.surface, fontSize: 14, fontWeight: '700' },
  botonTextoOscuro: { color: Theme.colors.textMedium, fontSize: 14, fontWeight: '700' },

  // — Selector de estado —
  estadoSelector: { flexDirection: 'row', gap: 6, marginTop: Theme.spacing.xs },
  estadoPill: {
    flex: 1,
    borderRadius: Theme.radius.sm,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    backgroundColor: Theme.colors.surface2,
  },
  estadoPillActivo: { backgroundColor: Theme.colors.primary },
  estadoPillTexto: { fontSize: 11, fontWeight: '600', color: Theme.colors.textMedium },
  estadoPillTextoActivo: { color: Theme.colors.surface },
});
