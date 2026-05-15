import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'vitest';

const repoRoot = path.resolve(process.cwd(), '..');

const readRepoFile = (relativePath: string) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8');

const schema = readRepoFile('backend/prisma/schema.prisma');

describe('consistencia del modelo Prisma', () => {
  test('no deja mojibake en schema, seed ni docs backend revisadas', () => {
    const files = [
      'backend/prisma/schema.prisma',
      'backend/prisma/seed.ts',
      'docs/backend/api.md',
      'docs/backend/setup.md',
    ];
    const mojibakePattern = /Ã|Â|â[^\s]?|�/;

    for (const file of files) {
      assert.equal(mojibakePattern.test(readRepoFile(file)), false, `${file} contiene mojibake`);
    }
  });

  test('limita un inquilino a una unica habitacion asignada', () => {
    assert.match(schema, /inquilino_id\s+Int\?\s+@unique/);
    assert.match(
      schema,
      /inquilino\s+Usuario\?\s+@relation\(fields: \[inquilino_id\], references: \[id\], onDelete: SetNull\)/,
    );
  });

  test('evita duplicar deudas por gasto y deudor', () => {
    assert.match(schema, /@@unique\(\[gasto_id, deudor_id\]\)/);
  });

  test('declara cascadas solo para registros dependientes directos', () => {
    assert.match(schema, /gasto\s+Gasto\s+@relation\(fields: \[gasto_id\], references: \[id\], onDelete: Cascade\)/);
    assert.match(
      schema,
      /item\s+ItemInventario\s+@relation\(fields: \[item_id\], references: \[id\], onDelete: Cascade\)/,
    );
    assert.match(
      schema,
      /zona\s+ZonaLimpieza\s+@relation\(fields: \[zona_id\], references: \[id\], onDelete: Cascade\)/,
    );
  });
});
