import assert from 'node:assert/strict';
import { describe, test, vi } from 'vitest';
import {
  inferirPeriodosOcupacionDesdeCargos,
  ORIGENES_PERIODO_OCUPACION,
  registrarAltaOcupacion,
  registrarBajaOcupacion,
  registrarPeriodoContratoFirmado,
} from '../src/services/ocupacion.service';
import { construirFotoOcupacionFiscal } from '../src/services/fiscal.service';

vi.mock('../src/lib/prisma', () => ({ prisma: {} }));

const inquilinoAna = { id: 10, nombre: 'Ana', apellidos: 'Lopez' };
const inquilinoLuis = { id: 11, nombre: 'Luis', apellidos: 'Garcia' };

const viviendaBase = {
  id: 1,
  alias_nombre: 'Piso Centro',
  direccion: 'Calle Luna 1',
  codigo_postal: '28001',
  ciudad: 'Madrid',
  provincia: 'Madrid',
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

const crearTxPeriodos = () => {
  const periodos: any[] = [];
  const coincide = (periodo: any, where: Record<string, any>) =>
    Object.entries(where).every(([clave, valor]) => {
      if (valor && typeof valor === 'object' && 'not' in valor) return periodo[clave] !== valor.not;
      return periodo[clave] === valor;
    });

  return {
    periodos,
    periodoOcupacion: {
      findFirst: async ({ where }: any) => periodos.find((periodo) => coincide(periodo, where)) ?? null,
      updateMany: async ({ where, data }: any) => {
        let count = 0;
        for (const periodo of periodos) {
          if (coincide(periodo, where)) {
            Object.assign(periodo, data);
            count += 1;
          }
        }
        return { count };
      },
      create: async ({ data }: any) => {
        const creado = { id: periodos.length + 1, ...data };
        periodos.push(creado);
        return creado;
      },
      update: async ({ where, data }: any) => {
        const periodo = periodos.find((item) => item.id === where.id);
        Object.assign(periodo, data);
        return periodo;
      },
    },
  };
};

describe('issue 338 - historico explicito de ocupacion', () => {
  test('registra alta, baja y cambio de habitacion cerrando el periodo anterior', async () => {
    const tx = crearTxPeriodos();

    await registrarAltaOcupacion(tx as any, {
      viviendaId: 1,
      habitacionId: 7,
      inquilinoId: 10,
      fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
      rentaMensual: 450,
    });
    await registrarAltaOcupacion(tx as any, {
      viviendaId: 1,
      habitacionId: 8,
      inquilinoId: 10,
      fechaInicio: new Date('2026-03-01T00:00:00.000Z'),
      rentaMensual: 500,
    });
    await registrarBajaOcupacion(tx as any, {
      viviendaId: 1,
      habitacionId: 8,
      inquilinoId: 10,
      fechaFin: new Date('2026-05-01T00:00:00.000Z'),
    });

    assert.equal(tx.periodos.length, 2);
    assert.equal(tx.periodos[0].habitacion_id, 7);
    assert.equal(tx.periodos[0].estado, 'FINALIZADO');
    assert.equal(tx.periodos[0].fecha_fin.toISOString(), '2026-03-01T00:00:00.000Z');
    assert.equal(tx.periodos[1].habitacion_id, 8);
    assert.equal(tx.periodos[1].estado, 'FINALIZADO');
    assert.equal(tx.periodos[1].fecha_fin.toISOString(), '2026-05-01T00:00:00.000Z');
  });

  test('conserva trazabilidad al reocupar una habitacion con otro inquilino', async () => {
    const tx = crearTxPeriodos();

    await registrarAltaOcupacion(tx as any, {
      viviendaId: 1,
      habitacionId: 7,
      inquilinoId: 10,
      fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
    });
    await registrarAltaOcupacion(tx as any, {
      viviendaId: 1,
      habitacionId: 7,
      inquilinoId: 11,
      fechaInicio: new Date('2026-02-01T00:00:00.000Z'),
    });

    assert.equal(tx.periodos.length, 2);
    assert.deepEqual(
      tx.periodos.map((periodo) => [periodo.inquilino_id, periodo.estado]),
      [
        [10, 'FINALIZADO'],
        [11, 'ACTIVO'],
      ],
    );
  });

  test('el contrato firmado alimenta el historico reutilizable por fiscalidad', async () => {
    const tx = crearTxPeriodos();

    await registrarPeriodoContratoFirmado(tx as any, {
      id: 99,
      vivienda_id: 1,
      habitacion_id: 7,
      inquilino_id: 10,
      fecha_inicio: new Date('2026-01-15T00:00:00.000Z'),
      fecha_fin: new Date('2026-04-01T00:00:00.000Z'),
      renta_mensual: 450,
    });

    assert.equal(tx.periodos[0].contrato_id, 99);
    assert.equal(tx.periodos[0].origen, ORIGENES_PERIODO_OCUPACION.CONTRATO_FIRMADO);
    assert.equal(tx.periodos[0].estado, 'FINALIZADO');
  });

  test('la firma de contrato actualiza una alta manual abierta sin duplicar periodos', async () => {
    const tx = crearTxPeriodos();

    await registrarAltaOcupacion(tx as any, {
      viviendaId: 1,
      habitacionId: 7,
      inquilinoId: 10,
      fechaInicio: new Date('2026-01-20T00:00:00.000Z'),
      rentaMensual: 430,
    });
    await registrarPeriodoContratoFirmado(tx as any, {
      id: 99,
      vivienda_id: 1,
      habitacion_id: 7,
      inquilino_id: 10,
      fecha_inicio: new Date('2026-01-01T00:00:00.000Z'),
      fecha_fin: null,
      renta_mensual: 450,
    });

    assert.equal(tx.periodos.length, 1);
    assert.equal(tx.periodos[0].contrato_id, 99);
    assert.equal(tx.periodos[0].origen, ORIGENES_PERIODO_OCUPACION.CONTRATO_FIRMADO);
    assert.equal(tx.periodos[0].fecha_inicio.toISOString(), '2026-01-01T00:00:00.000Z');
    assert.equal(tx.periodos[0].renta_mensual, 450);
  });

  test('infiere tramos heredados desde cargos de alquiler y los marca revisables', () => {
    const periodos = inferirPeriodosOcupacionDesdeCargos([
      {
        id: 1,
        vivienda_id: 1,
        habitacion_cargo_id: 7,
        inquilino_cargo_id: 10,
        importe: 450,
        periodo_facturacion: '2026-01',
      },
      {
        id: 2,
        vivienda_id: 1,
        habitacion_cargo_id: 7,
        inquilino_cargo_id: 10,
        importe: 450,
        periodo_facturacion: '2026-02',
      },
      {
        id: 3,
        vivienda_id: 1,
        habitacion_cargo_id: 7,
        inquilino_cargo_id: 11,
        importe: 470,
        periodo_facturacion: '2026-04',
      },
    ]);

    assert.equal(periodos.length, 2);
    assert.equal(periodos[0].fecha_inicio.toISOString(), '2026-01-01T00:00:00.000Z');
    assert.equal(periodos[0].fecha_fin.toISOString(), '2026-03-01T00:00:00.000Z');
    assert.deepEqual(periodos[0].gasto_ids, [1, 2]);
    assert.equal(periodos[0].requiere_revision, true);
    assert.equal(periodos[1].inquilino_id, 11);
  });

  test('fiscalidad usa periodos explicitos antes que cargos y contratos auxiliares', () => {
    const foto = construirFotoOcupacionFiscal({
      ejercicio: 2026,
      vivienda: { ...viviendaBase, habitaciones: [habitacionAzul] },
      gastos: [
        {
          id: 1,
          concepto: 'Alquiler enero',
          importe: 450,
          tipo: 'ALQUILER_HABITACION',
          fecha_creacion: new Date('2026-01-01T00:00:00.000Z'),
          periodo_facturacion: '2026-01',
          habitacion_cargo_id: 7,
          inquilino_cargo_id: 10,
          prorrateo_fiscal: null,
          inquilino_cargo: inquilinoAna,
        },
      ],
      contratos: [
        {
          id: 50,
          version: 1,
          estado: 'FIRMADO',
          documento_hash: 'a'.repeat(64),
          renta_mensual: 450,
          fecha_inicio: new Date('2026-02-01T00:00:00.000Z'),
          fecha_fin: new Date('2026-03-01T00:00:00.000Z'),
          habitacion_id: 7,
          inquilino_id: 10,
          inquilino: inquilinoAna,
        },
      ],
      periodosOcupacion: [
        {
          id: 70,
          estado: 'ACTIVO',
          origen: 'ALTA_MANUAL',
          fecha_inicio: new Date('2026-01-15T00:00:00.000Z'),
          fecha_fin: new Date('2026-04-01T00:00:00.000Z'),
          habitacion_id: 7,
          inquilino_id: 10,
          contrato_id: null,
          renta_mensual: 450,
          requiere_revision: false,
          inquilino: inquilinoAna,
        },
      ],
    });

    assert.equal(foto.habitaciones[0].periodos.length, 1);
    assert.equal(foto.habitaciones[0].periodos[0].fuente, 'PERIODO_OCUPACION');
    assert.equal(foto.habitaciones[0].periodos[0].periodo_ocupacion_id, 70);
    assert.equal(foto.habitaciones[0].periodos[0].dias, 76);
    assert.equal(foto.habitaciones[0].periodos[0].inquilino?.id, inquilinoAna.id);
  });
});
