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

const normalized = (value) => (value ?? '').toLowerCase();
const railwayEnvironment = normalized(
  process.env.RAILWAY_ENVIRONMENT_NAME ?? process.env.RAILWAY_ENVIRONMENT,
);
const seedOnStart = process.env.ROOMIES_SEED_ON_START === 'true';
const isRailwayDevelopment = ['development', 'dev', 'desarrollo'].includes(railwayEnvironment);

run('prisma db push', npx, ['prisma', 'db', 'push', '--accept-data-loss']);

if (isRailwayDevelopment || seedOnStart) {
  run('prisma db seed', npx, ['prisma', 'db', 'seed']);
}

require('../dist/index.js');
