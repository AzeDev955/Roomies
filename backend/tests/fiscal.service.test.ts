import assert from 'node:assert/strict';
import { describe, test } from 'vitest';
import { construirFotoOcupacionFiscal } from '../src/services/fiscal.service';

const viviendaBase = {
  id: 1,
  alias_nombre: 'Piso Centro',
  direccion: 'Calle Luna 1',
  codigo_postal: '28001',
  ciudad: 'Madrid',
  provincia: 'Madrid',
};

const inquilinoAna = {
  id: 10,
  nombre: 'Ana',
  apellidos: 'Lopez',
  documento_identidad: '11111111A',
};

const inquilinoLuis = {
  id: 11,
  nombre: 'Luis',
  apellidos: 'Garcia',
  documento_identidad: '22222222B',
};

const habitacionAzul = {
  id: 7,
  nombre: 'Habitacion azul',
  tipo: 'DORMITORIO',
  es_habitable: true,
  precio: 450,
  inquilino_id: null,
  inquilino: null,
};

const habitacionVerde = {
  id: 8,
  nombre: 'Habitacion verde',
  tipo: 'DORMITORIO',
  es_habitable: true,
  precio: 400,
  inquilino_id: null,
  inquilino: null,
};

const alquiler = ({
  id,
  mes,
  habitacionId,
  inquilino,
  importe = 450,
}: {
  id: number;
  mes: string;
  habitacionId: number;
  inquilino: typeof inquilinoAna;
  importe?: number;
}) => ({
  id,
  concepto: `Alquiler ${mes}`,
  importe,
  tipo: 'ALQUILER_HABITACION',
  fecha_creacion: new Date(`${mes}-01T00:00:00.000Z`),
  periodo_facturacion: mes,
  habitacion_cargo_id: habitacionId,
  inquilino_cargo_id: inquilino.id,
  prorrateo_fiscal: null,
  inquilino_cargo: inquilino,
});

describe('fiscal.service', () => {
  test('calcula una foto anual con cambio de inquilino en la misma habitacion', () => {
    const foto = construirFotoOcupacionFiscal({
      ejercicio: 2026,
      vivienda: {
        ...viviendaBase,
        habitaciones: [habitacionAzul],
      },
      gastos: [
        alquiler({ id: 1, mes: '2026-01', habitacionId: 7, inquilino: inquilinoAna }),
        alquiler({ id: 2, mes: '2026-02', habitacionId: 7, inquilino: inquilinoAna }),
        alquiler({ id: 3, mes: '2026-03', habitacionId: 7, inquilino: inquilinoLuis }),
      ],
    });

    assert.equal(foto.resumen.estado, 'PARCIAL');
    assert.equal(foto.resumen.dias_alquilados, 90);
    assert.equal(foto.habitaciones[0].periodos.length, 3);
    assert.deepEqual(
      foto.habitaciones[0].periodos.map((periodo) => periodo.inquilino?.id),
      [10, 10, 11],
    );
    assert.equal(foto.habitaciones[0].requiere_revision, false);
  });

  test('distingue habitaciones vacias y viviendas sin actividad', () => {
    const foto = construirFotoOcupacionFiscal({
      ejercicio: 2026,
      vivienda: {
        ...viviendaBase,
        habitaciones: [habitacionAzul, habitacionVerde],
      },
      gastos: [],
    });

    assert.equal(foto.resumen.estado, 'SIN_ACTIVIDAD');
    assert.equal(foto.resumen.habitaciones_con_actividad, 0);
    assert.equal(foto.resumen.requiere_revision, false);
    assert.deepEqual(
      foto.habitaciones.map((habitacion) => habitacion.estado),
      ['SIN_ACTIVIDAD', 'SIN_ACTIVIDAD'],
    );
  });

  test('calcula periodos parciales y prorrateos por ocupacion o porcentaje manual', () => {
    const foto = construirFotoOcupacionFiscal({
      ejercicio: 2026,
      vivienda: {
        ...viviendaBase,
        habitaciones: [habitacionAzul],
      },
      gastos: [
        alquiler({ id: 1, mes: '2026-01', habitacionId: 7, inquilino: inquilinoAna }),
        alquiler({ id: 2, mes: '2026-02', habitacionId: 7, inquilino: inquilinoAna }),
        {
          id: 20,
          concepto: 'Seguro hogar',
          importe: 120,
          tipo: 'FACTURA_PUNTUAL',
          fecha_creacion: new Date('2026-02-10T00:00:00.000Z'),
          periodo_facturacion: null,
          habitacion_cargo_id: null,
          inquilino_cargo_id: null,
          prorrateo_fiscal: null,
          inquilino_cargo: null,
        },
        {
          id: 21,
          concepto: 'IBI',
          importe: 300,
          tipo: 'FACTURA_PUNTUAL',
          fecha_creacion: new Date('2026-03-10T00:00:00.000Z'),
          periodo_facturacion: null,
          habitacion_cargo_id: null,
          inquilino_cargo_id: null,
          prorrateo_fiscal: 25,
          inquilino_cargo: null,
        },
      ],
    });

    assert.equal(foto.habitaciones[0].dias_alquilados, 59);
    assert.equal(foto.habitaciones[0].meses_equivalentes, 1.94);
    assert.equal(foto.resumen.porcentaje_ocupacion, 16.1644);
    assert.deepEqual(foto.gastos_prorrateados, [
      {
        id: 20,
        concepto: 'Seguro hogar',
        importe: 120,
        tipo: 'FACTURA_PUNTUAL',
        fecha: '2026-02-10',
        prorrateo: {
          modo: 'OCUPACION',
          porcentaje: 16.1644,
          importe_prorrateado: 19.4,
        },
      },
      {
        id: 21,
        concepto: 'IBI',
        importe: 300,
        tipo: 'FACTURA_PUNTUAL',
        fecha: '2026-03-10',
        prorrateo: {
          modo: 'MANUAL',
          porcentaje: 25,
          importe_prorrateado: 75,
        },
      },
    ]);
  });
});
