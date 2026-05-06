# Contrato de datos fiscales del propietario

## Objetivo

Este contrato define los datos internos que Roomies debe preparar para convertir la actividad economica de alquiler en un resumen fiscal revisable por el casero o por su gestor. La app consolida fuentes, importes, fechas, estados y justificantes; no decide por si sola todas las casuisticas fiscales ni sustituye una revision profesional.

## Fuentes auditadas

| Modelo | Uso fiscal | Campos relevantes |
|---|---|---|
| `Vivienda` | Unidad de agrupacion fiscal y propiedad del casero. | `id`, `casero_id`, `alias_nombre`, `direccion`, `codigo_postal`, `ciudad`, `provincia` |
| `Habitacion` | Subunidad opcional para alquiler por habitacion. | `id`, `vivienda_id`, `inquilino_id`, `nombre`, `tipo`, `es_habitable`, `precio` |
| `Usuario` | Casero, inquilino, deudor, acreedor o pagador. | `id`, `nombre`, `apellidos`, `documento_identidad`, `email`, `rol` |
| `Gasto` | Documento economico emitido o registrado. | `id`, `concepto`, `importe`, `tipo`, `factura_url`, `categoria_fiscal`, `deducible_previsto`, `notas_fiscales`, `prorrateo_fiscal`, `fecha_creacion`, `periodo_facturacion`, `habitacion_cargo_id`, `inquilino_cargo_id`, `vivienda_id`, `pagador_id` |
| `GastoRecurrente` | Plantilla de cargos mensuales futuros. | `id`, `concepto`, `importe`, `tipo`, `dia_del_mes`, `vivienda_id`, `pagador_id`, `activo` |
| `Deuda` | Linea exigible/cobrada asociada a un gasto. | `id`, `gasto_id`, `deudor_id`, `acreedor_id`, `importe`, `estado`, `justificante_url` |
| `PeriodoOcupacion` | Historico explicito de alta, baja, contrato o inferencia por habitacion/inquilino. | `vivienda_id`, `habitacion_id`, `inquilino_id`, `contrato_id`, `fecha_inicio`, `fecha_fin`, `estado`, `origen`, `renta_mensual`, `requiere_revision` |
| Facturas | Soporte documental del gasto o cargo emitido. | `Gasto.factura_url` |
| Justificantes | Evidencia de pago aportada por el deudor. | `Deuda.justificante_url` |

## Ingresos fiscales

Un ingreso fiscal nace de una `Deuda` donde el acreedor es el casero propietario de la vivienda y el `Gasto.tipo` pertenece al flujo del propietario:

| Tipo `Gasto.tipo` | Tratamiento | Fuente del importe | Fecha fiscal propuesta |
|---|---|---|---|
| `ALQUILER_HABITACION` | Alquiler mensual de una habitacion concreta. | `Deuda.importe`; `Gasto.importe` solo como total emitido. | `Gasto.fecha_creacion` y `Gasto.periodo_facturacion` cuando exista. |
| `FACTURA_MENSUAL` | Cargo mensual emitido por el casero a la vivienda. | `Deuda.importe`. | `Gasto.fecha_creacion`; plantilla en `GastoRecurrente` solo informa futuras emisiones. |
| `CARGO_RECURRENTE` | Cargo recurrente no necesariamente alquiler base. | `Deuda.importe`. | `Gasto.fecha_creacion`. |
| `FACTURA_PUNTUAL` | Factura puntual emitida por el casero. | `Deuda.importe`. | `Gasto.fecha_creacion`. |

`ENTRE_COMPANEROS` queda excluido del resumen fiscal del propietario porque representa movimientos entre inquilinos, no ingresos del casero.

El resumen debe separar siempre:

- `cobrado`: suma de `Deuda.importe` con `estado = PAGADA`.
- `pendiente`: suma de `Deuda.importe` con `estado = PENDIENTE`.
- `emitido`: suma de todas las lineas incluidas, independientemente del estado.
- `anulado`: reservado para un futuro estado explicito. En el modelo actual no existe anulacion persistida; una `FACTURA_PUNTUAL` eliminada se borra en cascada con sus `Deuda[]` si no tiene pagos ni justificantes, por lo que no debe aparecer en el resumen.

No se debe mezclar caja real con facturacion emitida: los totales de caja usan solo lineas pagadas; los totales de devengo o emitido usan pagadas y pendientes por separado.

## Gastos fiscalmente deducibles

El modelo guarda metadatos fiscales del propietario en `Gasto`: categoria fiscal, deducibilidad prevista, notas internas y prorrateo opcional. Por eso, el contrato distingue entre gastos potencialmente deducibles y gastos pendientes de clasificar:

| Fuente | Tratamiento inicial |
|---|---|
| `Gasto` con `factura_url` y tipo de flujo del casero | Potencialmente deducible si la factura corresponde a un gasto soportado por el propietario, pero requiere categoria fiscal antes de exportar como deducible. |
| `Gasto` sin `factura_url` | Pendiente de documentacion; puede aparecer en revision interna, pero no debe exportarse como deducible confirmado. |
| `Gasto` con `categoria_fiscal = SIN_CLASIFICAR` | Pendiente de clasificacion aunque tenga factura. |
| `ENTRE_COMPANEROS` | Excluido del bloque fiscal del propietario salvo que una funcionalidad futura lo reclasifique explicitamente. |
| `GastoRecurrente` | No es gasto real hasta generar un `Gasto`; solo sirve para explicar origen y periodicidad. |

Cuando `categoria_fiscal = SIN_CLASIFICAR`, Roomies debe emitir estas lineas con `deducibilidad = PENDIENTE_CLASIFICACION`. Las categorias viven fuera de `concepto` para evitar inferencias por texto libre.

## DTOs internos propuestos

```ts
type FiscalEstadoPago = 'COBRADO' | 'PENDIENTE' | 'ANULADO';
type FiscalNaturaleza = 'INGRESO' | 'GASTO_POTENCIALMENTE_DEDUCIBLE';
type FiscalDeducibilidad = 'NO_APLICA' | 'PENDIENTE_CLASIFICACION' | 'DEDUCIBLE' | 'NO_DEDUCIBLE';

type FiscalCategoriaIngreso =
  | 'ALQUILER_HABITACION'
  | 'FACTURA_MENSUAL'
  | 'CARGO_RECURRENTE'
  | 'FACTURA_PUNTUAL';

type FiscalCategoriaGasto =
  | 'FINANCIACION_INTERESES'
  | 'CONSERVACION_REPARACION'
  | 'COMUNIDAD'
  | 'IBI_TASAS'
  | 'SEGUROS'
  | 'SUMINISTROS'
  | 'SERVICIOS_PROFESIONALES'
  | 'LIMPIEZA'
  | 'MOBILIARIO_ENSERES'
  | 'AMORTIZACION'
  | 'OTROS'
  | 'SIN_CLASIFICAR';

type FiscalLineaDTO = {
  id: string;
  naturaleza: FiscalNaturaleza;
  fuente: {
    modelo: 'Gasto' | 'Deuda';
    gastoId: number;
    deudaId?: number;
    gastoRecurrenteId?: number;
  };
  vivienda: {
    id: number;
    aliasNombre: string;
    direccion: string;
    codigoPostal: string;
    ciudad: string;
    provincia: string;
  };
  habitacion?: {
    id: number;
    nombre: string;
  };
  inquilino?: {
    id: number;
    nombre: string;
    apellidos?: string | null;
    documentoIdentidad?: string | null;
  };
  casero: {
    id: number;
    nombre: string;
    apellidos?: string | null;
    documentoIdentidad?: string | null;
  };
  concepto: string;
  categoria: FiscalCategoriaIngreso | FiscalCategoriaGasto | 'PENDIENTE_CLASIFICACION';
  deducibilidad: FiscalDeducibilidad;
  importe: number;
  moneda: 'EUR';
  fecha: string;
  periodoFacturacion?: string | null;
  estadoPago: FiscalEstadoPago;
  facturaUrl?: string | null;
  justificanteUrl?: string | null;
};

type FiscalResumenViviendaDTO = {
  ejercicio: number;
  viviendaId: number;
  ingresos: {
    emitido: number;
    cobrado: number;
    pendiente: number;
    anulado: number;
  };
  gastos: {
    potencialmenteDeducible: number;
    pendienteClasificacion: number;
    conFactura: number;
    sinFactura: number;
  };
  lineas: FiscalLineaDTO[];
};

type FiscalResumenPropietarioDTO = {
  ejercicio: number;
  caseroId: number;
  generadoEn: string;
  viviendas: FiscalResumenViviendaDTO[];
  totales: {
    ingresosEmitidos: number;
    ingresosCobrados: number;
    ingresosPendientes: number;
    gastosPendientesClasificacion: number;
  };
  limitesFuncionales: string[];
};
```

## Reglas de construccion

- La consulta base debe partir de `Vivienda.casero_id` y limitar los datos a viviendas del casero autenticado.
- Para ingresos, la linea fiscal principal debe partir de `Deuda`, no solo de `Gasto`, porque el estado cobrado/pendiente vive en `Deuda.estado` y el importe puede estar repartido por inquilino.
- `Gasto.importe` se usa como importe emitido agregado del documento; `Deuda.importe` se usa para imputacion por inquilino y estado de cobro.
- `Habitacion` e `inquilino` son opcionales excepto en `ALQUILER_HABITACION`, donde deben recuperarse desde `habitacion_cargo_id` e `inquilino_cargo_id` si siguen disponibles.
- Para ocupacion y prorrateo, `PeriodoOcupacion` es la fuente preferente. Los contratos firmados y cargos `ALQUILER_HABITACION` quedan como respaldo cuando una habitacion aun no tiene historico explicito.
- Los periodos con origen `INFERIDO_CARGO_ALQUILER` o `MIGRADO` deben conservar `requiere_revision` hasta que el casero o un flujo contractual confirme las fechas reales.
- `factura_url` documenta el soporte del cargo o gasto; `justificante_url` documenta el pago de una deuda concreta.
- Los importes deben sumarse en centimos y exponerse normalizados a euros para evitar descuadres por `Float`.
- Las lineas sin factura o sin categoria fiscal futura deben aparecer como pendientes de revision, no como deducibles confirmados.

## Limites funcionales

- Roomies prepara datos fiscales, pero no determina automaticamente si un gasto es deducible segun normativa, porcentaje de afectacion, uso mixto, prorratas o criterio del gestor.
- El modelo actual no conserva historico de anulaciones ni borrados duros de facturas puntuales sin actividad; para auditoria fiscal completa haria falta soft delete o un libro de eventos.
- `GastoRecurrente` no representa un hecho economico hasta generar un `Gasto`.
- La ausencia de `documento_identidad` en usuarios no bloquea el contrato, pero debe marcarse como dato incompleto en exportaciones fiscales.
- Las categorias fiscales futuras no deben inferirse desde `concepto` ni desde nombres de vivienda/habitacion.
