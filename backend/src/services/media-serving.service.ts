import { createMediaStorageProvider } from './media.service';
import type { MediaProvider, MediaPurpose, MediaVisibility } from './media.types';

export type MediaAccessLevel = 'public' | 'shared' | 'private';

type MediaServingPolicy = {
  access: MediaAccessLevel;
  storageVisibility: MediaVisibility;
  signedUrlTtlSeconds?: number;
};

type MediaUrlFields = {
  url?: string | null;
  provider?: string | null;
  key?: string | null;
  visibility?: MediaVisibility | null;
  purpose?: MediaPurpose | null;
};

const DEFAULT_SHARED_SIGNED_URL_TTL_SECONDS = 900;
const DEFAULT_PRIVATE_SIGNED_URL_TTL_SECONDS = 300;

const MEDIA_SERVING_POLICIES: Record<MediaPurpose, MediaServingPolicy> = {
  'listing-photo': {
    access: 'public',
    storageVisibility: 'public',
  },
  'housing-photo': {
    access: 'shared',
    storageVisibility: 'private',
    signedUrlTtlSeconds: DEFAULT_SHARED_SIGNED_URL_TTL_SECONDS,
  },
  'inventory-photo': {
    access: 'shared',
    storageVisibility: 'private',
    signedUrlTtlSeconds: DEFAULT_SHARED_SIGNED_URL_TTL_SECONDS,
  },
  'expense-invoice': {
    access: 'private',
    storageVisibility: 'private',
    signedUrlTtlSeconds: DEFAULT_PRIVATE_SIGNED_URL_TTL_SECONDS,
  },
  'payment-proof': {
    access: 'private',
    storageVisibility: 'private',
    signedUrlTtlSeconds: DEFAULT_PRIVATE_SIGNED_URL_TTL_SECONDS,
  },
  'rental-contract': {
    access: 'private',
    storageVisibility: 'private',
    signedUrlTtlSeconds: DEFAULT_PRIVATE_SIGNED_URL_TTL_SECONDS,
  },
};

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveSignedUrlTtl(policy: MediaServingPolicy): number | undefined {
  if (policy.access === 'public') {
    return undefined;
  }

  const fallback = policy.signedUrlTtlSeconds ?? DEFAULT_PRIVATE_SIGNED_URL_TTL_SECONDS;
  const envName =
    policy.access === 'shared'
      ? 'MEDIA_SHARED_SIGNED_URL_TTL_SECONDS'
      : 'MEDIA_PRIVATE_SIGNED_URL_TTL_SECONDS';

  return readPositiveIntegerEnv(envName, readPositiveIntegerEnv('MEDIA_SIGNED_URL_TTL_SECONDS', fallback));
}

function getPolicyFromFields(fields: MediaUrlFields): MediaServingPolicy {
  if (fields.purpose) {
    return MEDIA_SERVING_POLICIES[fields.purpose];
  }

  return fields.visibility === 'public'
    ? { access: 'public', storageVisibility: 'public' }
    : {
        access: 'private',
        storageVisibility: 'private',
        signedUrlTtlSeconds: DEFAULT_PRIVATE_SIGNED_URL_TTL_SECONDS,
      };
}

export function getMediaServingPolicy(purpose: MediaPurpose): MediaServingPolicy {
  return MEDIA_SERVING_POLICIES[purpose];
}

export function getUploadVisibilityForPurpose(purpose: MediaPurpose): MediaVisibility {
  return getMediaServingPolicy(purpose).storageVisibility;
}

export async function resolveMediaUrl(fields: MediaUrlFields): Promise<string | null> {
  if (fields.provider !== 'backblaze' || !fields.key) {
    return fields.url ?? null;
  }

  const policy = getPolicyFromFields(fields);
  const provider = createMediaStorageProvider();
  const input = {
    provider: fields.provider as MediaProvider,
    key: fields.key,
  };

  if (policy.access === 'public') {
    return provider.getPublicUrl(input);
  }

  return provider.getSignedUrl({
    ...input,
    expiresInSeconds: resolveSignedUrlTtl(policy),
  });
}

export async function resolveOptionalMediaUrl(fields: MediaUrlFields): Promise<string | null> {
  try {
    return await resolveMediaUrl(fields);
  } catch (error) {
    console.warn('No se pudo resolver la URL de media.', error);
    return fields.provider === 'backblaze' ? null : fields.url ?? null;
  }
}
