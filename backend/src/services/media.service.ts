import { createBackblazeB2MediaStorageProvider } from './backblaze-b2-media.provider';
import { MediaProviderError, type MediaStorageProvider } from './media.types';

export function createMediaStorageProvider(): MediaStorageProvider {
  const provider = process.env.MEDIA_PROVIDER?.trim().toLowerCase() ?? 'cloudinary';

  if (provider === 'backblaze') {
    return createBackblazeB2MediaStorageProvider();
  }

  throw new MediaProviderError(
    'MEDIA_PROVIDER_NOT_CONFIGURED',
    `El proveedor de media "${provider}" aun no esta disponible mediante el contrato interno.`,
  );
}
