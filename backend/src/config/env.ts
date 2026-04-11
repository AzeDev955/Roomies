const REQUIRED_ENV_HINTS: Record<string, string> = {
  DATABASE_URL: 'Configura DATABASE_URL para que Prisma pueda conectarse a la base de datos.',
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
