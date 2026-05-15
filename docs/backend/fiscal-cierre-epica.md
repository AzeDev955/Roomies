# Cierre de epica fiscal

## Objetivo

Este documento deja una foto de cierre de la epica fiscal. Roomies prepara datos de alquiler, ocupacion, contratos, cobros, facturas y justificantes para que el casero pueda revisarlos o compartirlos con su gestoria. La app no sustituye asesoramiento fiscal, no interpreta normativa oficial en tiempo real y no convierte la firma interna en firma electronica avanzada o cualificada.

## Flujo extremo a extremo

1. El casero mantiene una vivienda con `mod_gastos = true`, habitaciones habitables, inquilinos activos y, si aplica, contratos subidos o firmados.
2. Los gastos y cobros se registran como `Gasto`, `Deuda`, `GastoRecurrente`, facturas originales y justificantes de pago.
3. Los metadatos fiscales privados del propietario viven en `Gasto`: `categoria_fiscal`, `deducible_previsto`, `notas_fiscales` y `prorrateo_fiscal`.
4. El historico de ocupacion se construye preferentemente con `PeriodoOcupacion`; los contratos firmados y los cargos `ALQUILER_HABITACION` quedan como respaldo heredado.
5. La pantalla `/casero/fiscal` permite seleccionar vivienda y ejercicio, revisar resumen, ocupacion, avisos, lineas fiscales y editar metadatos de gastos.
6. El casero exporta el dossier anual desde `GET /api/viviendas/:viviendaId/fiscal/:ejercicio/dossier`; el frontend usa `formato=base64` para guardar el CSV desde movil.
7. El CSV resultante se revisa fuera de Roomies con gestor o asesor fiscal antes de presentarlo o usarlo como soporte declarativo.

## Contrato de exportacion del dossier

Endpoint: `GET /api/viviendas/:viviendaId/fiscal/:ejercicio/dossier`

Permisos:

- Solo `CASERO` propietario de la vivienda.
- Requiere autenticacion Bearer.
- Requiere `mod_gastos` activo en la vivienda.
- Rechaza viviendas ajenas y usuarios `INQUILINO`.

Formatos:

| Formato | Respuesta | Uso |
|---|---|---|
| Sin query | `text/csv; charset=utf-8` con `Content-Disposition` | Descarga directa desde cliente web o API. |
| `?formato=base64` | JSON `{ nombreArchivo, mimeType, columnas, contenidoBase64 }` | Escritura movil desde Expo/FileSystem. |

Nombre de archivo: `dossier-fiscal-{vivienda}-{ejercicio}-{fecha-generacion}.csv`.

Columnas estables:

| Seccion | Columnas |
|---|---|
| `RESUMEN` | `Clave`, `Valor`, `Moneda`, `Notas` |
| `DETALLE` | `Linea ID`, `Naturaleza`, `Modelo origen`, `Gasto ID`, `Deuda ID`, `Concepto`, `Categoria`, `Deducibilidad`, `Importe`, `Moneda`, `Fecha`, `Periodo facturacion`, `Estado pago`, `Factura URL`, `Justificante URL`, `Habitacion ID`, `Habitacion`, `Inquilino ID`, `Inquilino`, `Advertencias` |

Minimizacion de datos:

- No exporta documento de identidad, email ni telefono de inquilinos.
- Conserva `Inquilino ID` y nombre para trazabilidad operativa de cobros.
- Incluye URLs de factura y justificante como referencias documentales; no duplica binarios dentro del CSV.
- Escapa contenido para evitar formula injection al abrir el CSV en hojas de calculo.

Advertencias posibles:

| Codigo | Significado | Accion manual esperada |
|---|---|---|
| `FALTA_FACTURA` | La linea no tiene soporte documental adjunto. | Adjuntar factura o marcarla como no deducible segun criterio profesional. |
| `FALTA_CATEGORIA` | `categoria_fiscal = SIN_CLASIFICAR`. | Clasificar el gasto antes de cerrar el dossier. |
| `IMPORTE_PENDIENTE` | Hay cobros pendientes. | Verificar si se declara por caja, devengo o criterio aplicable con asesor. |
| `PERIODO_INCOMPLETO` | Falta informacion de periodo/ocupacion. | Revisar historico de alta/baja, contrato o cargo mensual. |
| `PRORRATEO_MANUAL` | El propietario fijo un porcentaje manual. | Confirmar que el porcentaje responde al criterio fiscal correcto. |

## Pantalla fiscal de casero

Ruta frontend: `frontend/app/casero/(tabs)/fiscal.tsx`

Visibilidad:

- Solo existe en tabs de casero.
- El layout global de casero la muestra cuando al menos una vivienda tiene `mod_gastos` activo.
- No hay tab fiscal para inquilino.

Estados principales:

| Estado | Comportamiento |
|---|---|
| Sin viviendas activas | Muestra estado vacio y pide crear vivienda o activar gastos. |
| Cargando | Carga viviendas, resumen anual y ocupacion. |
| Error | Muestra mensaje del backend o error generico de modo fiscal. |
| Con datos | Permite cambiar vivienda/ejercicio, revisar KPIs, ocupacion, advertencias, ingresos, gastos y exportar. |
| Editando linea | Abre modal para categoria, deducibilidad prevista, notas y prorrateo manual. |

Endpoints consumidos:

| Accion | Endpoint |
|---|---|
| Listar viviendas del casero | `GET /api/viviendas` |
| Cargar resumen fiscal | `GET /api/viviendas/:viviendaId/fiscal/:ejercicio` |
| Cargar ocupacion fiscal | `GET /api/viviendas/:viviendaId/fiscal/ocupacion?ejercicio=YYYY` |
| Actualizar metadatos de gasto | `PATCH /api/viviendas/:viviendaId/gastos/:gastoId` |
| Exportar CSV movil | `GET /api/viviendas/:viviendaId/fiscal/:ejercicio/dossier?formato=base64` |

## Checklist manual reproducible

Preparacion de datos:

- Crear una vivienda de casero con `mod_gastos = true`, tres dormitorios habitables y al menos dos inquilinos.
- Configurar precios privados por habitacion.
- Registrar un contrato pendiente y firmarlo con un inquilino.
- Unir un segundo inquilino sin contrato firmado para conservar contraste de fuentes.
- Generar o registrar al menos un periodo parcial de ocupacion con alta/baja o cambio de habitacion.

Cobros e ingresos:

- Crear una mensualidad recurrente y verificar que el cron o seed genera cargos del ejercicio.
- Crear una factura puntual con factura adjunta.
- Crear una factura puntual sin factura adjunta.
- Marcar una deuda como `PAGADA` con justificante.
- Dejar otra deuda como `PENDIENTE`.

Gastos y revision fiscal:

- Clasificar un gasto como `SEGUROS` o `SUMINISTROS`.
- Dejar un gasto como `SIN_CLASIFICAR`.
- Editar una linea con `prorrateo_fiscal` manual.
- Verificar que el inquilino no ve `categoria_fiscal`, `deducible_previsto`, `notas_fiscales` ni `prorrateo_fiscal` en su pantalla de gastos.

Modo fiscal:

- Abrir `/casero/fiscal`.
- Cambiar vivienda y ejercicio.
- Confirmar que el resumen separa ingresos emitidos, cobrados, pendientes y gastos por categoria.
- Confirmar que la ocupacion muestra vivienda, habitaciones, periodos, porcentaje anual y avisos de revision.
- Abrir el editor de linea fiscal, guardar categoria/notas/prorrateo y recargar.
- Exportar CSV y abrirlo en Excel/LibreOffice comprobando acentos, columnas y advertencias.

Permisos y errores:

- Entrar como inquilino y confirmar que no existe tab fiscal.
- Llamar a endpoints fiscales como inquilino y esperar `403`.
- Desactivar `mod_gastos` en la vivienda y confirmar que endpoints y tabs protegidos quedan bloqueados u ocultos.
- Intentar consultar una vivienda ajena con un casero diferente y esperar `403` o `404` segun endpoint.

## Matriz de cierre

| Issue | Estado | Archivos principales | Tests documentados |
|---|---|---|---|
| #323 contrato de datos | Cerrado documental | `docs/backend/contrato-fiscal-propietario.md`, `backend/prisma/schema.prisma`, `backend/src/services/gasto.service.ts`, `backend/src/controllers/cobros.controller.ts` | Revision documental contra modelos y servicios existentes. |
| #324 metadatos fiscales | Entregado | `backend/prisma/schema.prisma`, `backend/src/services/gasto.service.ts`, `backend/src/controllers/gasto.controller.ts`, `backend/src/controllers/cobros.controller.ts` | `backend/tests/economico.test.ts` |
| #325 ocupacion y prorrateos | Entregado | `backend/src/services/fiscal.service.ts`, `backend/src/controllers/fiscal.controller.ts`, `backend/src/routes/fiscal.routes.ts`, `docs/backend/api.md` | `backend/tests/fiscal.service.test.ts`, `backend/tests/fiscal.controller.test.ts` |
| #326 resumen anual | Entregado | `backend/src/services/fiscal.service.ts`, `backend/src/controllers/fiscal.controller.ts`, `docs/backend/api.md` | `backend/tests/fiscal.service.test.ts`, `backend/tests/fiscal.controller.test.ts` |
| #327 dossier fiscal | Entregado | `backend/src/services/fiscal.service.ts`, `backend/src/controllers/fiscal.controller.ts`, `docs/backend/api.md` | `backend/tests/fiscal.service.test.ts`, `backend/tests/fiscal.controller.test.ts` |
| #328 modo fiscal casero | Entregado | `frontend/app/casero/(tabs)/fiscal.tsx`, `frontend/app/casero/(tabs)/_layout.tsx`, `frontend/styles/casero/fiscal.styles.ts` | `frontend/app/__tests__/fiscal.test.tsx`, `frontend/app/__tests__/navigation-smoke.test.tsx` |
| #329 privacidad y trazabilidad | Entregado | `backend/src/routes/fiscal.routes.ts`, `backend/src/services/fiscal.service.ts`, `docs/changelog/EpicaFiscal/epica-fiscal-issue-329-privacidad-trazabilidad.md` | `backend/tests/fiscal.service.test.ts`, `backend/tests/fiscal.controller.test.ts`, `backend/tests/economico.test.ts`, `frontend/app/__tests__/fiscal.test.tsx` |
| #337 contratos y firma interna | Incluido en cierre | `backend/prisma/schema.prisma`, `backend/src/controllers/contrato.controller.ts`, `backend/src/routes/contrato.routes.ts`, `frontend/components/contratos/ContratosAlquilerScreen.tsx` | `backend/tests/contrato-issue-337.test.ts`, `backend/tests/fiscal.service.test.ts` |
| #338 historico explicito de ocupacion | Incluido en cierre | `backend/prisma/schema.prisma`, `backend/src/services/ocupacion.service.ts`, `backend/src/services/fiscal.service.ts`, `backend/src/controllers/inquilino.controller.ts`, `backend/src/controllers/vivienda.controller.ts` | `backend/tests/ocupacion-issue-338.test.ts`, `backend/tests/contrato-issue-337.test.ts`, `backend/tests/fiscal.service.test.ts`, `backend/tests/multitenant-security.test.ts` |
| #330 cierre documental | Entregado en esta rama | `CONTEXT.md`, `README.md`, `docs/backend/api.md`, `docs/backend/contrato-fiscal-propietario.md`, `docs/backend/fiscal-cierre-epica.md`, `docs/frontend/setup.md`, `docs/changelog/EpicaFiscal/epica-fiscal-issue-330-cierre.md` | Revision documental, `npm test -- fiscal.service.test.ts fiscal.controller.test.ts contrato-issue-337.test.ts ocupacion-issue-338.test.ts` y `npm test -- fiscal.test.tsx navigation-smoke.test.tsx`. |

## Riesgos residuales

- Confirmar con asesor fiscal el tratamiento de gastos deducibles, prorratas, criterio de caja/devengo, uso mixto de vivienda y documentacion exigible por normativa vigente.
- Las categorias fiscales son ayuda operativa; no constituyen calificacion legal automatica.
- Las nuevas URLs privadas se resuelven mediante URLs firmadas desde Backblaze B2; queda pendiente endurecer TTLs y auditoria de acceso si se requiere confidencialidad avanzada.
- La firma interna registra aceptacion, version, hash, usuario y origen tecnico, pero no equivale a firma electronica avanzada o cualificada. Para ese nivel hace falta proveedor especializado.
- El CSV es un dossier de revision, no un modelo tributario oficial.
- Los periodos migrados o inferidos conservan `requiere_revision`; deben confirmarse manualmente antes de cerrar un ejercicio real.
