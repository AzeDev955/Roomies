import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16, paddingBottom: 40 },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 16,
  },
  labelSeccion: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9e9e9e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212529',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // — Buscador Mapbox —
  buscadorFila: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  buscadorInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212529',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buscadorBoton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
  },
  buscadorBotonDisabled: {
    backgroundColor: '#b0c8f0',
  },
  buscadorBotonTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // — Lista de resultados —
  resultadosContainer: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  resultadoItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  resultadoTexto: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
  },

  // — Tipo pills —
  tipoFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipoPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  tipoPillActivo: {
    backgroundColor: '#007AFF',
  },
  tipoPillTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  tipoPillTextoActivo: {
    color: '#fff',
  },

  // — Switch habitable —
  switchFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  switchLabel: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
    marginRight: 12,
  },

  // — Botón añadir habitación —
  botonAnadirHabitacion: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  botonAnadirHabitacionTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // — Lista de habitaciones añadidas —
  habitacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  habitacionItemTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  habitacionItemBadgeTexto: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  habitacionItemEliminar: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  // — Botón guardar —
  boton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  botonDisabled: {
    backgroundColor: '#b0c8f0',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
