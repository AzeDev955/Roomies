import type { MediaObject, MediaProvider, MediaPurpose, MediaVariant, MediaVisibility } from './media.types';

type UploadedFileWithProviderData = Express.Multer.File & {
  path?: string;
  secure_url?: string;
  url?: string;
  filename?: string;
  public_id?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
};

export type PortableMediaReference = Pick<
  MediaObject,
  'provider' | 'key' | 'url' | 'variant' | 'mimeType' | 'size' | 'width' | 'height' | 'visibility' | 'purpose'
>;

const MEDIA_PROVIDER_VALUES = new Set<MediaProvider>(['cloudinary', 'backblaze', 'external']);

function normalizeProvider(value: string | undefined): MediaProvider {
  const provider = value?.trim().toLowerCase();
  return MEDIA_PROVIDER_VALUES.has(provider as MediaProvider) ? (provider as MediaProvider) : 'cloudinary';
}

function obtenerUrlArchivo(file: UploadedFileWithProviderData): string | null {
  return file.path ?? file.secure_url ?? file.url ?? null;
}

function obtenerKeyArchivo(file: UploadedFileWithProviderData, url: string | null): string | null {
  return file.public_id ?? file.filename ?? url;
}

function obtenerUrlPersistible(media: PortableMediaReference | null): string | null {
  if (!media) {
    return null;
  }

  return media.provider === 'backblaze' && media.visibility === 'private' ? null : media.url ?? null;
}

export function construirReferenciaMediaDesdeArchivo({
  file,
  purpose,
  visibility,
  variant = 'original',
}: {
  file: Express.Multer.File | undefined;
  purpose: MediaPurpose;
  visibility: MediaVisibility;
  variant?: MediaVariant;
}): PortableMediaReference | null {
  if (!file) {
    return null;
  }

  const archivo = file as UploadedFileWithProviderData;
  const url = obtenerUrlArchivo(archivo);
  const key = obtenerKeyArchivo(archivo, url);

  if (!key) {
    return null;
  }

  return {
    provider: normalizeProvider(process.env.MEDIA_PROVIDER),
    key,
    url,
    variant,
    mimeType: archivo.mimetype,
    size: archivo.bytes ?? archivo.size,
    width: archivo.width ?? null,
    height: archivo.height ?? null,
    visibility,
    purpose,
  };
}

export function construirCamposMediaDocumento(
  prefix: 'factura' | 'justificante' | 'documento',
  media: PortableMediaReference | null,
) {
  const mimeField = prefix === 'documento' ? 'documento_mime' : `${prefix}_mime_type`;

  return {
    [`${prefix}_url`]: obtenerUrlPersistible(media),
    [`${prefix}_provider`]: media?.provider ?? null,
    [`${prefix}_key`]: media?.key ?? null,
    [`${prefix}_variant`]: media?.variant ?? null,
    [mimeField]: media?.mimeType ?? null,
    [`${prefix}_size`]: media?.size ?? null,
    ...(prefix === 'justificante'
      ? {
          justificante_width: media?.width ?? null,
          justificante_height: media?.height ?? null,
        }
      : {}),
  };
}

export function construirCamposFotoAsset(media: PortableMediaReference) {
  return {
    provider: media.provider,
    key: media.key,
    url: obtenerUrlPersistible(media),
    variant: media.variant,
    mime_type: media.mimeType,
    size: media.size,
    width: media.width ?? null,
    height: media.height ?? null,
  };
}
