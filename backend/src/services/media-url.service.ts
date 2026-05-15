import { createMediaStorageProvider } from './media.service';
import type { MediaProvider, MediaVisibility } from './media.types';

type MediaUrlFields = {
  url?: string | null;
  provider?: string | null;
  key?: string | null;
  visibility?: MediaVisibility | null;
};

export async function resolveMediaUrl(fields: MediaUrlFields): Promise<string | null> {
  if (fields.provider !== 'backblaze' || !fields.key) {
    return fields.url ?? null;
  }

  const provider = createMediaStorageProvider();
  const input = {
    provider: fields.provider as MediaProvider,
    key: fields.key,
  };

  if (fields.visibility === 'public') {
    return fields.url ?? provider.getPublicUrl(input);
  }

  return provider.getSignedUrl(input);
}

export async function resolveOptionalMediaUrl(fields: MediaUrlFields): Promise<string | null> {
  try {
    return await resolveMediaUrl(fields);
  } catch (error) {
    console.warn('No se pudo resolver la URL de media.', error);
    return fields.url ?? null;
  }
}
