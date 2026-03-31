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

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 32 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#9e9e9e', fontSize: 14, marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  indicador: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTitulo: { fontSize: 15, fontWeight: '600', color: '#212529', marginBottom: 4 },
  cardDescripcion: { fontSize: 13, color: '#6c757d', lineHeight: 18, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8, alignItems: 'center' },
  cardCreador: { fontSize: 12, color: '#495057', fontWeight: '500' },
  cardSeparador: { fontSize: 12, color: '#dee2e6' },
  cardHabitacion: { fontSize: 12, color: '#007AFF' },
  cardFecha: { fontSize: 12, color: '#c7c7cc' },
  estadoSelector: { flexDirection: 'row', gap: 6, marginTop: 4 },
  estadoPill: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  estadoPillActivo: { backgroundColor: '#007AFF' },
  estadoPillTexto: { fontSize: 11, fontWeight: '600', color: '#495057' },
  estadoPillTextoActivo: { color: '#fff' },
});
