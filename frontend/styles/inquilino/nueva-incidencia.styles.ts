import { StyleSheet } from 'react-native';

export const COLORES_PRIORIDAD: Record<string, string> = {
  VERDE: '#34C759',
  AMARILLO: '#FF9500',
  ROJO: '#FF3B30',
};

export const ETIQUETAS_PRIORIDAD: Record<string, string> = {
  VERDE: 'Sugerencia',
  AMARILLO: 'Aviso',
  ROJO: 'Urgente',
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 96 },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 24,
  },

  // — Campos —
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputTexto: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212529',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  inputDescripcion: {
    height: 120,
    textAlignVertical: 'top',
  },

  // — Selector de prioridad —
  selectorFila: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  selectorBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorBtnTexto: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // — Botón enviar —
  botonEnviar: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonEnviarTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  botonEnviarDisabled: {
    backgroundColor: '#b0c8f0',
  },
});
