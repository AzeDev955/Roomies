# Issue #196 — Justificante de pago en deudas de inquilino

**Fecha:** 2026-04-10
**Épica:** 12

## Cambios técnicos

- `backend/prisma/schema.prisma`: añadido el campo opcional `justificante_url` al modelo `Deuda` para persistir la URL segura del comprobante.
- `backend/src/config/cloudinary.config.ts`: extraído un creador de uploaders reutilizable por carpeta y añadido `uploadJustificanteFoto` para subir imágenes a `roomies-justificantes`.
- `backend/src/controllers/deuda.controller.ts`: creado el controlador `subirJustificanteDeuda` con validación de deuda, pertenencia a vivienda, propiedad del deudor y guardado de `secure_url` en Prisma.
- `backend/src/routes/deuda.routes.ts`: registrado el endpoint `POST /api/deudas/:deudaId/justificante` con `verificarToken`, `multer` y Cloudinary.
- `backend/src/index.ts`: montadas las nuevas rutas de deuda bajo `/api`.
- `frontend/constants/theme.ts`: añadidos tokens `info` e `infoLight` para estados y CTAs de justificante con Soft Tint azul.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: reemplazado el `Alert` de “Saldar deuda” por un bottom sheet con dos acciones, integración con `expo-image-picker`, subida multipart del justificante y saldado posterior de la deuda.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: añadido un bloque de deudas pagadas con botón `Ver justificante` que abre la URL remota cuando existe `justificante_url`.
- `frontend/styles/inquilino/gastos.styles.ts`: incorporados estilos del nuevo sheet de confirmación, CTA secundario/primario y tarjeta de justificantes pagados siguiendo `Theme.radius.lg` y espaciado amplio.
- Validación técnica: `npx prisma validate --schema prisma/schema.prisma`, `npm run build` en `backend` y `npm run lint` en `frontend` completados; el lint solo reporta warnings previos ajenos a esta issue.
