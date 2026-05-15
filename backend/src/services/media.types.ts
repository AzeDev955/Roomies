export type MediaProvider = 'cloudinary' | 'backblaze' | 'external';

export type MediaVisibility = 'public' | 'private';

export type MediaVariant = 'original' | 'thumbnail' | 'preview' | 'download' | 'thumb' | 'medium' | 'large';

export type MediaPurpose =
  | 'inventory-photo'
  | 'expense-invoice'
  | 'payment-proof'
  | 'rental-contract';

export type MediaObject = {
  provider: MediaProvider;
  key: string;
  url?: string | null;
  variant: MediaVariant;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  visibility: MediaVisibility;
  purpose: MediaPurpose;
  metadata?: Record<string, string | number | boolean | null>;
};

export type MediaUploadInput = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
  purpose: MediaPurpose;
  visibility: MediaVisibility;
  ownerId: number;
  viviendaId?: number;
  key?: string;
  variant?: MediaVariant;
  width?: number | null;
  height?: number | null;
  metadata?: Record<string, string | number | boolean | null>;
};

export type MediaDeleteInput = {
  provider: MediaProvider;
  key: string;
};

export type MediaUrlInput = {
  provider: MediaProvider;
  key: string;
  expiresInSeconds?: number;
};

export type MediaMetadataInput = {
  provider: MediaProvider;
  key: string;
};

export type MediaProviderErrorCode =
  | 'MEDIA_PROVIDER_NOT_CONFIGURED'
  | 'MEDIA_UPLOAD_FAILED'
  | 'MEDIA_DELETE_FAILED'
  | 'MEDIA_NOT_FOUND'
  | 'MEDIA_UNSUPPORTED_TYPE'
  | 'MEDIA_FILE_TOO_LARGE'
  | 'MEDIA_PRIVATE_URL_REQUIRED';

export class MediaProviderError extends Error {
  constructor(
    public readonly code: MediaProviderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'MediaProviderError';
  }
}

export interface MediaStorageProvider {
  upload(input: MediaUploadInput): Promise<MediaObject>;
  delete(input: MediaDeleteInput): Promise<void>;
  getPublicUrl(input: MediaUrlInput): Promise<string>;
  getSignedUrl(input: MediaUrlInput): Promise<string>;
  getMetadata(input: MediaMetadataInput): Promise<MediaObject>;
}
