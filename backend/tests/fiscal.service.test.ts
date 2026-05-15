import assert from 'node:assert/strict';
import { describe, test } from 'vitest';
import {
  construirDossierFiscal,
  construirFotoOcupacionFiscal,
  construirResumenFiscalAnual,
  generarBufferCsvExcel,
} from '../src/services/fiscal.service';

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

  test('construye resumen anual con totales en centimos, categorias y pendientes', () => {
    const resumen = construirResumenFiscalAnual({
      ejercicio: 2026,
      generadoEn: new Date('2026-05-01T10:00:00.000Z'),
      vivienda: {
        ...viviendaBase,
        casero: {
          id: 99,
          nombre: 'Clara',
          apellidos: 'Propietaria',
          documento_identidad: '99999999Z',
        },
      },
      deudas: [
        {
          id: 1,
          importe: 10.005,
          estado: 'PAGADA',
          justificante_url: 'https://cdn.test/justificante-1.jpg',
          deudor: inquilinoAna,
          gasto: {
            ...alquiler({ id: 101, mes: '2026-01', habitacionId: 7, inquilino: inquilinoAna, importe: 20.01 }),
            factura_url: 'https://cdn.test/factura-101.pdf',
            categoria_fiscal: 'SIN_CLASIFICAR',
            deducible_previsto: null,
            notas_fiscales: null,
          },
        },
        {
          id: 2,
          importe: 10.005,
          estado: 'PENDIENTE',
          justificante_url: null,
          deudor: inquilinoLuis,
          gasto: {
            ...alquiler({ id: 101, mes: '2026-01', habitacionId: 7, inquilino: inquilinoAna, importe: 20.01 }),
            factura_url: 'https://cdn.test/factura-101.pdf',
            categoria_fiscal: 'SIN_CLASIFICAR',
            deducible_previsto: null,
            notas_fiscales: null,
          },
        },
      ],
      gastos: [
        {
          id: 201,
          concepto: 'Seguro hogar',
          importe: 120.335,
          tipo: 'FACTURA_PUNTUAL',
          factura_url: 'https://cdn.test/seguro.pdf',
          categoria_fiscal: 'SEGUROS',
          deducible_previsto: true,
          notas_fiscales: 'Poliza anual',
          fecha_creacion: new Date('2026-02-10T00:00:00.000Z'),
          periodo_facturacion: null,
          habitacion_cargo_id: null,
          inquilino_cargo_id: null,
          prorrateo_fiscal: 75,
          inquilino_cargo: null,
        },
        {
          id: 202,
          concepto: 'Reparacion sin clasificar',
          importe: 80,
          tipo: 'FACTURA_PUNTUAL',
          factura_url: null,
          categoria_fiscal: 'SIN_CLASIFICAR',
          deducible_previsto: null,
          notas_fiscales: null,
          fecha_creacion: new Date('2026-03-10T00:00:00.000Z'),
          periodo_facturacion: null,
          habitacion_cargo_id: null,
          inquilino_cargo_id: null,
          prorrateo_fiscal: null,
          inquilino_cargo: null,
        },
      ],
    });

    assert.equal(resumen.generado_en, '2026-05-01T10:00:00.000Z');
    assert.equal(resumen.totales.ingresos.emitido, 20.02);
    assert.equal(resumen.totales.ingresos.cobrado, 10.01);
    assert.equal(resumen.totales.ingresos.pendiente, 10.01);
    assert.equal(resumen.totales.ingresos.por_tipo.ALQUILER_HABITACION, 20.02);
    assert.equal(resumen.totales.gastos.potencialmente_deducible, 200.34);
    assert.equal(resumen.totales.gastos.deducible_previsto, 120.34);
    assert.equal(resumen.totales.gastos.pendiente_clasificacion, 80);
    assert.equal(resumen.totales.gastos.con_factura, 120.34);
    assert.equal(resumen.totales.gastos.sin_factura, 80);
    assert.equal(resumen.totales.gastos.por_categoria.SEGUROS, 120.34);
    assert.equal(resumen.totales.gastos.por_categoria.SIN_CLASIFICAR, 80);
    assert.equal(resumen.lineas.length, 4);
    assert.ok(resumen.advertencias.some((advertencia) => advertencia.codigo === 'IMPORTE_PENDIENTE'));
    assert.ok(resumen.advertencias.some((advertencia) => advertencia.codigo === 'FALTA_CATEGORIA'));
    assert.ok(resumen.advertencias.some((advertencia) => advertencia.codigo === 'FALTA_FACTURA'));
    assert.ok(resumen.advertencias.some((advertencia) => advertencia.codigo === 'PRORRATEO_MANUAL'));
  });

  test('exporta dossier fiscal con secciones, columnas estables y lineas marcadas', () => {
    const resumen = construirResumenFiscalAnual({
      ejercicio: 2026,
      generadoEn: new Date('2026-05-06T08:30:00.000Z'),
      vivienda: {
        ...viviendaBase,
        casero: {
          id: 99,
          nombre: 'Clara',
          apellidos: 'Propietaria',
          documento_identidad: '99999999Z',
        },
      },
      deudas: [
        {
          id: 7,
          importe: 450,
          estado: 'PENDIENTE',
          justificante_url: null,
          deudor: inquilinoAna,
          gasto: {
            ...alquiler({ id: 101, mes: '2026-01', habitacionId: 7, inquilino: inquilinoAna, importe: 450 }),
            factura_url: 'https://cdn.test/alquiler.pdf',
            categoria_fiscal: 'SIN_CLASIFICAR',
            deducible_previsto: null,
            notas_fiscales: null,
          },
        },
      ],
      gastos: [
        {
          id: 201,
          concepto: '=Formula peligrosa',
          importe: 80,
          tipo: 'FACTURA_PUNTUAL',
          factura_url: null,
          categoria_fiscal: 'SIN_CLASIFICAR',
          deducible_previsto: null,
          notas_fiscales: null,
          fecha_creacion: new Date('2026-03-10T00:00:00.000Z'),
          periodo_facturacion: null,
          habitacion_cargo_id: null,
          inquilino_cargo_id: null,
          prorrateo_fiscal: null,
          inquilino_cargo: null,
        },
      ],
    });

    const dossier = construirDossierFiscal(resumen);

    assert.equal(dossier.nombreArchivo, 'dossier-fiscal-piso-centro-2026-2026-05-06.csv');
    assert.equal(dossier.mimeType, 'text/csv');
    assert.deepEqual(dossier.columnas.resumen, ['Clave', 'Valor', 'Moneda', 'Notas']);
    assert.ok(dossier.columnas.detalle.includes('Advertencias'));
    assert.ok(!dossier.columnas.detalle.includes('Documento inquilino'));
    assert.match(dossier.contenido, /# RESUMEN/);
    assert.match(dossier.contenido, /# DETALLE/);
    assert.match(dossier.contenido, /"revision\.lineas_problematicas";"2";"";""/);
    assert.match(dossier.contenido, /"deuda-7";"INGRESO";"Deuda";"101";"7"/);
    assert.match(dossier.contenido, /IMPORTE_PENDIENTE/);
    assert.match(dossier.contenido, /"'=Formula peligrosa"/);
    assert.doesNotMatch(dossier.contenido, /11111111A|22222222B|99999999Z/);
    assert.equal(generarBufferCsvExcel(dossier.contenido).subarray(0, 2).toString('hex'), 'fffe');
  });
});
