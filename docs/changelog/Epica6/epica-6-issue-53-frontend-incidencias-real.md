# Épica 6 — Issue #53: Sistema de incidencias conectado a la API real

## Qué se hizo

- `app/inquilino/nueva-incidencia.tsx` conectado a `POST /api/incidencias` con `try/catch/finally`, estado `loading`, `ActivityIndicator` en el botón y botón deshabilitado si título o descripción están vacíos
- `app/inquilino/inicio.tsx` eliminadas las incidencias mockeadas; nuevo estado `incidencias` + `loadingIncidencias` cargados con `GET /api/incidencias` en `useFocusEffect` (recarga automática al volver de crear una incidencia)
- `datosCasa` extendido con `viviendaId` (necesario para el POST de incidencias, que requiere `vivienda_id`)
- `viviendaId` pasado como param de ruta al navegar a `nueva-incidencia`
- Fecha de creación formateada con `toLocaleDateString('es-ES')` a partir del ISO devuelto por el backend
- Estado vacío: texto "No hay incidencias registradas." cuando el array está vacío

## Archivos modificados

| Acción | Archivo |
|---|---|
| Modificado | `frontend/app/inquilino/inicio.tsx` |
| Modificado | `frontend/app/inquilino/nueva-incidencia.tsx` |
| Modificado | `frontend/styles/inquilino/inicio.styles.ts` |
| Modificado | `frontend/styles/inquilino/nueva-incidencia.styles.ts` |

## Detalle técnico relevante

`POST /api/incidencias` requiere `vivienda_id` como campo obligatorio. Este campo no estaba disponible en el flujo original del issue spec. Se obtiene del response de `POST /api/inquilino/unirse` (`data.habitacion.vivienda_id`) y se almacena en el estado `datosCasa.viviendaId` de `inicio.tsx`, pasándose como param de URL a `nueva-incidencia.tsx`.

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| `useFocusEffect` en lugar de `useEffect` | Recarga la lista cada vez que el usuario vuelve de crear una incidencia, sin prop drilling |
| `cargarIncidencias()` llamado también tras canjear código | Sin esto la lista aparecería vacía hasta que el usuario saliera y volviera a la pantalla |
| `tieneCasa` como guarda en `useFocusEffect` | Evita llamar a la API en la pantalla de onboarding antes de tener habitación asignada |
| `viviendaId` via `params` de Expo Router | Evita estado global/contexto para un dato puntual que solo necesita `nueva-incidencia` |
| `botonEnviarDisabled` con título y descripción vacíos | Evita enviar incidencias sin contenido mínimo |
