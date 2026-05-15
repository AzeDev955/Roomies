# Magic links en Roomies

Este documento resume el flujo de magic links que existe en Roomies para poder reutilizarlo en otro proyecto. En el estado actual de la app, el registro manual ya inicia sesion directamente y crea usuarios con `correo_verificado: true`, pero se conserva el endpoint historico de verificacion por compatibilidad.

## Que es un magic link

Un magic link es un enlace unico enviado por email para confirmar una accion sin que el usuario tenga que copiar codigos. En Roomies se uso para verificar el correo tras el registro:

1. El usuario se registra.
2. El backend genera un token aleatorio.
3. El token se guarda en base de datos.
4. El backend envia un email con un enlace del tipo:

```text
https://api.miapp.com/api/auth/verificar/<token>
```

5. Cuando el usuario pulsa el enlace, el backend busca ese token.
6. Si existe, marca el correo como verificado, borra el token y redirige a la app.

## Para que sirven

En Roomies el caso de uso era confirmar que el email pertenece al usuario antes de permitir el login.

Tambien se pueden usar para:

- Login sin password.
- Recuperacion de cuenta.
- Invitaciones a una vivienda, equipo o proyecto.
- Confirmar cambios sensibles, como email nuevo.

La idea importante es que el enlace debe ser de un solo uso y tener una vida corta.

## Piezas que tenemos en Roomies

### Base de datos

El modelo `Usuario` incluye estos campos:

```prisma
correo_verificado Boolean
token_verificacion String?
```

`correo_verificado` indica si el email ya fue confirmado. `token_verificacion` guarda el token pendiente de usar. Cuando el enlace se consume, se pone a `null`.

### Generacion del token

La implementacion historica generaba el token asi:

```ts
crypto.randomBytes(32).toString('hex')
```

Eso produce un token largo y dificil de adivinar. Para otro proyecto, conviene guardar solo un hash del token si el flujo va a ser sensible, pero para una verificacion simple de MVP puede bastar guardar el token plano con caducidad.

### Envio del email

Roomies tiene el servicio `enviarMagicLink(email, nombre, token)` en `backend/src/services/email.service.ts`.

Construye la URL usando `BACKEND_URL`:

```ts
const url = `${process.env['BACKEND_URL'] ?? 'http://localhost:3001'}/api/auth/verificar/${token}`;
```

Y envia un email HTML con Nodemailer usando estas variables:

```env
EMAIL_USER=tu-cuenta@gmail.com
EMAIL_PASS=contrasena-de-aplicacion
BACKEND_URL=https://api.miapp.com
```

En Gmail, `EMAIL_PASS` debe ser una contrasena de aplicacion, no la contrasena normal.

### Endpoint de verificacion

La ruta esta declarada en `backend/src/routes/auth.routes.ts`:

```ts
router.get('/verificar/:token', verificarEmail);
```

Y el controlador hace esto:

```ts
const usuario = await prisma.usuario.findFirst({
  where: { token_verificacion: token },
});

if (!usuario) {
  res.status(200).send('<html>Enlace invalido o expirado</html>');
  return;
}

await prisma.usuario.update({
  where: { id: usuario.id },
  data: { correo_verificado: true, token_verificacion: null },
});

res.redirect('roomies://verificacion?status=success');
```

El redirect final usa el deep link `roomies://` para volver a abrir la app movil tras verificar.

## Como se implementaria en otro proyecto

### Registro con verificacion por email

En el registro:

1. Validar email y password.
2. Comprobar que el email no existe.
3. Hashear la password.
4. Generar `token_verificacion`.
5. Crear usuario con `correo_verificado: false`.
6. Enviar email con el magic link.
7. Responder sin JWT, por ejemplo:

```json
{
  "mensaje": "Usuario creado. Revisa tu correo para verificar la cuenta."
}
```

Ejemplo de pseudocodigo:

```ts
const tokenVerificacion = crypto.randomBytes(32).toString('hex');

const usuario = await prisma.usuario.create({
  data: {
    email,
    password_hash,
    correo_verificado: false,
    token_verificacion: tokenVerificacion,
  },
});

enviarMagicLink(usuario.email, usuario.nombre, tokenVerificacion).catch(console.error);

res.status(201).json({ mensaje: 'Revisa tu correo para verificar la cuenta.' });
```

### Login bloqueado hasta verificar

En el login, despues de validar la password:

```ts
if (!usuario.correo_verificado) {
  res.status(403).json({ error: 'Debes verificar tu correo antes de iniciar sesion.' });
  return;
}
```

Si esta verificado, se emite el JWT normal.

### Verificacion del enlace

El endpoint debe:

1. Recibir `GET /auth/verificar/:token`.
2. Buscar el usuario por token.
3. Si no existe, mostrar una pagina sencilla de error.
4. Si existe, marcar `correo_verificado: true`.
5. Borrar `token_verificacion`.
6. Redirigir a la app o a una pantalla web de exito.

## Recomendaciones

- Usar tokens aleatorios largos: minimo 32 bytes.
- Hacer el enlace de un solo uso borrando el token al consumirlo.
- Anadir caducidad con un campo tipo `token_verificacion_expira`.
- No devolver nunca `token_verificacion` en respuestas de API.
- Enviar el correo de forma asincrona para que un fallo SMTP no rompa todo el registro.
- En produccion, preferir un proveedor transaccional como Resend, SendGrid, Mailgun, Postmark o SES antes que SMTP de Gmail.
- Si se usa en login sin password, intercambiar el magic link por una sesion real y no dejar el token reutilizable.

## Estado actual en Roomies

Roomies conserva:

- `GET /api/auth/verificar/:token`.
- `correo_verificado`.
- `token_verificacion`.
- `enviarMagicLink(...)`.
- Deep link `roomies://verificacion?status=success`.

Pero el flujo activo actual no depende de magic links:

- `POST /auth/register` crea el usuario con `correo_verificado: true`.
- `POST /auth/register` devuelve `{ token, usuario }`.
- El login no bloquea temporalmente por `correo_verificado`.

Para reactivar el flujo completo habria que volver a generar el token en registro, enviar el email, responder sin JWT y activar el guard de `correo_verificado` en login.
