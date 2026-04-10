# Issue #91 — Selección de Rol en Auth Social (Google)

**Rama:** `feat/91-google-rol-selector`
**Fecha:** 2026-03-31

## Problema

Los usuarios que se registraban a través de Google OAuth eran asignados automáticamente con el rol `INQUILINO` sin posibilidad de elegir. Un casero que intentara registrarse con Google quedaba bloqueado en el dashboard incorrecto.

## Solución

### Backend

- **`auth.controller.ts`** — `loginConGoogle` añade la flag `esNuevo: boolean` a la respuesta JSON. Si el usuario es nuevo, se crea con rol `INQUILINO` como provisional y se señaliza al frontend para redirigir al selector de rol.
- **`auth.controller.ts`** — Nuevo handler `actualizarRol`: recibe `{ rol }` vía `PATCH /auth/rol`, actualiza el rol en BD y emite un nuevo JWT con el rol actualizado.
- **`auth.routes.ts`** — Añadida ruta `PATCH /auth/rol` protegida con `verificarToken`.

### Frontend

- **`frontend/app/rol.tsx`** — Nueva pantalla con dos cards seleccionables (Casero / Inquilino). Al confirmar, llama a `PATCH /auth/rol`, guarda el nuevo token en SecureStore y navega con `CommonActions.reset` al dashboard correspondiente.
- **`frontend/styles/rol.styles.ts`** — Estilos de la pantalla de selección de rol.
- **`frontend/app/index.tsx`** — `handleGoogleLogin` comprueba `data.esNuevo`: si es `true`, redirige a `/rol`; si no, navega directamente al dashboard.
- **`frontend/app/registro.tsx`** — Mismo patrón `esNuevo` en `handleGoogleLogin`.

## Flujo resultante

1. Usuario pulsa "Continuar con Google" (login o registro).
2. Si es usuario nuevo → backend devuelve `{ esNuevo: true }` → frontend redirige a `/rol`.
3. El usuario elige CASERO o INQUILINO y pulsa "Confirmar".
4. Frontend llama a `PATCH /auth/rol` → backend actualiza BD y emite nuevo JWT con rol correcto.
5. Frontend guarda el nuevo token y navega con stack reset al dashboard correspondiente.
6. Si el usuario ya existía → login directo, sin pasar por `/rol`.

## Endpoints afectados

| Método | Ruta | Cambio |
|--------|------|--------|
| `POST` | `/auth/google` | Añade `esNuevo` a la respuesta |
| `PATCH` | `/auth/rol` | Nuevo endpoint |
