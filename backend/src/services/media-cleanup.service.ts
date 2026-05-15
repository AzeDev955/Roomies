import { createMediaStorageProvider } from './media.service';
import { MediaProviderError, type MediaProvider, type MediaVariant } from './media.types';

type MediaCleanupReference = {
  provider?: string | null;
  key?: string | null;
  variant?: string | null;
};

export type MediaCleanupResult = {
  attempted: number;
  deleted: string[];
  failed: Array<{ provider: MediaProvider; key: string; code: string }>;
};

const IMAGE_VARIANTS: MediaVariant[] = ['thumb', 'medium', 'large'];
const KNOWN_ORIGINAL_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

function isMediaProvider(value: string | null | undefined): value is MediaProvider {
  return value === 'backblaze' || value === 'cloudinary' || value === 'external';
}

function normalizeReference(reference: MediaCleanupReference | null | undefined) {
  if (!reference?.key || !isMediaProvider(reference.provider)) {
    return null;
  }

  return {
    provider: reference.provider,
    key: reference.key,
    variant: reference.variant ?? null,
  };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function expandImageVariantKeys(key: string): string[] {
  const match = key.match(/^(.*)-(?<variant>thumb|medium|large)\.webp$/);
  if (!match?.groups?.variant) {
    return [key];
  }

  const baseKey = match[1];
  return unique([
    ...IMAGE_VARIANTS.map((variant) => `${baseKey}-${variant}.webp`),
    ...KNOWN_ORIGINAL_EXTENSIONS.map((extension) => `${baseKey}-original.${extension}`),
  ]);
}

export async function cleanupMediaReferences(
  references: Array<MediaCleanupReference | null | undefined>,
  options: { includeImageVariants?: boolean; context?: string } = {},
): Promise<MediaCleanupResult> {
  const normalizedReferences = references.map(normalizeReference).filter((reference) => reference !== null);
  const backblazeKeys = unique(
    normalizedReferences
      .filter((reference) => reference.provider === 'backblaze')
      .flatMap((reference) =>
        options.includeImageVariants ? expandImageVariantKeys(reference.key) : [reference.key],
      ),
  );

  const result: MediaCleanupResult = {
    attempted: backblazeKeys.length,
    deleted: [],
    failed: [],
  };

  if (backblazeKeys.length === 0) {
    return result;
  }

  const provider = createMediaStorageProvider();

  for (const key of backblazeKeys) {
    try {
      await provider.delete({ provider: 'backblaze', key });
      result.deleted.push(key);
    } catch (error) {
      const code = error instanceof MediaProviderError ? error.code : 'MEDIA_DELETE_FAILED';
      if (code !== 'MEDIA_NOT_FOUND') {
        result.failed.push({ provider: 'backblaze', key, code });
      }
    }
  }

  if (result.failed.length > 0) {
    console.warn('Limpieza de media pendiente.', {
      context: options.context ?? 'media-cleanup',
      attempted: result.attempted,
      failed: result.failed.map((failure) => ({
        provider: failure.provider,
        key: failure.key,
        code: failure.code,
      })),
    });
  }

  return result;
}
