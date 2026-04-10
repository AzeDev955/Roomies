# Épica 6 — Issue #49: Cliente HTTP centralizado con Axios e interceptor JWT

## Contexto

Las rutas protegidas del backend requieren el header `Authorization: Bearer <token>`. Este issue centraliza todas las peticiones HTTP en una instancia Axios compartida que inyecta el token automáticamente mediante un interceptor, eliminando la necesidad de leerlo manualmente en cada pantalla.

## Cambios realizados

### `frontend/services/api.ts` (nuevo)

- Instancia Axios con `baseURL` desde `process.env.EXPO_PUBLIC_API_URL` o `http://localhost:3000/api` como fallback.
- Interceptor `request.use` asíncrono: llama a `obtenerToken()` (SecureStore) y añade `Authorization: Bearer <token>` si existe.
- Exportado como `default` para importación limpia (`import api from '@/services/api'`).

### `frontend/app/index.tsx` (modificado)

- Reemplazado el `fetch` nativo por `api.post('/auth/login', { email, password })`.
- Eliminada la constante `LOGIN_URL` — la baseURL vive en `api.ts`.
- El `catch` unifica errores de red y credenciales inválidas (Axios lanza en 4xx/5xx).

## Arquitectura

Cualquier pantalla que necesite una ruta protegida solo tiene que importar `api` y hacer la llamada — el token se inyecta sin código adicional:

```ts
import api from '@/services/api';

const { data } = await api.get('/incidencias');       // Authorization añadido automáticamente
const { data } = await api.post('/incidencias', ...); // ídem
```
