import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
  type HeadObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import path from 'node:path';
import { getBackblazeB2Config, type BackblazeB2Config } from '../config/backblaze.config';
import {
  MediaProviderError,
  type MediaDeleteInput,
  type MediaMetadataInput,
  type MediaObject,
  type MediaStorageProvider,
  type MediaUploadInput,
  type MediaUrlInput,
} from './media.types';

type S3Sender = {
  send(command: unknown): Promise<unknown>;
};

type SignedUrlFactory = (
  client: S3Sender,
  command: GetObjectCommand,
  options: { expiresIn: number },
) => Promise<string>;

type BackblazeProviderOptions = {
  config?: BackblazeB2Config;
  client?: S3Sender;
  signedUrlFactory?: SignedUrlFactory;
};

const DEFAULT_SIGNED_URL_TTL_SECONDS = 900;

function sanitizeKeySegment(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function buildObjectKey(input: MediaUploadInput): string {
  const today = new Date().toISOString().slice(0, 10);
  const vivienda = input.viviendaId ? `vivienda-${input.viviendaId}` : 'vivienda-global';
  const extension = sanitizeKeySegment(path.extname(input.fileName).replace('.', ''));
  const baseName = sanitizeKeySegment(path.basename(input.fileName, path.extname(input.fileName))) || 'archivo';
  const suffix = crypto.randomUUID();
  const fileName = extension ? `${baseName}-${suffix}.${extension}` : `${baseName}-${suffix}`;

  return [input.purpose, vivienda, `owner-${input.ownerId}`, today, fileName].join('/');
}

function toMetadata(input: MediaUploadInput): Record<string, string> {
  const metadata: Record<string, string> = {
    purpose: input.purpose,
    visibility: input.visibility,
    ownerId: String(input.ownerId),
  };

  if (input.viviendaId) {
    metadata.viviendaId = String(input.viviendaId);
  }

  for (const [key, value] of Object.entries(input.metadata ?? {})) {
    if (value !== null && value !== undefined) {
      metadata[sanitizeKeySegment(key) || key] = String(value);
    }
  }

  return metadata;
}

function isNotFoundError(error: unknown): boolean {
  if (error instanceof S3ServiceException) {
    return error.name === 'NotFound' || error.$metadata.httpStatusCode === 404;
  }

  return error instanceof Error && /notfound|nosuchkey|404/i.test(error.name + error.message);
}

function mapS3Error(error: unknown, fallbackCode: 'MEDIA_UPLOAD_FAILED' | 'MEDIA_DELETE_FAILED' | 'MEDIA_NOT_FOUND') {
  if (isNotFoundError(error)) {
    return new MediaProviderError('MEDIA_NOT_FOUND', 'El objeto solicitado no existe en Backblaze B2.');
  }

  if (error instanceof MediaProviderError) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Error desconocido del proveedor S3.';
  return new MediaProviderError(fallbackCode, `Backblaze B2 no pudo completar la operacion: ${message}`);
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

export class BackblazeB2MediaStorageProvider implements MediaStorageProvider {
  private readonly config: BackblazeB2Config;
  private readonly client: S3Sender;
  private readonly signedUrlFactory: SignedUrlFactory;

  constructor(options: BackblazeProviderOptions = {}) {
    this.config = options.config ?? getBackblazeB2Config();
    this.client =
      options.client ??
      new S3Client({
        endpoint: this.config.endpoint,
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.applicationKeyId,
          secretAccessKey: this.config.applicationKey,
        },
        forcePathStyle: true,
      });
    this.signedUrlFactory =
      options.signedUrlFactory ??
      ((client, command, presignOptions) => getSignedUrl(client as S3Client, command, presignOptions));
  }

  async upload(input: MediaUploadInput): Promise<MediaObject> {
    const key = buildObjectKey(input);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucketName,
          Key: key,
          Body: input.buffer,
          ContentType: input.mimeType,
          CacheControl: this.config.cacheControl,
          Metadata: toMetadata(input),
        }),
      );
    } catch (error) {
      throw mapS3Error(error, 'MEDIA_UPLOAD_FAILED');
    }

    return {
      provider: 'backblaze',
      key,
      url: input.visibility === 'public' ? this.buildPublicUrl(key) : null,
      variant: 'original',
      mimeType: input.mimeType,
      size: input.size,
      width: null,
      height: null,
      visibility: input.visibility,
      purpose: input.purpose,
      metadata: input.metadata,
    };
  }

  async delete(input: MediaDeleteInput): Promise<void> {
    if (input.provider !== 'backblaze') {
      throw new MediaProviderError('MEDIA_DELETE_FAILED', 'El objeto no pertenece al proveedor Backblaze B2.');
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucketName,
          Key: input.key,
        }),
      );
    } catch (error) {
      throw mapS3Error(error, 'MEDIA_DELETE_FAILED');
    }
  }

  async getPublicUrl(input: MediaUrlInput): Promise<string> {
    this.assertBackblazeInput(input);

    if (!this.config.publicBaseUrl) {
      throw new MediaProviderError(
        'MEDIA_PRIVATE_URL_REQUIRED',
        'B2_PUBLIC_BASE_URL no esta configurado; usa una URL firmada para este objeto.',
      );
    }

    const publicUrl = this.buildPublicUrl(input.key);
    if (!publicUrl) {
      throw new MediaProviderError(
        'MEDIA_PRIVATE_URL_REQUIRED',
        'B2_PUBLIC_BASE_URL no esta configurado; usa una URL firmada para este objeto.',
      );
    }

    return publicUrl;
  }

  async getSignedUrl(input: MediaUrlInput): Promise<string> {
    this.assertBackblazeInput(input);
    const expiresIn = input.expiresInSeconds ?? this.config.signedUrlTtlSeconds ?? DEFAULT_SIGNED_URL_TTL_SECONDS;

    try {
      return await this.signedUrlFactory(
        this.client,
        new GetObjectCommand({
          Bucket: this.config.bucketName,
          Key: input.key,
        }),
        { expiresIn },
      );
    } catch (error) {
      throw mapS3Error(error, 'MEDIA_NOT_FOUND');
    }
  }

  async getMetadata(input: MediaMetadataInput): Promise<MediaObject> {
    this.assertBackblazeInput(input);

    let response: HeadObjectCommandOutput;
    try {
      response = (await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucketName,
          Key: input.key,
        }),
      )) as HeadObjectCommandOutput;
    } catch (error) {
      throw mapS3Error(error, 'MEDIA_NOT_FOUND');
    }

    const metadata = response.Metadata ?? {};
    const visibility = metadata.visibility === 'public' ? 'public' : 'private';
    const purpose = metadata.purpose;

    if (
      purpose !== 'inventory-photo' &&
      purpose !== 'expense-invoice' &&
      purpose !== 'payment-proof' &&
      purpose !== 'rental-contract'
    ) {
      throw new MediaProviderError('MEDIA_NOT_FOUND', 'El objeto no contiene metadata funcional valida.');
    }

    return {
      provider: 'backblaze',
      key: input.key,
      url: visibility === 'public' ? this.buildPublicUrl(input.key) : null,
      variant: 'original',
      mimeType: response.ContentType ?? 'application/octet-stream',
      size: response.ContentLength ?? 0,
      width: null,
      height: null,
      visibility,
      purpose,
      metadata,
    };
  }

  private assertBackblazeInput(input: MediaUrlInput | MediaMetadataInput): void {
    if (input.provider !== 'backblaze') {
      throw new MediaProviderError('MEDIA_NOT_FOUND', 'El objeto no pertenece al proveedor Backblaze B2.');
    }
  }

  private buildPublicUrl(key: string): string | null {
    if (!this.config.publicBaseUrl) {
      return null;
    }

    return `${normalizeBaseUrl(this.config.publicBaseUrl)}/${encodeURI(key)}`;
  }
}

export function createBackblazeB2MediaStorageProvider(): MediaStorageProvider {
  return new BackblazeB2MediaStorageProvider();
}
