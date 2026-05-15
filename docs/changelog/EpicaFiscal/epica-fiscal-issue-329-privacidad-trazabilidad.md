# Epica Fiscal - Issue 329 - Privacidad y trazabilidad fiscal

Se refuerza el modo fiscal como cierre transversal de permisos, minimizacion de datos y trazabilidad.

## Cambios principales

- Las rutas fiscales (`resumen anual`, `ocupacion` y `dossier`) pasan por el guard del modulo de gastos antes del controller, por lo que la vivienda debe pertenecer al usuario y tener el modulo activo.
- Los controllers mantienen el rechazo explicito a `INQUILINO`; el servicio fiscal sigue acotando cada consulta por `vivienda_id` y `casero_id`.
- El dossier CSV deja de exportar `Documento inquilino` y las consultas fiscales dejan de seleccionar `documento_identidad` de casero o inquilinos. El export conserva solo `Inquilino ID` y nombre como referencia minima para cobros.
- Se mantienen las referencias `factura_url` y `justificante_url` solo en endpoints de casero propietario; los listados compartidos de inquilino siguen ocultando `categoria_fiscal`, `deducible_previsto`, `notas_fiscales` y `prorrateo_fiscal`.
- No existen modelos ni endpoints de contratos firmados ni historico explicito de ocupacion en esta rama; el riesgo queda acotado al contrato documental ya existente.

## Matriz de privacidad

| Endpoint / superficie | Rol permitido | Datos expuestos | Tests |
|---|---|---|---|
| `GET /api/viviendas/:viviendaId/fiscal/:ejercicio` | `CASERO` propietario con `mod_gastos` activo | Resumen anual, totales, lineas fiscales, metadatos fiscales privados, URLs de factura/justificante | `backend/tests/fiscal.controller.test.ts`, `backend/tests/fiscal.service.test.ts` |
| `GET /api/viviendas/:viviendaId/fiscal/ocupacion?ejercicio=YYYY` | `CASERO` propietario con `mod_gastos` activo | Ocupacion por vivienda/habitacion, periodos de cargo e inquilino asociado al cargo | `backend/tests/fiscal.controller.test.ts`, `backend/tests/fiscal.service.test.ts` |
| `GET /api/viviendas/:viviendaId/fiscal/:ejercicio/dossier` | `CASERO` propietario con `mod_gastos` activo | CSV con resumen, detalle, referencias internas, nombre de inquilino, factura y justificante; sin documento/email/telefono de inquilino | `backend/tests/fiscal.controller.test.ts`, `backend/tests/fiscal.service.test.ts` |
| `GET /api/viviendas/:viviendaId/gastos` como inquilino | Inquilino perteneciente a la vivienda | Gastos/deudas donde participa, sin metadatos fiscales privados | `backend/tests/economico.test.ts` |
| `GET /api/viviendas/:viviendaId/cobros` | `CASERO` propietario | Cobros de facturacion propia, justificantes y metadatos fiscales para revision del propietario | `backend/tests/economico.test.ts` |
| Navegacion frontend `casero/(tabs)/fiscal` | Casero con alguna vivienda con `mod_gastos` | UI fiscal de propietario; no existe tab fiscal en layout de inquilino | `frontend/app/__tests__/fiscal.test.tsx`, `frontend/app/__tests__/navigation-smoke.test.tsx` |

## Riesgos conocidos

- Las URLs de Cloudinary siguen siendo referencias directas guardadas en base de datos. La proteccion actual esta en el endpoint que las entrega; si Cloudinary sirve recursos publicos, haria falta una mejora futura de URLs firmadas o acceso proxy para confidencialidad fuerte.
- Roomies aun no conserva un historico contractual completo de altas/bajas ni contratos firmados versionados. La ocupacion fiscal se reconstruye desde cargos mensuales y marca revision manual cuando faltan datos.
