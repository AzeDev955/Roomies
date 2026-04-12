import { render, waitFor } from '@testing-library/react-native';
import RootLayout from '../_layout';

const mockReplace = jest.fn();
const mockObtenerToken = jest.fn();
const mockEliminarToken = jest.fn();
const mockApiGet = jest.fn();
const mockSyncPushToken = jest.fn();

jest.mock('expo-router', () => {
  return {
    Stack: function MockStack() {
      return null;
    },
    useRouter: () => ({ replace: mockReplace }),
  };
});

jest.mock('react-native-toast-message', () => {
  return function MockToast() {
    return null;
  };
});

jest.mock('@/services/auth.service', () => ({
  obtenerToken: () => mockObtenerToken(),
  eliminarToken: () => mockEliminarToken(),
}));

jest.mock('@/services/api', () => ({
  get: (...args: unknown[]) => mockApiGet(...args),
}));

jest.mock('@/utils/notifications', () => ({
  syncPushToken: () => mockSyncPushToken(),
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirige una sesion restaurada al dashboard segun rol', async () => {
    mockObtenerToken.mockResolvedValue('token');
    mockApiGet.mockResolvedValue({ data: { rol: 'INQUILINO' } });

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/inquilino/inicio');
    });
    expect(mockSyncPushToken).toHaveBeenCalled();
    expect(mockEliminarToken).not.toHaveBeenCalled();
  });

  it('elimina el token y vuelve al login cuando /auth/me falla', async () => {
    mockObtenerToken.mockResolvedValue('token');
    mockApiGet.mockRejectedValue(new Error('No autorizado'));
    mockEliminarToken.mockResolvedValue(undefined);

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockEliminarToken).toHaveBeenCalled();
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
