# Épica 6 — Issue #51: Formularios de creación conectados a BD real

## Qué se hizo

- Nuevo endpoint `GET /api/viviendas/:id` en el backend para obtener el detalle de una vivienda con sus habitaciones
- Nueva pantalla `app/casero/nueva-vivienda.tsx` — formulario de 5 campos que llama a `POST /api/viviendas`
- Nueva pantalla `app/casero/vivienda/[id]/nueva-habitacion.tsx` — formulario que llama a `POST /api/viviendas/:id/habitaciones`
- Pantalla `app/casero/vivienda/[id].tsx` — eliminados los datos mock; ahora carga datos reales con `useFocusEffect` + `GET /api/viviendas/:id`; FAB conectado a la nueva pantalla de habitación

## Archivos creados / modificados

| Acción | Archivo |
|---|---|
| Modificado | `backend/src/controllers/vivienda.controller.ts` |
| Modificado | `backend/src/routes/vivienda.routes.ts` |
| Nuevo | `frontend/app/casero/nueva-vivienda.tsx` |
| Nuevo | `frontend/styles/casero/nueva-vivienda.styles.ts` |
| Nuevo | `frontend/app/casero/vivienda/[id]/nueva-habitacion.tsx` |
| Nuevo | `frontend/styles/casero/vivienda/nueva-habitacion.styles.ts` |
| Modificado | `frontend/app/casero/vivienda/[id].tsx` |

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| Formulario de nueva vivienda tiene 5 campos | El backend (`crearVivienda`) los valida como obligatorios; exponer menos provocaría 400 |
| Selector de tipo con pills (Pressable) en nueva habitación | Evita añadir dependencias (`@react-native-picker/picker`); visualmente más limpio en mobile |
| `useFocusEffect` en detalle de vivienda | Al volver de añadir una habitación, la lista se recarga automáticamente sin prop drilling |
| `[id].tsx` y `[id]/nueva-habitacion.tsx` coexisten | Expo Router soporta file route y folder route para el mismo segmento dinámico sin conflicto |
| FAB verde (`#34C759`) en `nueva-habitacion.styles` | Consistencia con el FAB del detalle (verde = acción secundaria/habitaciones) |
| `router.replace` en nueva vivienda, `router.back` en nueva habitación | Nueva vivienda reemplaza el stack para no acumular pantallas; habitación vuelve al detalle para ver el resultado |

## Flujo verificado

1. Login casero → lista viviendas (GET /api/viviendas real)
2. FAB "+" → nueva vivienda → 5 campos → guardar → regresa a lista con la nueva entrada
3. Tocar vivienda → detalle real (GET /api/viviendas/:id), habitaciones reales con códigos
4. FAB verde "+" → nueva habitación → selector de tipo + switch habitable → guardar → regresa al detalle con la nueva habitación
5. Tocar código "Toca para revelar" → autenticación biométrica → código real visible
