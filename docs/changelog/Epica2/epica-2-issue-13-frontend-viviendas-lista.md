# Épica 2 — Issue #13: (Frontend) Pantalla del Casero — Lista de viviendas + FAB

## Qué se hizo

- Pantalla `app/casero/viviendas.tsx` con lista de viviendas del casero (datos mock)
- `FlatList` para renderizar las tarjetas con alias, dirección y conteo de habitaciones
- FAB (`Pressable` con `position: absolute`) para navegar a `/casero/nueva-vivienda`
- Navegación por tarjeta hacia `/casero/vivienda/:id` (pantalla de detalle, pendiente)
- Estilos en `styles/casero/viviendas.styles.ts` siguiendo la convención modular del proyecto

## Archivos creados

| Acción | Archivo |
|---|---|
| Nuevo | `frontend/app/casero/viviendas.tsx` |
| Nuevo | `frontend/styles/casero/viviendas.styles.ts` |

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| Datos mock en `MOCK_VIVIENDAS` | La integración con la API se hará en un issue posterior; el estado local queda listo para sustituir el mock por un `fetch` |
| `const [viviendas] = useState(MOCK)` | Solo getter por ahora; cuando se integre la API se añadirá el setter |
| `@/styles/...` en el import | Alias configurado en tsconfig evita rutas relativas largas (`../../`) en rutas anidadas |
| FAB con `position: absolute` | Patrón estándar de Material Design para acción principal de una pantalla de lista |

## Pendiente

- `app/casero/nueva-vivienda.tsx` — formulario para crear vivienda (issue siguiente)
- `app/casero/vivienda/[id].tsx` — detalle de vivienda con lista de habitaciones
- Reemplazar `MOCK_VIVIENDAS` por llamada real a `GET /api/viviendas`
