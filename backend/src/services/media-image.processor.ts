import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { MediaProviderError, type MediaPurpose, type MediaVariant } from './media.types';

export type MediaImageVariant = Extract<MediaVariant, 'original' | 'thumb' | 'medium' | 'large'>;

export type ProcessImageInput = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
  purpose: MediaPurpose;
  ownerId: number;
  viviendaId?: number;
  maxSizeBytes?: number;
  webpQuality?: number;
  keepOriginal?: boolean;
};

export type ProcessedImageVariant = {
  variant: MediaImageVariant;
  suggestedKey: string;
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  mimeType: 'image/webp' | 'image/jpeg' | 'image/png';
  metadata: {
    originalFileName: string;
    originalMimeType: string;
    originalSize: number;
    variantGroupId: string;
    variant: MediaImageVariant;
    width: number;
    height: number;
    webpQuality?: number;
  };
};

const DEFAULT_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const DEFAULT_WEBP_QUALITY = 82;
const MIN_WEBP_QUALITY = 1;
const MAX_WEBP_QUALITY = 100;

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const IMAGE_VARIANT_WIDTHS: Array<{ variant: Exclude<MediaImageVariant, 'original'>; width: number }> = [
  { variant: 'thumb', width: 300 },
  { variant: 'medium', width: 800 },
  { variant: 'large', width: 1600 },
];

function getPositiveIntegerFromEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getBooleanFromEnv(name: string, fallback: boolean): boolean {
  const rawValue = process.env[name]?.trim().toLowerCase();
  if (!rawValue) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'si'].includes(rawValue);
}

function normalizeWebpQuality(value: number): number {
  return Math.min(Math.max(Math.round(value), MIN_WEBP_QUALITY), MAX_WEBP_QUALITY);
}

function sanitizeKeySegment(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function assertSupportedImageType(fileName: string, mimeType: string): void {
  const normalizedMimeType = mimeType.trim().toLowerCase();
  const extension = path.extname(fileName).trim().toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(normalizedMimeType) || !ALLOWED_EXTENSIONS.has(extension)) {
    throw new MediaProviderError(
      'MEDIA_UNSUPPORTED_TYPE',
      'Solo se permiten imagenes jpg, jpeg, png o webp.',
    );
  }
}

function assertSizeAllowed(size: number, maxSizeBytes: number): void {
  if (size > maxSizeBytes) {
    throw new MediaProviderError(
      'MEDIA_FILE_TOO_LARGE',
      `La imagen supera el tamano maximo permitido de ${maxSizeBytes} bytes.`,
    );
  }
}

function buildSuggestedKey(input: ProcessImageInput, variantGroupId: string, variant: MediaImageVariant): string {
  const today = new Date().toISOString().slice(0, 10);
  const vivienda = input.viviendaId ? `vivienda-${input.viviendaId}` : 'vivienda-global';
  const baseName = sanitizeKeySegment(path.basename(input.fileName, path.extname(input.fileName))) || 'imagen';
  const originalExtension = sanitizeKeySegment(path.extname(input.fileName).replace('.', '')) || 'imagen';
  const extension = variant === 'original' ? originalExtension : 'webp';
  return [input.purpose, vivienda, `owner-${input.ownerId}`, today, `${baseName}-${variantGroupId}-${variant}.${extension}`].join('/');
}

function buildMetadata(
  input: ProcessImageInput,
  variantGroupId: string,
  variant: MediaImageVariant,
  width: number,
  height: number,
  webpQuality?: number,
): ProcessedImageVariant['metadata'] {
  return {
    originalFileName: input.fileName,
    originalMimeType: input.mimeType,
    originalSize: input.size,
    variantGroupId,
    variant,
    width,
    height,
    webpQuality,
  };
}

function normalizeOriginalMimeType(mimeType: string): 'image/webp' | 'image/jpeg' | 'image/png' {
  if (mimeType === 'image/png') {
    return 'image/png';
  }

  if (mimeType === 'image/webp') {
    return 'image/webp';
  }

  return 'image/jpeg';
}

async function readImageMetadata(buffer: Buffer): Promise<sharp.Metadata> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('La imagen no contiene dimensiones validas.');
    }

    return metadata;
  } catch (error) {
    if (error instanceof MediaProviderError) {
      throw error;
    }

    throw new MediaProviderError('MEDIA_UNSUPPORTED_TYPE', 'La imagen no se pudo leer o esta corrupta.');
  }
}

export async function processImageForUpload(input: ProcessImageInput): Promise<ProcessedImageVariant[]> {
  const maxSizeBytes = input.maxSizeBytes ?? getPositiveIntegerFromEnv('MEDIA_IMAGE_MAX_SIZE_BYTES', DEFAULT_MAX_IMAGE_SIZE_BYTES);
  const webpQuality = normalizeWebpQuality(
    input.webpQuality ?? getPositiveIntegerFromEnv('MEDIA_IMAGE_WEBP_QUALITY', DEFAULT_WEBP_QUALITY),
  );
  const keepOriginal = input.keepOriginal ?? getBooleanFromEnv('MEDIA_IMAGE_KEEP_ORIGINAL', false);

  assertSupportedImageType(input.fileName, input.mimeType);
  assertSizeAllowed(input.size, maxSizeBytes);

  const metadata = await readImageMetadata(input.buffer);
  const variantGroupId = crypto.randomUUID();
  const variants: ProcessedImageVariant[] = [];

  if (keepOriginal) {
    variants.push({
      variant: 'original',
      suggestedKey: buildSuggestedKey(input, variantGroupId, 'original'),
      buffer: input.buffer,
      width: metadata.width as number,
      height: metadata.height as number,
      size: input.size,
      mimeType: normalizeOriginalMimeType(input.mimeType),
      metadata: buildMetadata(input, variantGroupId, 'original', metadata.width as number, metadata.height as number),
    });
  }

  for (const { variant, width } of IMAGE_VARIANT_WIDTHS) {
    const output = await sharp(input.buffer)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: webpQuality })
      .toBuffer({ resolveWithObject: true });

    if (!output.info.width || !output.info.height) {
      throw new MediaProviderError('MEDIA_UPLOAD_FAILED', 'No se pudo generar la variante de imagen.');
    }

    variants.push({
      variant,
      suggestedKey: buildSuggestedKey(input, variantGroupId, variant),
      buffer: output.data,
      width: output.info.width,
      height: output.info.height,
      size: output.info.size,
      mimeType: 'image/webp',
      metadata: buildMetadata(input, variantGroupId, variant, output.info.width, output.info.height, webpQuality),
    });
  }

  return variants;
}
