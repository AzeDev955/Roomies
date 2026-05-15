import { getRequiredEnv } from './env';

export type BackblazeB2Config = {
  endpoint: string;
  region: string;
  bucketName: string;
  applicationKeyId: string;
  applicationKey: string;
  publicBaseUrl?: string;
  signedUrlTtlSeconds: number;
  cacheControl: string;
};

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function getPositiveIntegerEnv(name: string, fallback: number): number {
  const raw = getOptionalEnv(name);
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`[config] ${name} debe ser un numero entero positivo.`);
  }

  return parsed;
}

export function getBackblazeB2Config(): BackblazeB2Config {
  return {
    endpoint: getRequiredEnv('B2_ENDPOINT'),
    region: getRequiredEnv('B2_REGION'),
    bucketName: getRequiredEnv('B2_BUCKET_NAME'),
    applicationKeyId: getRequiredEnv('B2_APPLICATION_KEY_ID'),
    applicationKey: getRequiredEnv('B2_APPLICATION_KEY'),
    publicBaseUrl: getOptionalEnv('B2_PUBLIC_BASE_URL'),
    signedUrlTtlSeconds: getPositiveIntegerEnv('MEDIA_SIGNED_URL_TTL_SECONDS', 900),
    cacheControl: getOptionalEnv('MEDIA_CACHE_CONTROL') ?? 'public, max-age=31536000, immutable',
  };
}
