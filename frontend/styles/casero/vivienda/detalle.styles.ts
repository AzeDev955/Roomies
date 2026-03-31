import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 96 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  address: { fontSize: 14, color: '#6c757d', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardTipo: { fontSize: 12, color: '#9e9e9e', textTransform: 'uppercase' },
  codigoContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  codigoLabel: { fontSize: 11, color: '#6c757d', marginBottom: 4 },
  codigo: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Courier New',
    letterSpacing: 2,
    color: '#212529',
  },
  errorTexto: { textAlign: 'center', marginTop: 40, color: '#9e9e9e' },
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
    color: '#9e9e9e',
    marginTop: 2,
  },
  compartirBoton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compartirBotonTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  codigoOculto: {
    fontSize: 22,
    letterSpacing: 4,
    color: '#9e9e9e',
    fontWeight: '700',
    marginBottom: 4,
  },
  revelarTexto: { fontSize: 11, color: '#007AFF', marginTop: 2 },

  // — Inquilino info —
  inquilinoInfo: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
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
    fontSize: 12,
    color: '#0a5a8a',
    marginTop: 2,
  },
  botonExpulsar: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  botonExpulsarTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  sinInquilino: {
    fontSize: 13,
    color: '#adb5bd',
    fontStyle: 'italic',
    marginBottom: 8,
  },

  // — Acciones editar/eliminar —
  accionFila: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  botonEditar: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  botonAccionTexto: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // — FAB —
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 36, fontWeight: '300' },
});
