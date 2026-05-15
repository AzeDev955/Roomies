# Épica 5 — Issue #76: Flujo de Registro operativo y conectado al backend

## Qué se hizo

- `telefono` convertido de opcional a obligatorio: schema de Prisma (`String?` → `String`), controller (tipo del body), seed (ambos usuarios de prueba)
- Nueva pantalla `app/registro.tsx` con formulario completo: nombre, apellidos, DNI, email, teléfono, contraseña (toggle ver/ocultar) y selector de rol (pills CASERO / INQUILINO)
- Validaciones frontend antes del POST: campos vacíos, formato de email, contraseña mínimo 6 caracteres, rol seleccionado
- Envío a `POST /auth/register` → éxito: Alert + `router.replace('/')` / error: Alert con mensaje del backend
- Enlace "¿No tienes cuenta? Regístrate" añadido en la pantalla de login (`app/index.tsx`) → navega a `/registro`
- Enlace de vuelta al login en la pantalla de registro → `router.back()`

## Archivos modificados / creados

| Acción | Archivo |
|---|---|
| Modificado | `backend/prisma/schema.prisma` |
| Pendiente ejecución | Migración Prisma `make-telefono-required` (requiere Docker) |
| Modificado | `backend/src/controllers/auth.controller.ts` |
| Modificado | `backend/prisma/seed.ts` |
| Creado | `frontend/app/registro.tsx` |
| Creado | `frontend/styles/registro.styles.ts` |
| Modificado | `frontend/app/index.tsx` |
| Modificado | `frontend/styles/index.styles.ts` |
| Modificado | `docs/backend/api.md` |
| Modificado | `docs/changelog/epica-1-issue-6-auth-register.md` |

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| `telefono` obligatorio en schema + controller + seed | Coherencia total entre BD, API y datos de prueba |
| `router.replace('/')` tras registro exitoso | El usuario no debe poder volver a la pantalla de registro con el botón de retroceso |
| `router.back()` en el enlace del registro | La pantalla de registro puede llegar desde el login; `back()` es más correcto que `replace('/')` para no romper el stack de navegación |
| Selector de rol con pills (no Select/Picker) | Consistente con el patrón de pills usado en `nueva-habitacion.tsx`; más visual y claro |
| `ScrollView` con `keyboardShouldPersistTaps="handled"` | El formulario tiene 7 campos y no cabe en pantalla sin scroll; el tap en pills/botones funciona aunque el teclado esté abierto |
| Validaciones en cliente antes de llamar al backend | Evitan round-trips innecesarios y dan feedback inmediato al usuario |
