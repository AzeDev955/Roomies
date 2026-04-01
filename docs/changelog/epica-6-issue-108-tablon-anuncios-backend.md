# Issue #108 — Tablón de anuncios por vivienda (Backend + BD)

## Cambios

### Base de datos
- Nuevo modelo `Anuncio` en `prisma/schema.prisma`: `id`, `titulo`, `contenido`, `fecha_creacion`, relaciones con `Vivienda` y `Usuario`.
- Back-relations añadidas: `Vivienda.anuncios` y `Usuario.anuncios`.
- Migración: `npx prisma migrate dev --name add_anuncio` (Railway aplica `db push` en el siguiente deploy).

### Backend
- `src/controllers/anuncio.controller.ts` — 3 handlers:
  - `listarAnuncios`: GET `?viviendaId=X`, ordenado por `fecha_creacion desc`. CASERO verifica propiedad, INQUILINO verifica habitación asignada.
  - `crearAnuncio`: POST con `{ titulo, contenido, vivienda_id }`. Mismas verificaciones de acceso. Responde 201.
  - `eliminarAnuncio`: DELETE `/:id`. Permitido si `autor_id === usuarioId` OR `vivienda.casero_id === usuarioId`. Responde 204.
- `src/routes/anuncio.routes.ts` — GET `/`, POST `/`, DELETE `/:id`, todos con `verificarToken`.
- `src/index.ts` — montado en `/api/anuncios`.

## Endpoints disponibles

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/anuncios?viviendaId=X` | Casero (su vivienda) o Inquilino (su vivienda) |
| POST | `/api/anuncios` | Casero (su vivienda) o Inquilino (su vivienda) |
| DELETE | `/api/anuncios/:id` | Autor del anuncio OR casero de la vivienda |
