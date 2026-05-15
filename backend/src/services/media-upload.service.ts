import {
  construirReferenciaMediaDesdeArchivo,
  type PortableMediaReference,
} from './media-reference.service';
import { processImageForUpload, type MediaImageVariant } from './media-image.processor';
import { createMediaStorageProvider } from './media.service';
import { MediaProviderError, type MediaPurpose, type MediaVisibility } from './media.types';

type UploadedFileWithLegacyUrl = Express.Multer.File & {
  path?: string;
  secure_url?: string;
  url?: string;
  filename?: string;
};

type UploadMediaOptions = {
  file: Express.Multer.File | undefined;
  purpose: MediaPurpose;
  visibility: MediaVisibility;
  ownerId: number;
  viviendaId?: number;
};

type UploadImageOptions = UploadMediaOptions & {
  preferredVariant?: MediaImageVariant;
};

function hasLegacyProviderUrl(file: Express.Multer.File): boolean {
  const legacy = file as UploadedFileWithLegacyUrl;
  return Boolean(legacy.path ?? legacy.secure_url ?? legacy.url ?? legacy.filename);
}

function assertFileBuffer(file: Express.Multer.File): Buffer {
  if (file.buffer?.length) {
    return file.buffer;
  }

  throw new MediaProviderError('MEDIA_UPLOAD_FAILED', 'No se pudo leer el archivo recibido.');
}

function buildLegacyReference(
  file: Express.Multer.File | undefined,
  purpose: MediaPurpose,
  visibility: MediaVisibility,
) {
  return construirReferenciaMediaDesdeArchivo({
    file,
    purpose,
    visibility,
  });
}

export async function uploadDocumentMedia({
  file,
  purpose,
  visibility,
  ownerId,
  viviendaId,
}: UploadMediaOptions): Promise<PortableMediaReference | null> {
  if (!file) {
    return null;
  }

  if (hasLegacyProviderUrl(file)) {
    return buildLegacyReference(file, purpose, visibility);
  }

  const provider = createMediaStorageProvider();
  const media = await provider.upload({
    buffer: assertFileBuffer(file),
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    purpose,
    visibility,
    ownerId,
    viviendaId,
    metadata: {
      originalFileName: file.originalname,
    },
  });

  if (visibility === 'private' && media.provider === 'backblaze') {
    const signedUrl = await provider.getSignedUrl({ provider: media.provider, key: media.key });
    return { ...media, url: signedUrl };
  }

  return media;
}

export async function uploadImageMedia({
  file,
  purpose,
  visibility,
  ownerId,
  viviendaId,
  preferredVariant = 'medium',
}: UploadImageOptions): Promise<PortableMediaReference | null> {
  if (!file) {
    return null;
  }

  if (hasLegacyProviderUrl(file)) {
    return buildLegacyReference(file, purpose, visibility);
  }

  const provider = createMediaStorageProvider();
  const processedVariants = await processImageForUpload({
    buffer: assertFileBuffer(file),
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    purpose,
    ownerId,
    viviendaId,
  });

  const uploadedVariants = await Promise.all(
    processedVariants.map(async (variant) => {
      const uploaded = await provider.upload({
        buffer: variant.buffer,
        fileName: variant.suggestedKey,
        mimeType: variant.mimeType,
        size: variant.size,
        purpose,
        visibility,
        ownerId,
        viviendaId,
        key: variant.suggestedKey,
        variant: variant.variant,
        width: variant.width,
        height: variant.height,
        metadata: variant.metadata,
      });

      const url =
        visibility === 'private' && uploaded.provider === 'backblaze'
          ? await provider.getSignedUrl({ provider: uploaded.provider, key: uploaded.key })
          : uploaded.url;

      return {
        ...uploaded,
        url,
        variant: variant.variant,
        mimeType: variant.mimeType,
        size: variant.size,
        width: variant.width,
        height: variant.height,
      };
    }),
  );

  return (
    uploadedVariants.find((variant) => variant.variant === preferredVariant) ??
    uploadedVariants.find((variant) => variant.variant === 'medium') ??
    uploadedVariants[0] ??
    null
  );
}

export function mediaProviderErrorToHttp(error: unknown): { status: number; message: string } {
  if (error instanceof MediaProviderError) {
    const status = error.code === 'MEDIA_UNSUPPORTED_TYPE' || error.code === 'MEDIA_FILE_TOO_LARGE' ? 400 : 502;
    return { status, message: error.message };
  }

  return { status: 500, message: 'No se pudo procesar el archivo subido.' };
}
