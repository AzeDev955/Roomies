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
  // — Onboarding (sin casa) —
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 32,
    gap: 24,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#212529',
  },
  onboardingSubtitle: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    color: '#212529',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  botonCanjear: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonCanjearTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  // — Dashboard (con casa) —
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dashboardContent: {
    padding: 16,
    paddingBottom: 96,
  },
  bienvenida: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  subtituloDashboard: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },

  // — Tarjeta de incidencia —
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
  cardBody: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  cardDescripcion: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardEstado: {
    fontSize: 12,
    color: '#9e9e9e',
    fontWeight: '500',
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
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabTexto: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
});
