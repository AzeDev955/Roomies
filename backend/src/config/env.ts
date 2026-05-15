const REQUIRED_ENV_HINTS: Record<string, string> = {
  DATABASE_URL: 'Configura DATABASE_URL para que Prisma pueda conectarse a la base de datos.',
  B2_APPLICATION_KEY: 'Configura la application key de Backblaze B2 para usar el proveedor de media.',
  B2_APPLICATION_KEY_ID: 'Configura el key id de Backblaze B2 para usar el proveedor de media.',
  B2_BUCKET_NAME: 'Configura el bucket de Backblaze B2 para usar el proveedor de media.',
  B2_ENDPOINT: 'Configura el endpoint S3-compatible de Backblaze B2.',
  B2_REGION: 'Configura la region S3-compatible de Backblaze B2.',
  GOOGLE_CLIENT_ID: 'Configura GOOGLE_CLIENT_ID antes de aceptar tokens de Google OAuth.',
  JWT_SECRET: 'Configura JWT_SECRET con una cadena larga y aleatoria antes de arrancar el backend.',
};

export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    const hint = REQUIRED_ENV_HINTS[name] ?? 'Define la variable de entorno requerida.';
    throw new Error(`[config] Falta variable critica ${name}. ${hint}`);
  }

  return value;
}

export function getJwtSecret(): string {
  return getRequiredEnv('JWT_SECRET');
}

export function getGoogleClientId(): string {
  return getRequiredEnv('GOOGLE_CLIENT_ID');
}

export function assertCriticalEnv(): void {
  getRequiredEnv('DATABASE_URL');
  getJwtSecret();
}
