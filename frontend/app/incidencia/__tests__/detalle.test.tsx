import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import DetalleIncidenciaScreen from '../[id]';

const mockBack = jest.fn();
const mockApiGet = jest.fn();
const mockApiPatch = jest.fn();
const mockApiPut = jest.fn();
const mockApiDelete = jest.fn();
const mockToastShow = jest.fn();

let mockParams = { id: '7', puedeGestionar: 'true' };
const mockUseEffect = React.useEffect;

jest.mock('expo-router', () => {
  return {
    useLocalSearchParams: () => mockParams,
    useRouter: () => ({ back: mockBack }),
    useFocusEffect: (callback: () => void) => {
      mockUseEffect(() => callback(), [callback]);
    },
  };
});

jest.mock('react-native-toast-message', () => ({
  show: (...args: unknown[]) => mockToastShow(...args),
}));

jest.mock('@/services/api', () => ({
  get: (...args: unknown[]) => mockApiGet(...args),
  patch: (...args: unknown[]) => mockApiPatch(...args),
  put: (...args: unknown[]) => mockApiPut(...args),
  delete: (...args: unknown[]) => mockApiDelete(...args),
}));

const incidenciaBase = {
  id: 7,
  titulo: 'Grifo con fuga',
  descripcion: 'Pierde agua desde ayer.',
  prioridad: 'AMARILLO',
  estado: 'PENDIENTE',
  fecha_creacion: '2026-04-12T10:00:00.000Z',
  creador: { id: 11, nombre: 'Ana', apellidos: null },
  habitacion: { id: 3, nombre: 'Bano' },
};

describe('DetalleIncidenciaScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { id: '7', puedeGestionar: 'true' };
  });

  it('oculta acciones destructivas aunque el parametro de ruta venga forzado', async () => {
    mockApiGet.mockResolvedValue({
      data: {
        ...incidenciaBase,
        permisos: {
          puedeEditar: false,
          puedeEliminar: false,
          puedeCambiarEstado: false,
        },
      },
    });

    render(<DetalleIncidenciaScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Grifo con fuga/)).toBeTruthy();
    }, { timeout: 10000 });

    expect(screen.queryByText('Editar')).toBeNull();
    expect(screen.queryByText('Eliminar')).toBeNull();
    expect(screen.getByText('Pendiente')).toBeTruthy();
  });

  it('permite cambiar estado solo cuando el backend lo autoriza', async () => {
    mockApiGet.mockResolvedValue({
      data: {
        ...incidenciaBase,
        permisos: {
          puedeEditar: false,
          puedeEliminar: false,
          puedeCambiarEstado: true,
        },
      },
    });
    mockApiPatch.mockResolvedValue({});

    render(<DetalleIncidenciaScreen />);

    await screen.findByText(/Grifo con fuga/);
    fireEvent.press(screen.getByText('Resuelta'));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith('/incidencias/7/estado', {
        estado: 'RESUELTA',
      });
    });
  });
});
