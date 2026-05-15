# Epica 16 - Issue 247 - Auditoria de autenticacion, sesion, roles y secretos

## Objetivo
Revisar el flujo de identidad de Roomies para cerrar brechas inmediatas de seguridad y cubrirlo con tests de regresion ejecutables en backend.

## Cambios principales
- Se centraliza la lectura de variables criticas en `backend/src/config/env.ts`.
- `DATABASE_URL` y `JWT_SECRET` fallan con un error explicito si no estan configuradas.
- Google OAuth exige `GOOGLE_CLIENT_ID` mediante la misma utilidad de configuracion.
- Los JWT se firman desde un helper unico con payload minimo `{ id, rol }`.
- El middleware de autenticacion valida que el payload incluya `id` numerico y rol permitido antes de poblar `req.usuario`.
- Las respuestas de auth dejan de serializar `password_hash` y `token_verificacion`.
- Se anaden schemas Zod para login, Google OAuth y actualizacion de rol.
- `POST /auth/register` normaliza email y documento antes de crear usuario.
- `backend/package.json` incorpora `npm test` y `npm run test:watch` para la suite de auth.

## Tests
- Login correcto.
- Login incorrecto.
- Registro duplicado por email.
- Registro duplicado por documento.
- Token ausente.
- Token invalido.
- Token expirado.
- Token valido con payload minimo.
- Cambio de rol con valor invalido.
- Ausencia de `JWT_SECRET`.

## Decision sobre correo verificado
La verificacion por email se mantiene deshabilitada de forma explicita porque el envio SMTP por Gmail/Railway sigue bloqueado y reactivarlo sin proveedor viable romperia el alta de usuarios.

Decision temporal:
- Mantener `correo_verificado: true` en registro email/password.
- Mantener desactivado el guard de `correo_verificado` en login.
- No generar ni devolver `token_verificacion` mientras esta deuda siga abierta.
- Considerar como deuda de seguridad sustituir SMTP por un proveedor HTTP transaccional o reactivar magic links cuando exista infraestructura fiable.

## Riesgos pendientes
- El endpoint `GET /auth/verificar/:token` se conserva por compatibilidad, pero no queda activo en el flujo de producto actual.
- Los tests cubren controladores y middleware sin levantar Express ni conectar con base de datos real; la suite de regresion final de la epica debe completar smoke tests HTTP end-to-end.
