import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import CaseroTabsLayout from '../casero/(tabs)/_layout';
import InquilinoTabsLayout from '../inquilino/(tabs)/_layout';
import ViviendaTabsLayout from '../casero/vivienda/[id]/(tabs)/_layout';

const mockApiGet = jest.fn();
const mockBack = jest.fn();
const mockCreateElement = React.createElement;
const mockFragment = React.Fragment;
const mockUseEffect = React.useEffect;
const mockScreens: { name: string; options: Record<string, unknown> }[] = [];

jest.mock('expo-router', () => {
  function MockTabs({ children }: { children: React.ReactNode }) {
    return mockCreateElement(mockFragment, null, children);
  }

  MockTabs.Screen = function MockTabsScreen({
    name,
    options,
  }: {
    name: string;
    options: Record<string, unknown>;
  }) {
    mockScreens.push({ name, options });
    return null;
  };

  return {
    Tabs: MockTabs,
    useRouter: () => ({ back: mockBack }),
    usePathname: () => '/casero/vivienda/42/limpieza',
    useLocalSearchParams: () => ({ id: '42' }),
    useFocusEffect: (callback: () => void | (() => void)) => {
      mockUseEffect(() => callback(), [callback]);
    },
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: function MockIonicons() {
    return null;
  },
}));

jest.mock('@/services/api', () => ({
  get: (...args: unknown[]) => mockApiGet(...args),
}));

function ultimaScreen(nombre: string) {
  const screen = [...mockScreens].reverse().find((item) => item.name === nombre);
  if (!screen) {
    throw new Error(`No se renderizo la tab ${nombre}`);
  }

  return screen;
}

describe('smoke navegacion principal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScreens.length = 0;
  });

  it('renderiza tabs del casero y oculta modulos sin viviendas activas', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: [{ mod_gastos: true, mod_inventario: false }],
    });

    render(<CaseroTabsLayout />);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/viviendas');
    });
    expect(ultimaScreen('viviendas').options.title).toBe('Viviendas');
    expect(ultimaScreen('cobros').options.href).toBeUndefined();
    expect(ultimaScreen('inventario').options.href).toBeNull();
    expect(ultimaScreen('tablon').options.href).toBeNull();
    expect(ultimaScreen('perfil').options.title).toBe('Perfil');
  });

  it('renderiza tabs del inquilino segun modulos de su vivienda', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        vivienda: {
          mod_limpieza: true,
          mod_gastos: true,
          mod_inventario: false,
        },
      },
    });

    render(<InquilinoTabsLayout />);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/inquilino/vivienda');
    });
    expect(ultimaScreen('inicio').options.title).toBe('Vivienda');
    expect(ultimaScreen('tablon').options.href).toBeUndefined();
    expect(ultimaScreen('limpieza').options.href).toBeUndefined();
    expect(ultimaScreen('gastos').options.href).toBeUndefined();
    expect(ultimaScreen('inventario').options.href).toBeNull();
    expect(ultimaScreen('perfil').options.title).toBe('Perfil');
  });

  it('renderiza tabs internos de vivienda usando el id estable de la ruta', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        mod_limpieza: false,
        mod_gastos: true,
        mod_inventario: true,
      },
    });

    render(<ViviendaTabsLayout />);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/viviendas/42');
    });
    expect(ultimaScreen('index').options.title).toBe('Resumen');
    expect(ultimaScreen('incidencias').options.title).toBe('Incidencias');
    expect(ultimaScreen('tablon').options.title).toBe('Tablón');
    expect(ultimaScreen('limpieza').options.href).toBeNull();
    expect(ultimaScreen('opciones').options.title).toBe('Opciones');
  });
});
