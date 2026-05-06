import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import CaseroFiscalScreen from '../casero/(tabs)/fiscal';

const mockApiGet = jest.fn();
const mockApiPatch = jest.fn();
const mockToastShow = jest.fn();
const mockUseEffect = React.useEffect;

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    mockUseEffect(() => callback(), [callback]);
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: function MockIonicons() {
    return null;
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///tmp/',
  EncodingType: { Base64: 'base64' },
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn(),
    createFileAsync: jest.fn(),
  },
  writeAsStringAsync: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  show: (...args: unknown[]) => mockToastShow(...args),
}));

jest.mock('@/services/api', () => ({
  get: (...args: unknown[]) => mockApiGet(...args),
  patch: (...args: unknown[]) => mockApiPatch(...args),
}));

jest.mock('@/contexts/ThemeContext', () => {
  const { DefaultAppTheme } = jest.requireActual('@/constants/theme');
  return {
    useAppTheme: () => ({ theme: DefaultAppTheme }),
  };
});

const vivienda = {
  id: 7,
  alias_nombre: 'Piso Centro',
  direccion: 'Calle Mayor 1',
  mod_gastos: true,
};

const resumen = {
  ejercicio: 2026,
  generado_en: '2026-05-06T10:00:00.000Z',
  vivienda: {
    id: 7,
    alias_nombre: 'Piso Centro',
    direccion: 'Calle Mayor 1',
    codigo_postal: '28001',
    ciudad: 'Madrid',
    provincia: 'Madrid',
  },
  totales: {
    ingresos: {
      emitido: 900,
      cobrado: 700,
      pendiente: 200,
      anulado: 0,
      por_tipo: {},
    },
    gastos: {
      potencialmente_deducible: 120,
      deducible_previsto: 0,
      no_deducible_previsto: 0,
      pendiente_clasificacion: 120,
      con_factura: 0,
      sin_factura: 120,
      por_categoria: {},
    },
  },
  lineas: [
    {
      id: 'gasto-11',
      naturaleza: 'GASTO_POTENCIALMENTE_DEDUCIBLE',
      fuente: { modelo: 'Gasto', gasto_id: 11 },
      concepto: 'Seguro hogar',
      categoria: 'PENDIENTE_CLASIFICACION',
      deducibilidad: 'PENDIENTE_CLASIFICACION',
      importe: 120,
      moneda: 'EUR',
      fecha: '2026-02-01',
      periodo_facturacion: null,
      estado_pago: 'COBRADO',
      factura_url: null,
      metadata_fiscal: {
        categoria_fiscal: 'SIN_CLASIFICAR',
        deducible_previsto: null,
        notas_fiscales: 'Pendiente gestor',
        prorrateo_fiscal: 75,
      },
      advertencias: [{ codigo: 'FALTA_FACTURA', mensaje: 'Falta factura.' }],
    },
  ],
  advertencias: [{ codigo: 'FALTA_FACTURA', mensaje: 'Falta factura.' }],
};

const ocupacion = {
  ejercicio: 2026,
  resumen: {
    dias_alquilados: 180,
    meses_equivalentes: 6,
    porcentaje_ocupacion: 49.31,
    estado: 'PARCIAL',
    habitaciones_con_actividad: 1,
    habitaciones_requieren_revision: 0,
    requiere_revision: false,
  },
  habitaciones: [
    {
      id: 1,
      nombre: 'Habitacion A',
      tipo: 'DORMITORIO',
      es_habitable: true,
      precio: 450,
      dias_alquilados: 180,
      meses_equivalentes: 6,
      porcentaje_ocupacion: 49.31,
      estado: 'PARCIAL',
      requiere_revision: false,
      revisiones: [],
    },
  ],
  gastos_prorrateados: [],
};

describe('CaseroFiscalScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockImplementation((url: string) => {
      if (url === '/viviendas') return Promise.resolve({ data: [vivienda] });
      if (url === '/viviendas/7/fiscal/2026') return Promise.resolve({ data: resumen });
      if (url === '/viviendas/7/fiscal/ocupacion') return Promise.resolve({ data: ocupacion });
      return Promise.reject(new Error(`URL inesperada: ${url}`));
    });
  });

  it('renderiza resumen fiscal, ocupacion y lineas revisables', async () => {
    render(<CaseroFiscalScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Preparacion fiscal/)).toBeTruthy();
      expect(screen.getAllByText('Piso Centro').length).toBeGreaterThan(0);
      expect(screen.getByText('Gastos a clasificar')).toBeTruthy();
      expect(screen.getByText('Seguro hogar')).toBeTruthy();
      expect(screen.getByText('Ocupacion y prorrateos')).toBeTruthy();
    });
  });

  it('prepara la actualizacion de metadatos fiscales y recarga el resumen', async () => {
    mockApiPatch.mockResolvedValueOnce({ data: { id: 11 } });

    render(<CaseroFiscalScreen />);

    await screen.findByText('Seguro hogar');
    fireEvent.press(screen.getByText('Clasificar'));
    await screen.findByText('Revisar gasto');
    fireEvent.press(screen.getByText('Seguros'));
    fireEvent.press(screen.getByText('Preparar como deducible'));
    fireEvent.press(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith('/viviendas/7/gastos/11', {
        categoria_fiscal: 'SEGUROS',
        deducible_previsto: true,
        notas_fiscales: 'Pendiente gestor',
        prorrateo_fiscal: 75,
      });
    });
  });
});
