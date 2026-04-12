const LOCAL_DEV_API_URL = 'http://localhost:3000/api';

type ApiEnv = {
  EXPO_PUBLIC_API_URL?: string;
  NODE_ENV?: string;
};

export function getApiBaseUrl(env: ApiEnv = process.env): string {
  const configuredUrl = env.EXPO_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('EXPO_PUBLIC_API_URL es obligatoria en builds de produccion.');
  }

  return LOCAL_DEV_API_URL;
}
