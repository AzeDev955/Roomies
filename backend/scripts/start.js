const { spawnSync } = require('node:child_process');

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const run = (label, command, args) => {
  console.log(`[start] ${label}`);

  const result = spawnSync(command, args, {
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`[start] No se pudo ejecutar ${label}:`, result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const seedOnStart = process.env.ROOMIES_SEED_ON_START === 'true';
const forceResetOnStart = process.env.ROOMIES_PRISMA_FORCE_RESET_ON_START === 'true';

const getRailwayEnvironment = () =>
  (
    process.env.ROOMIES_APP_ENV ??
    process.env.RAILWAY_ENVIRONMENT_NAME ??
    process.env.RAILWAY_ENVIRONMENT ??
    ''
  ).toLowerCase();

const canSeedOnStart = () => {
  const railwayEnvironment = getRailwayEnvironment();
  const isRailwayDevelopment = ['development', 'dev', 'desarrollo'].includes(railwayEnvironment);
  const isRailwayNonDevelopment = Boolean(railwayEnvironment) && !isRailwayDevelopment;
  const isLocalProduction = process.env.NODE_ENV === 'production' && !isRailwayDevelopment;

  return !isLocalProduction && !isRailwayNonDevelopment;
};

run(
  forceResetOnStart ? 'prisma db push --force-reset' : 'prisma db push',
  npx,
  [
    'prisma',
    'db',
    'push',
    '--accept-data-loss',
    ...(forceResetOnStart ? ['--force-reset'] : []),
  ],
);

if (seedOnStart && canSeedOnStart()) {
  run('prisma db seed', npx, ['prisma', 'db', 'seed']);
} else if (seedOnStart) {
  console.warn('[start] Seed omitido: ROOMIES_SEED_ON_START no se ejecuta en produccion ni en Railway no-dev.');
}

require('../dist/index.js');
