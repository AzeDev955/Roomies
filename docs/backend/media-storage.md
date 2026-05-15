# Media storage interno

Issue #347 de la epica #346. Este documento audita el acoplamiento actual con Cloudinary y fija el contrato interno que deberia usar Roomies antes de introducir Backblaze u otro proveedor.

## Estado actual

Roomies usa Cloudinary directamente desde `backend/src/config/cloudinary.config.ts` mediante `multer-storage-cloudinary`. Los controladores reciben `req.file.path` o `req.file.secure_url` y guardan una URL remota en Prisma. No se guarda `public_id`, key portable, provider, tamano, dimensiones ni visibilidad. Tampoco hay borrado remoto cuando se elimina o reemplaza un fichero.

Las variables actuales son:

| Variable | Uso actual |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` | Configura el cloud name de Cloudinary. |
| `CLOUDINARY_API_KEY` | Configura la API key de Cloudinary. |
| `CLOUDINARY_API_SECRET` | Configura el API secret de Cloudinary. |

## Matriz de uso Cloudinary

| Flujo | Archivo backend | Archivo frontend | Campo o modelo | Carpeta Cloudinary | Tipo | Privacidad recomendada | Estado de acoplamiento |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Fotos de inventario | `backend/src/routes/inventario.routes.ts`, `backend/src/controllers/inventario.controller.ts` | `frontend/app/casero/(tabs)/inventario.tsx`, `frontend/app/inquilino/(tabs)/inventario.tsx` | `FotoAsset.url` | `roomies-inventario` | Imagen | Privada por vivienda, aunque actualmente se trata como URL directa. | Guarda solo URL; se lista a casero e inquilino autorizado. |
| Facturas de gastos | `backend/src/routes/gasto.routes.ts`, `backend/src/controllers/gasto.controller.ts`, `backend/src/services/gasto.service.ts` | `frontend/app/casero/(tabs)/cobros.tsx`, `frontend/app/inquilino/(tabs)/gastos.tsx`, `frontend/app/casero/(tabs)/fiscal.tsx` | `Gasto.factura_url` | `roomies-facturas` | Imagen o PDF al crear; imagen al reemplazar | Privada fiscal/financiera. | Guarda URL directa; se exporta tambien en dossier fiscal. |
| Justificantes de pago | `backend/src/routes/deuda.routes.ts`, `backend/src/controllers/deuda.controller.ts` | `frontend/app/inquilino/(tabs)/gastos.tsx`, `frontend/app/casero/(tabs)/cobros.tsx`, `frontend/app/casero/(tabs)/fiscal.tsx` | `Deuda.justificante_url` | `roomies-justificantes` | Imagen | Privada financiera entre deudor, acreedor/casero y vivienda. | Guarda URL directa; bloquea borrado de factura si existe actividad de pago. |
| Contratos de alquiler | `backend/src/routes/contrato.routes.ts`, `backend/src/controllers/contrato.controller.ts` | `frontend/components/contratos/ContratosAlquilerScreen.tsx` | `ContratoAlquiler.documento_url`, `documento_nombre`, `documento_mime`, `documento_hash` | `roomies-contratos` | Imagen o PDF | Privada contractual y personal. | Guarda URL directa y hash funcional; no guarda provider/key. |
| Seeds y datos demo | `backend/prisma/seed.ts` | No aplica | `factura_url`, `justificante_url` de prueba | `demo` | Imagen | Demo, no productiva. | Usa URLs publicas de ejemplo. |
| Fiscal y exportaciones | `backend/src/services/fiscal.service.ts` | `frontend/app/casero/(tabs)/fiscal.tsx` | Lee `factura_url` y `justificante_url` | No sube | URL existente | Privada fiscal. | Propaga URLs directas a CSV/dossier. |

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

El contrato base queda definido en codigo en `backend/src/services/media.types.ts`. La implementacion futura debe inyectar un `MediaStorageProvider` y evitar que rutas y controladores dependan de Cloudinary, Backblaze o `multer-storage-cloudinary`.

La representacion portable de un fichero debe ser:

```ts
type MediaObject = {
  provider: 'cloudinary' | 'backblaze' | 'external';
  key: string;
  url?: string | null;
  variant: 'original' | 'thumbnail' | 'preview' | 'download';
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  visibility: 'public' | 'private';
  purpose: 'inventory-photo' | 'expense-invoice' | 'payment-proof' | 'rental-contract';
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
| `MEDIA_PROVIDER_NOT_CONFIGURED` | Faltan credenciales o bucket. Sustituye mensajes acoplados a Cloudinary. |
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
| `MEDIA_CACHE_CONTROL` | Cabecera `Cache-Control` aplicada al subir objetos. |
| `MEDIA_IMAGE_MAX_SIZE_BYTES` | Tamano maximo por imagen antes de procesar; por defecto `10485760` (10 MiB). |
| `MEDIA_IMAGE_WEBP_QUALITY` | Calidad WebP de las variantes generadas; por defecto `82`, acotada de 1 a 100. |
| `MEDIA_IMAGE_KEEP_ORIGINAL` | Si vale `true`, el procesador devuelve tambien la variante `original`; por defecto no conserva originales. |

La implementacion vive en `backend/src/services/backblaze-b2-media.provider.ts` y traduce errores S3 a `MediaProviderError` para no filtrar detalles de Backblaze a capas superiores.

## Procesado de imagenes

Issue #349 introduce `backend/src/services/media-image.processor.ts` como paso previo a la subida al proveedor. El servicio acepta buffers de imagen `jpg/jpeg`, `png` o `webp`, rechaza archivos por encima de `MEDIA_IMAGE_MAX_SIZE_BYTES` y normaliza las salidas iniciales a WebP:

| Variante | Ancho maximo | Comportamiento |
| --- | ---: | --- |
| `thumb` | 300px | Miniatura para listados y galerias compactas. |
| `medium` | 800px | Vista intermedia para detalle movil. |
| `large` | 1600px | Vista amplia sin servir el original pesado. |

Las variantes usan `withoutEnlargement`, por lo que una imagen pequena mantiene sus dimensiones originales y no se escala artificialmente. Cada resultado incluye `buffer`, `suggestedKey`, `width`, `height`, `size`, `mimeType: image/webp`, `variant` y metadata tecnica con nombre, MIME y tamano originales. La variante `original` solo aparece si el flujo llama al servicio con `keepOriginal: true` o se activa `MEDIA_IMAGE_KEEP_ORIGINAL=true`.

## Plan de migracion recomendado

1. Introducir servicio `media.service` que implemente `MediaStorageProvider` para Cloudinary usando el contrato ya definido.
2. Cambiar controladores para recibir `MediaObject` y guardar `provider` + `key`, conservando las columnas `*_url` como compatibilidad.
3. Crear migracion de datos que derive `key` desde URLs actuales cuando sea posible; si no, marcar provider `external`.
4. Sustituir lecturas de URLs directas por `getSignedUrl` en facturas, justificantes, contratos e inventario privado.
5. Anadir proveedor Backblaze detras de `MEDIA_PROVIDER` y migrar flujo por flujo.
