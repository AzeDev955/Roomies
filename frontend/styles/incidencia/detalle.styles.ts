import { StyleSheet } from 'react-native';

export const COLORES_PRIORIDAD: Record<string, string> = {
  VERDE: '#34C759',
  AMARILLO: '#FF9500',
  ROJO: '#FF3B30',
};

export const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTA: 'Resuelta',
};

export const ETIQUETAS_PRIORIDAD: Record<string, string> = {
  VERDE: 'Baja',
  AMARILLO: 'Media',
  ROJO: 'Alta',
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTexto: { textAlign: 'center', marginTop: 40, color: '#9e9e9e' },

  // — Cabecera —
  cabecera: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
    flexShrink: 0,
  },
  cabeceraTextos: { flex: 1 },
  titulo: { fontSize: 20, fontWeight: '700', color: '#212529', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#9e9e9e' },

  // — Secciones de datos —
  seccion: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  etiqueta: { fontSize: 11, color: '#9e9e9e', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  valor: { fontSize: 14, color: '#212529', lineHeight: 20 },

  // — Edición inline —
  inputTexto: {
    fontSize: 14,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  inputDescripcion: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // — Acciones —
  accionFila: { flexDirection: 'row', gap: 10, marginTop: 8 },
  botonEditar: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonTextoClaro: { color: '#fff', fontSize: 14, fontWeight: '700' },
  botonTextoOscuro: { color: '#495057', fontSize: 14, fontWeight: '700' },

  // — Selector de estado —
  estadoSelector: { flexDirection: 'row', gap: 6, marginTop: 4 },
  estadoPill: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  estadoPillActivo: { backgroundColor: '#007AFF' },
  estadoPillTexto: { fontSize: 11, fontWeight: '600', color: '#495057' },
  estadoPillTextoActivo: { color: '#fff' },
});
