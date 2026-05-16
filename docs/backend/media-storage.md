# Media storage interno

Documento de la epica #346. La migracion a Backblaze B2 queda cerrada con un contrato interno de media y sin dependencias activas de proveedores anteriores.

## Estado actual

Roomies usa Backblaze B2 mediante API S3-compatible desde `backend/src/services/backblaze-b2-media.provider.ts`. Las rutas reciben archivos con `multer` en memoria, los servicios de media procesan imagenes cuando aplica y los controladores guardan referencias portables (`provider`, `key`, `variant`, MIME, tamano y dimensiones). Las columnas `*_url` se conservan solo como compatibilidad de lectura o para URLs publicas no sensibles.

Las variables actuales de media son:

| Variable | Uso actual |
| --- | --- |
| `MEDIA_PROVIDER` | Debe ser `backblaze`. |
| `B2_ENDPOINT` | Endpoint S3-compatible de Backblaze. |
| `B2_REGION` | Region S3-compatible. |
| `B2_BUCKET_NAME` | Bucket de media. |
| `B2_APPLICATION_KEY_ID` | Key id de Backblaze. |
| `B2_APPLICATION_KEY` | Application key de Backblaze. |
| `B2_PUBLIC_BASE_URL` | Base publica o CDN opcional para objetos publicos. |

## Matriz de uso Backblaze B2

| Flujo | Archivo backend | Archivo frontend | Campo o modelo | Purpose/prefijo | Tipo | Privacidad | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Fotos de vivienda | `backend/src/routes/vivienda.routes.ts`, `backend/src/controllers/foto-vivienda.controller.ts` | `frontend/app/casero/vivienda/[id]/(tabs)/fotos.tsx`, `frontend/app/inquilino/(tabs)/inicio.tsx` | `FotoVivienda` | `housing-photo/` | Imagen WebP | Privada compartida por vivienda | Migrado; casero gestiona y usuarios vinculados visualizan. |
| Fotos de inventario | `backend/src/routes/inventario.routes.ts`, `backend/src/controllers/inventario.controller.ts` | `frontend/app/casero/(tabs)/inventario.tsx`, `frontend/app/inquilino/(tabs)/inventario.tsx` | `FotoAsset` | `inventory-photo/` | Imagen WebP | Privada compartida por vivienda | Migrado; devuelve URL firmada. |
| Facturas de gastos | `backend/src/routes/gasto.routes.ts`, `backend/src/controllers/gasto.controller.ts`, `backend/src/services/gasto.service.ts` | `frontend/app/casero/(tabs)/cobros.tsx`, `frontend/app/inquilino/(tabs)/gastos.tsx`, `frontend/app/casero/(tabs)/fiscal.tsx` | `Gasto.factura_*` | `expense-invoice/` | Imagen o PDF | Privada fiscal/financiera | Migrado; mantiene `factura_url` solo si es persistible. |
| Justificantes de pago | `backend/src/routes/deuda.routes.ts`, `backend/src/controllers/deuda.controller.ts` | `frontend/app/inquilino/(tabs)/gastos.tsx`, `frontend/app/casero/(tabs)/cobros.tsx`, `frontend/app/casero/(tabs)/fiscal.tsx` | `Deuda.justificante_*` | `payment-proof/` | Imagen WebP | Privada financiera | Migrado; devuelve URL firmada. |
| Contratos de alquiler | `backend/src/routes/contrato.routes.ts`, `backend/src/controllers/contrato.controller.ts` | `frontend/components/contratos/ContratosAlquilerScreen.tsx` | `ContratoAlquiler.documento_*` | `rental-contract/` | Imagen o PDF | Privada contractual | Migrado; conserva hash funcional. |
| Seeds y datos demo | `backend/prisma/seed.ts` | No aplica | `factura_url`, `justificante_url` de prueba | `external` | Imagen | Demo, no productiva. | Usa URLs externas de ejemplo sin proveedor activo. |
| Fiscal y exportaciones | `backend/src/services/fiscal.service.ts` | `frontend/app/casero/(tabs)/fiscal.tsx` | Lee `factura_*` y `justificante_*` | No sube | URL firmada | Privada fiscal | Resuelve URLs firmadas antes de exportar. |

Referencias documentales actuales: `CONTEXT.md`, `README.md`, `docs/backend/setup.md`, `docs/backend/api.md`, `docs/backend/inventario-assets.md`, `docs/backend/fiscal-cierre-epica.md`, `docs/infra/setup-despliegue.md` y changelogs de Epicas 11, 12, 14, 16 y Fiscal.

## Clasificacion de datos

| Caso | Publico o privado | Motivo |
| --- | --- | --- |
| Fotos de inventario de vivienda/habitacion | Privado | Muestran estado del piso y objetos de la vivienda; solo deben verlas casero e inquilinos autorizados. |
| Facturas originales de gastos | Privado | Pueden contener datos fiscales, importes, proveedor, direccion o datos personales. |
| Justificantes de pago | Privado | Pueden contener datos bancarios o identificadores de pago. |
| Contratos de alquiler | Privado alto | Contienen datos identificativos, renta, fechas, firma y trazabilidad contractual. |
| Fotos publicas de viviendas o habitaciones | Publico si se crea un flujo de anuncios | No existe hoy como flujo diferenciado; debe nacer con `visibility: public`. |
| Incidencias con adjuntos | Privado | El texto del issue los menciona como futuro caso de uso, pero no hay upload de incidencias actualmente. |

## Contrato interno

El contrato base queda definido en codigo en `backend/src/services/media.types.ts`. Las rutas y controladores dependen del contrato interno, no de detalles S3 o del proveedor.

La representacion portable de un fichero debe ser:

```ts
type MediaObject = {
  provider: 'backblaze' | 'external';
  key: string;
  url?: string | null;
  variant: 'original' | 'thumbnail' | 'preview' | 'download' | 'thumb' | 'medium' | 'large';
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  visibility: 'public' | 'private';
  purpose: 'listing-photo' | 'inventory-photo' | 'expense-invoice' | 'payment-proof' | 'rental-contract';
  metadata?: Record<string, string | number | boolean | null>;
};
```

Operaciones obligatorias:

| Operacion | Contrato |
| --- | --- |
| `upload(input)` | Recibe buffer, nombre, MIME, tamano, purpose, visibility y owner; devuelve `MediaObject`. |
| `delete(input)` | Borra por `provider` + `key`; debe ser idempotente o mapear `not found` a un error controlado. |
| `getPublicUrl(input)` | Devuelve URL estable solo para objetos con `visibility: public`. |
| `getSignedUrl(input)` | Devuelve URL temporal para objetos privados, con expiracion explicita. |
| `getMetadata(input)` | Devuelve metadata tecnica y funcional guardada o consultada al proveedor. |

Errores normalizados:

| Codigo | Uso |
| --- | --- |
| `MEDIA_PROVIDER_NOT_CONFIGURED` | Faltan credenciales o bucket. |
| `MEDIA_UPLOAD_FAILED` | El proveedor no confirma la subida. |
| `MEDIA_DELETE_FAILED` | El proveedor rechaza el borrado. |
| `MEDIA_NOT_FOUND` | El objeto no existe al leer metadata o generar URL. |
| `MEDIA_UNSUPPORTED_TYPE` | MIME o extension no permitidos para el purpose. |
| `MEDIA_PRIVATE_URL_REQUIRED` | Se intento pedir URL publica para un objeto privado. |

## Campos actuales

| Campo actual | Mantener temporalmente | Cambio recomendado |
| --- | --- | --- |
| `FotoAsset.url` | Si, como compatibilidad de lectura. | Anadir `provider`, `key`, `mime_type`, `size`, `width`, `height`, `visibility`, `variant` o migrar a una tabla comun `MediaAsset`. |
| `Gasto.factura_url` | Si, para no romper finanzas ni fiscal. | Sustituir gradualmente por referencia a `MediaAsset` con purpose `expense-invoice`. |
| `Deuda.justificante_url` | Si, para compatibilidad con app actual. | Sustituir gradualmente por referencia a `MediaAsset` con purpose `payment-proof`. |
| `ContratoAlquiler.documento_url` | Si, mientras la firma interna depende del documento actual. | Mantener `documento_hash`, `documento_nombre` y `documento_mime`; anadir provider/key y URLs firmadas. |
| URLs en CSV fiscal | Si, pero con cautela. | Para privados, exportar una referencia interna o URL firmada de corta duracion, no una URL publica permanente. |

## Variables Backblaze B2

Issue #348 implementa el proveedor Backblaze B2 mediante API S3-compatible. Estas variables se leen solo en backend cuando `MEDIA_PROVIDER=backblaze`:

| Variable | Proposito |
| --- | --- |
| `MEDIA_PROVIDER` | `backblaze`; permite activar el proveedor interno sin tocar controladores futuros. |
| `B2_APPLICATION_KEY_ID` | Key id de Backblaze B2. |
| `B2_APPLICATION_KEY` | Application key de Backblaze B2. |
| `B2_BUCKET_NAME` | Nombre del bucket S3-compatible. |
| `B2_ENDPOINT` | Endpoint S3-compatible, por ejemplo `https://s3.eu-central-003.backblazeb2.com`. |
| `B2_REGION` | Region S3-compatible usada para firmar peticiones. |
| `B2_PUBLIC_BASE_URL` | Base URL solo para assets publicos si se habilita CDN o bucket publico. |
| `MEDIA_SIGNED_URL_TTL_SECONDS` | TTL por defecto de URLs firmadas privadas. |
| `MEDIA_SHARED_SIGNED_URL_TTL_SECONDS` | TTL de URLs firmadas para media compartida dentro de una vivienda; por defecto `900`. |
| `MEDIA_PRIVATE_SIGNED_URL_TTL_SECONDS` | TTL de URLs firmadas para documentos sensibles; por defecto `300`. |
| `MEDIA_CACHE_CONTROL` | Cabecera `Cache-Control` aplicada al subir objetos. |
| `MEDIA_IMAGE_MAX_SIZE_BYTES` | Tamano maximo por imagen antes de procesar; por defecto `10485760` (10 MiB). |
| `MEDIA_IMAGE_WEBP_QUALITY` | Calidad WebP de las variantes generadas; por defecto `82`, acotada de 1 a 100. |
| `MEDIA_IMAGE_KEEP_ORIGINAL` | Si vale `true`, el procesador devuelve tambien la variante `original`; por defecto no conserva originales. |

La implementacion vive en `backend/src/services/backblaze-b2-media.provider.ts` y traduce errores S3 a `MediaProviderError` para no filtrar detalles de Backblaze a capas superiores.

## Serving publico, compartido y privado

Issue #352 fija la estrategia inicial con un unico bucket privado por defecto y URLs publicas solo para `purpose` explicitamente publico. Si en una fase posterior se activan anuncios publicos o CDN/Cloudflare, deben usar `listing-photo` con `visibility: public`, `B2_PUBLIC_BASE_URL` y cache agresiva. El resto de objetos se suben como privados y se sirven desde endpoints protegidos con URLs firmadas.

| Tipo | Purpose | Visibilidad en bucket | Serving API | TTL inicial |
| --- | --- | --- | --- | ---: |
| Publico | `listing-photo` | `public` | URL publica basada en `B2_PUBLIC_BASE_URL` o CDN. | No aplica |
| Compartido | `inventory-photo` | `private` | URL firmada solo tras validar acceso a la vivienda. | `MEDIA_SHARED_SIGNED_URL_TTL_SECONDS` (`900`) |
| Privado | `expense-invoice` | `private` | URL firmada desde endpoints de gastos/cobros/fiscal autorizados. | `MEDIA_PRIVATE_SIGNED_URL_TTL_SECONDS` (`300`) |
| Privado | `payment-proof` | `private` | URL firmada para deudor, acreedor/casero o vivienda autorizada. | `MEDIA_PRIVATE_SIGNED_URL_TTL_SECONDS` (`300`) |
| Privado | `rental-contract` | `private` | URL firmada para casero propietario o inquilino implicado. | `MEDIA_PRIVATE_SIGNED_URL_TTL_SECONDS` (`300`) |

`backend/src/services/media-serving.service.ts` centraliza esta matriz. Las respuestas API deben exponer `url` lista para consumir y no deben obligar al frontend a construir URLs ni a conocer `provider`/`key` internos. Para Backblaze privado, si la firma falla no se reutiliza una URL persistida antigua: se devuelve `null` en el modo tolerante para evitar exponer enlaces caducados o publicos por accidente.

Checklist de acceso para recursos privados:

| Recurso | Permitido | Denegado |
| --- | --- | --- |
| `expense-invoice` | Casero propietario, deudor/acreedor o miembro autorizado por endpoints de gastos y cobros. | Usuario fuera de la vivienda recibe `403` antes de resolver URL firmada. |
| `payment-proof` | Deudor que lo sube y casero/acreedor con acceso al cobro. | Usuario ajeno a la vivienda o no deudor no puede subir ni obtener la referencia. |
| `rental-contract` | Casero propietario e inquilino implicado. | Otro usuario o inquilino no implicado recibe `403` en contratos. |
| `inventory-photo` | Casero propietario e inquilino autorizado para vivienda/zona/habitacion visible. | Inquilino de otra habitacion no ve items privados de dormitorio ajeno. |

## Procesado de imagenes

Issue #349 introduce `backend/src/services/media-image.processor.ts` como paso previo a la subida al proveedor. El servicio acepta buffers de imagen `jpg/jpeg`, `png` o `webp`, rechaza archivos por encima de `MEDIA_IMAGE_MAX_SIZE_BYTES` y normaliza las salidas iniciales a WebP:

| Variante | Ancho maximo | Comportamiento |
| --- | ---: | --- |
| `thumb` | 300px | Miniatura para listados y galerias compactas. |
| `medium` | 800px | Vista intermedia para detalle movil. |
| `large` | 1600px | Vista amplia sin servir el original pesado. |

Las variantes usan `withoutEnlargement`, por lo que una imagen pequena mantiene sus dimensiones originales y no se escala artificialmente. Cada resultado incluye `buffer`, `suggestedKey`, `width`, `height`, `size`, `mimeType: image/webp`, `variant` y metadata tecnica con nombre, MIME y tamano originales. La variante `original` solo aparece si el flujo llama al servicio con `keepOriginal: true` o se activa `MEDIA_IMAGE_KEEP_ORIGINAL=true`.

## Estado de cierre

La epica deja completados el proveedor Backblaze, el procesado de imagenes, las referencias portables, el serving publico/privado y la limpieza best-effort. Los pendientes reales quedan fuera del cierre: CDN definitivo para objetos publicos, URLs firmadas avanzadas por auditoria, limpieza programada de objetos huerfanos y una migracion legacy si aparecieran datos reales previos.

## Fotos de vivienda

Issue #367 introduce la galeria de vivienda con el purpose `housing-photo`. Estas imagenes se suben como privadas, se procesan a variantes WebP y se sirven con URLs firmadas tras validar permisos. Las keys quedan agrupadas por vivienda con el formato generado por el procesador: `housing-photo/vivienda-<id>/owner-<caseroId>/<fecha>/<nombre>-<grupo>-<variante>.webp`.

Endpoints protegidos:

| Metodo | Ruta | Permiso |
| --- | --- | --- |
| `GET` | `/api/viviendas/:id/fotos` | Casero propietario o inquilino vinculado a la vivienda. |
| `POST` | `/api/viviendas/:id/fotos` | Solo casero propietario; `multipart/form-data` con campo `foto`. |
| `PATCH` | `/api/viviendas/:id/fotos/:fotoId` | Solo casero propietario; acepta `es_portada` y `orden`. |
| `DELETE` | `/api/viviendas/:id/fotos/:fotoId` | Solo casero propietario; borra el registro y limpia variantes Backblaze best-effort. |

`FotoVivienda.url` solo conserva URLs persistibles de proveedores externos o publicos. Para Backblaze privado, la API devuelve una URL resuelta en cada respuesta y el frontend no debe persistirla ni construirla a partir de `provider` o `key`.
