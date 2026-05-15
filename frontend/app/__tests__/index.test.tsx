import { TextInput } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '../index';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockApiPost = jest.fn();
const mockGuardarToken = jest.fn();
const mockToastShow = jest.fn();
const mockGooglePromptAsync = jest.fn();
const mockSyncPushToken = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('react-native-toast-message', () => ({
  show: (...args: unknown[]) => mockToastShow(...args),
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: () => [null, null, mockGooglePromptAsync],
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
  return {
    AntDesign: function MockAntDesign() {
      return null;
    },
    Ionicons: function MockIonicons() {
      return null;
    },
  };
});

jest.mock('@/services/api', () => ({
  post: (...args: unknown[]) => mockApiPost(...args),
}));

jest.mock('@/services/auth.service', () => ({
  guardarToken: (...args: unknown[]) => mockGuardarToken(...args),
}));

jest.mock('@/utils/notifications', () => ({
  syncPushToken: () => mockSyncPushToken(),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el formulario de login', () => {
    render(<LoginScreen />);

    expect(screen.getByText('Roomies')).toBeTruthy();
    expect(screen.getByText(/Gesti.n de pisos compartidos/)).toBeTruthy();
    expect(screen.getByText(/Iniciar Sesi.n/)).toBeTruthy();
  });

  it('muestra el error de API cuando falla el login', async () => {
    mockApiPost.mockRejectedValue({
      response: { data: { error: 'Credenciales invalidas.' } },
    });

    const { UNSAFE_getAllByType } = render(<LoginScreen />);
    const [emailInput, passwordInput] = UNSAFE_getAllByType(TextInput);

    fireEvent.changeText(emailInput, 'inquilino@test.com');
    fireEvent.changeText(passwordInput, 'mal');
    fireEvent.press(screen.getByText(/Iniciar Sesi.n/));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
        email: 'inquilino@test.com',
        password: 'mal',
      });
    });
    expect(mockToastShow).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Credenciales invalidas.',
    });
    expect(mockGuardarToken).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('guarda token y redirige por rol cuando el login funciona', async () => {
    mockApiPost.mockResolvedValue({
      data: { token: 'jwt', usuario: { rol: 'CASERO' } },
    });
    mockGuardarToken.mockResolvedValue(undefined);

    const { UNSAFE_getAllByType } = render(<LoginScreen />);
    const [emailInput, passwordInput] = UNSAFE_getAllByType(TextInput);

    fireEvent.changeText(emailInput, 'casero@test.com');
    fireEvent.changeText(passwordInput, 'casero123');
    fireEvent.press(screen.getByText(/Iniciar Sesi.n/));

    await waitFor(() => {
      expect(mockGuardarToken).toHaveBeenCalledWith('jwt');
    });
    expect(mockSyncPushToken).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/casero/viviendas');
  });
});
