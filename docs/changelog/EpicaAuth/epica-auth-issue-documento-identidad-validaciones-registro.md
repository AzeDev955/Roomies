# Refactor: documento_identidad + validaciones de registro

## Descripción

Renombrado el campo `dni` a `documento_identidad` en toda la aplicación para dar soporte explícito a pasaportes, DNIs y NIEs internacionales. Se han añadido validaciones robustas en el formulario de registro.

## Cambios realizados

### Backend

**`backend/prisma/schema.prisma`**
- Campo `dni String? @unique` → `documento_identidad String? @unique` en el modelo `Usuario`.

**`backend/prisma/seed.ts`**
- Todos los usuarios de prueba usan `documento_identidad` en lugar de `dni`.

**`backend/src/controllers/auth.controller.ts`**
- Desestructuración y tipo inline actualizados a `documento_identidad`.
- `findFirst` busca duplicados por `email` o `documento_identidad`.
- Mensaje de error genérico actualizado: "El email o documento de identidad ya está registrado."
- `prisma.usuario.create` pasa `documento_identidad`.

### Frontend

**`frontend/utils/validaciones.ts`** _(nuevo)_
- `validarDniNie(documento)`: algoritmo módulo 23 oficial (soporta DNI y NIE X/Y/Z).
- `validarPasaporte(documento)`: regex `[A-Z0-9]{6,15}` case-insensitive.
- `validarPassword(password)`: mínimo 8 caracteres, al menos una mayúscula y un número.

**`frontend/styles/registro.styles.ts`**
- Nuevos estilos: `labelDoc`, `docFila`, `docChip`, `docChipActivo`, `docChipTexto`, `docChipTextoActivo`, `errorTexto`.

**`frontend/app/registro.tsx`**
- Estado `dni` → `documento_identidad`.
- Nuevo estado `tipoDocumento: 'DNI/NIE' | 'PASAPORTE'` (default `'DNI/NIE'`).
- Nuevos estados `errorDoc` y `errorPassword` para errores inline bajo cada campo.
- Selector visual de tipo de documento (chips) encima del `CustomInput` de documento.
- Label del `CustomInput` cambiado a `"Documento de identidad"`.
- `handleRegistrar` valida documento e contraseña antes de enviar; aborta si hay error.
- Payload de `POST /auth/register` usa `documento_identidad`.
- Errores se limpian al teclear o cambiar el tipo de documento.
- Validación de contraseña elevada de 6 a 8 caracteres + mayúscula + número.

**`CONTEXT.md`**
- Tabla del modelo `Usuario`: `dni` → `documento_identidad`.
- Tabla de la API `/auth/register`: campo actualizado.

### Zod — Frontend (`frontend/utils/schemas.ts`) _(nuevo)_

- `dniNieSchema`: `z.string().refine()` con el algoritmo módulo 23 (soporta DNI y NIE X/Y/Z).
- `pasaporteSchema`: `z.string().regex(/^[A-Z0-9]{6,15}$/i)`.
- `passwordSchema`: `.min(8)` + `.regex(/[A-Z]/)` + `.regex(/[0-9]/)` con mensajes individuales.

**`frontend/app/registro.tsx`** (actualizado)
- Importa `dniNieSchema`, `pasaporteSchema`, `passwordSchema` desde `schemas.ts`.
- `handleRegistrar` usa `.safeParse()` y extrae `error.issues[0].message` para los estados `errorDoc` / `errorPassword`.
- Se elimina la dependencia de `validaciones.ts` en el componente.

### Zod — Backend

**`backend/src/schemas/auth.schema.ts`** _(nuevo)_
- `registroSchema`: valida `nombre`, `apellidos`, `email`, `password` (≥8, mayúscula, número), `documento_identidad` (regex alfanumérico 6-15 + `refine` módulo 23 si detecta formato DNI/NIE), `telefono`, `rol` (enum CASERO|INQUILINO).

**`backend/src/middlewares/validate.middleware.ts`** _(nuevo)_
- `validate(schema)`: middleware genérico que ejecuta `schema.safeParse(req.body)`. Si falla, responde `400` con `{ error, errores: [{ campo, mensaje }] }`. Si tiene éxito, asigna `req.body = result.data` y llama `next()`.

**`backend/src/routes/auth.routes.ts`**
- `POST /register` aplica `validate(registroSchema)` antes del controlador.

## Decisiones técnicas

- El selector de tipo de documento usa `Pressable` con estilos `chip` (misma semántica que el selector de rol existente) para consistencia visual sin añadir dependencias.
- Al cambiar de tipo de documento se limpia el campo y el error para evitar validar un DNI con el algoritmo de pasaporte y viceversa.
- `validaciones.ts` se conserva como utilidades standalone; `schemas.ts` añade Zod como capa de validación declarativa en el componente.
- La validación de contraseña se endurece (6 → 8 chars + mayúscula + número) aprovechando el refactor; el placeholder del campo se actualiza para comunicar el nuevo requisito.
- El middleware `validate` es genérico: cualquier ruta puede reutilizarlo pasando su propio schema de Zod.
- En `registroSchema`, `documento_identidad` aplica el módulo 23 solo si el valor empieza por dígito o X/Y/Z, permitiendo pasaportes internacionales sin cambiar el campo en el body.
