# Épica 6 — Issue #54: Purga total de datos mockeados

## Qué se hizo

- Auditoría completa de los 9 archivos de pantallas del frontend + `services/api.ts`
- Confirmación de que todos los mocks fueron eliminados durante los issues #51, #52 y #53
- Eliminado el comentario obsoleto en `services/api.ts` (referencia a IP manual)
- Reescritura completa de `docs/frontend/setup.md` para reflejar el estado actual del proyecto

## Resultado de la auditoría

| Archivo | Mock data | Acción |
|---|---|---|
| `app/index.tsx` | ✅ Ninguno | — |
| `app/home.tsx` | ✅ Ninguno | — |
| `app/casero/viviendas.tsx` | ✅ Ninguno | Limpiado en #50 |
| `app/casero/nueva-vivienda.tsx` | ✅ Ninguno | Creado directamente sin mocks en #51 |
| `app/casero/vivienda/[id].tsx` | ✅ Ninguno | `MOCK_VIVIENDA` eliminado en #51 |
| `app/casero/vivienda/[id]/nueva-habitacion.tsx` | ✅ Ninguno | Creado directamente sin mocks en #51 |
| `app/inquilino/inicio.tsx` | ✅ Ninguno | `MOCK_INCIDENCIAS` eliminado en #53 |
| `app/inquilino/nueva-incidencia.tsx` | ✅ Ninguno | Limpiado en #53 |
| `services/api.ts` | ⚠️ Comentario obsoleto | Eliminado en este issue |
| Carpetas `mocks/`, `fixtures/`, `dummyData` | ✅ No existen | — |

## Archivos modificados

| Acción | Archivo |
|---|---|
| Modificado | `frontend/services/api.ts` |
| Modificado | `docs/frontend/setup.md` |

## Cierre de la Épica 6 — Integración con API real

Con este issue se da por completada técnicamente la Épica 6. El frontend del MVP conecta exclusivamente con la API real para todas sus operaciones:

| Operación | Endpoint |
|---|---|
| Login | `POST /auth/login` |
| Listar viviendas | `GET /viviendas` |
| Crear vivienda | `POST /viviendas` |
| Detalle vivienda | `GET /viviendas/:id` |
| Crear habitación | `POST /viviendas/:id/habitaciones` |
| Canjear código | `POST /inquilino/unirse` |
| Listar incidencias | `GET /incidencias` |
| Crear incidencia | `POST /incidencias` |
