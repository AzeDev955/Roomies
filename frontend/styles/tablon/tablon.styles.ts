import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1 },
  content: { padding: 16, paddingBottom: 96 },
  emptyText: {
    textAlign: 'center',
    color: '#9e9e9e',
    fontSize: 14,
    marginTop: 40,
    lineHeight: 22,
  },

  // — Tarjeta de anuncio —
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitulo: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    marginRight: 8,
  },
  eliminarBtn: {
    fontSize: 14,
    color: '#9e9e9e',
    fontWeight: '600',
    paddingLeft: 8,
  },
  cardContenido: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAutor: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  cardFecha: {
    fontSize: 12,
    color: '#c7c7cc',
  },

  // — FAB —
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabTexto: { color: '#fff', fontSize: 32, lineHeight: 36, fontWeight: '300' },

  // — Modal —
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
    gap: 12,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  inputTitulo: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212529',
  },
  inputContenido: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#212529',
    height: 120,
    lineHeight: 20,
  },
  modalAcciones: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: '#495057',
    fontSize: 15,
    fontWeight: '600',
  },
  botonPublicar: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonPublicarDisabled: {
    backgroundColor: '#b0c8f0',
  },
  botonPublicarTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
