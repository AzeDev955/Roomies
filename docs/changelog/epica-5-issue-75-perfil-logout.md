# Épica 5 — Issue #75: Pantalla de Perfil y Cierre de Sesión

## Qué se hizo

- Nuevo handler `obtenerMiPerfil` en el backend que consulta la BD y devuelve nombre, apellidos, email, rol y teléfono (sin password_hash)
- `GET /auth/me` actualizado para usar `obtenerMiPerfil` en lugar del inline handler que solo devolvía `{ id, rol }` del JWT
- Nueva pantalla `app/perfil.tsx` con avatar (inicial del nombre), badge de rol (azul/verde), tarjetas de datos y botón "Cerrar Sesión"
- Logout llama a `eliminarToken()` y hace `router.replace('/')` (sin posibilidad de volver atrás)
- Icono `person-circle-outline` (Ionicons) en la esquina superior derecha de `casero/viviendas.tsx` y en el dashboard de `inquilino/inicio.tsx`

## Archivos modificados / creados

| Acción | Archivo |
|---|---|
| Modificado | `backend/src/controllers/auth.controller.ts` |
| Modificado | `backend/src/routes/auth.routes.ts` |
| Creado | `frontend/app/perfil.tsx` |
| Creado | `frontend/styles/perfil.styles.ts` |
| Modificado | `frontend/app/casero/viviendas.tsx` |
| Modificado | `frontend/styles/casero/viviendas.styles.ts` |
| Modificado | `frontend/app/inquilino/inicio.tsx` |
| Modificado | `frontend/styles/inquilino/inicio.styles.ts` |

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| `router.replace('/')` en logout | Elimina la pantalla de perfil del stack — el usuario no puede volver atrás con el botón de retroceso tras cerrar sesión |
| Avatar con inicial del nombre | No requiere librerías de imágenes ni uploads; identifica visualmente al usuario |
| Badge azul CASERO / verde INQUILINO | Colores coherentes con el resto del sistema (FAB azul = casero, FAB verde = acciones de habitación) |
| Icono en posición absoluta (zIndex: 10) | No altera el layout de la FlatList ni del ScrollView existentes |
| Icono solo en dashboard del inquilino (no en onboarding) | En onboarding el usuario aún no tiene sesión activa efectiva; el perfil no es relevante en ese estado |
