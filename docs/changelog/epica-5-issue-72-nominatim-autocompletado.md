# Épica 5 — Issue #72: Autocompletado de direcciones (Mapbox Geocoding)

## Historial de decisiones

| Iteración | API | Motivo del cambio |
|---|---|---|
| v1 | Nominatim (OpenStreetMap) | Rendimiento insuficiente — descartada |
| v2 (actual) | Mapbox Geocoding API | Mayor precisión y velocidad |

## Qué se hizo (v2 — Mapbox)

- Integración de la API de Mapbox Geocoding en el formulario de nueva vivienda
- Buscador con TextInput + botón "Buscar" que hace `fetch` a `api.mapbox.com/geocoding/v5/mapbox.places`
- Búsqueda limitada a España (`country=es`) en español (`language=es`)
- Lista de resultados con `feature.place_name`; al tocar uno rellena `direccion`, `ciudad`, `provincia` y `codigo_postal`
- Los campos siguen siendo editables manualmente
- Token leído de `EXPO_PUBLIC_MAPBOX_TOKEN` — Alert si no está configurado
- Sin cambios en el backend — schema y controlador ya tenían los 5 campos

## Archivos modificados

| Acción | Archivo |
|---|---|
| Modificado | `frontend/app/casero/nueva-vivienda.tsx` |
| Modificado | `.env` (añadida `EXPO_PUBLIC_MAPBOX_TOKEN`) |
| Modificado | `.env.example` (añadida `EXPO_PUBLIC_MAPBOX_TOKEN`) |

## Mapeo de campos Mapbox → Formulario

| Campo formulario | Fuente en `feature` |
|---|---|
| `direccion` | `feature.text` + `feature.address` |
| `ciudad` | `feature.context[].text` donde `id` empieza por `place` |
| `provincia` | `feature.context[].text` donde `id` empieza por `region` |
| `codigo_postal` | `feature.context[].text` donde `id` empieza por `postcode` |

## Configuración necesaria

1. Crear cuenta en [account.mapbox.com](https://account.mapbox.com)
2. Obtener un token público (scope: `styles:read` + `geocoding:read`)
3. Añadir en `.env`: `EXPO_PUBLIC_MAPBOX_TOKEN=pk.ey...`

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| `fetch` nativo en lugar de `api` Axios | Mapbox es externo — no debe pasar por el interceptor JWT |
| `country=es` en la query | Limitar resultados a España para mayor precisión en el contexto del proyecto |
| `EXPO_PUBLIC_` prefix | Expo requiere este prefijo para exponer variables de entorno al bundle del cliente |
| Alert si falta el token | Feedback claro al desarrollador en lugar de error de red silencioso |
