import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 24, paddingBottom: 48, alignItems: 'center' },

  // — Avatar —
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarTexto: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  nombreCompleto: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },

  // — Badge de rol —
  badge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 28,
  },
  badgeCasero: { backgroundColor: '#007AFF' },
  badgeInquilino: { backgroundColor: '#34C759' },
  badgeTexto: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // — Tarjetas de datos —
  tarjeta: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tarjetaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9e9e9e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tarjetaValor: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },

  // — Botón logout —
  botonLogout: {
    width: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  botonLogoutTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
