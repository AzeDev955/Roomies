import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardActivo: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 6,
  },
  cardDescripcion: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 18,
  },
  botonConfirmar: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botonConfirmarDisabled: {
    backgroundColor: '#b0c8f0',
  },
  botonConfirmarTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
