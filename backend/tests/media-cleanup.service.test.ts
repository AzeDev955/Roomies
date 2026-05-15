import assert from 'node:assert/strict';
import { beforeEach, describe, test, vi } from 'vitest';
import { MediaProviderError } from '../src/services/media.types';

const deleteMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/media.service', () => ({
  createMediaStorageProvider: () => ({
    delete: deleteMock,
  }),
}));

const { cleanupMediaReferences, expandImageVariantKeys } = await import('../src/services/media-cleanup.service');

describe('media cleanup service', () => {
  beforeEach(() => {
    deleteMock.mockReset();
  });

  test('expande variantes nuevas de imagen para borrado consistente', () => {
    const keys = expandImageVariantKeys(
      'inventory-photo/vivienda-7/owner-42/2026-05-15/sofa-uuid-medium.webp',
    );

    assert.deepEqual(keys, [
      'inventory-photo/vivienda-7/owner-42/2026-05-15/sofa-uuid-thumb.webp',
      'inventory-photo/vivienda-7/owner-42/2026-05-15/sofa-uuid-medium.webp',
      'inventory-photo/vivienda-7/owner-42/2026-05-15/sofa-uuid-large.webp',
      'inventory-photo/vivienda-7/owner-42/2026-05-15/sofa-uuid-original.jpg',
      'inventory-photo/vivienda-7/owner-42/2026-05-15/sofa-uuid-original.jpeg',
      'inventory-photo/vivienda-7/owner-42/2026-05-15/sofa-uuid-original.png',
      'inventory-photo/vivienda-7/owner-42/2026-05-15/sofa-uuid-original.webp',
    ]);
  });

  test('borra solo objetos Backblaze y tolera objetos ya inexistentes', async () => {
    deleteMock.mockImplementation(async ({ key }: { key: string }) => {
      if (key.endsWith('large.webp')) {
        throw new MediaProviderError('MEDIA_NOT_FOUND', 'No existe.');
      }
    });

    const result = await cleanupMediaReferences([
      { provider: 'external', key: 'legacy/public-id' },
      { provider: 'backblaze', key: 'payment-proof/vivienda-7/owner-2/2026-05-15/ticket-abc-medium.webp' },
    ], { includeImageVariants: true });

    assert.equal(result.failed.length, 0);
    assert.equal(deleteMock.mock.calls.length, 7);
    assert.equal(deleteMock.mock.calls[0]?.[0].provider, 'backblaze');
  });

  test('registra fallos controlados sin lanzar error', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    deleteMock.mockRejectedValueOnce(new MediaProviderError('MEDIA_DELETE_FAILED', 'denied secret-token'));

    const result = await cleanupMediaReferences([
      { provider: 'backblaze', key: 'expense-invoice/vivienda-7/factura.pdf' },
    ], { context: 'test' });

    assert.equal(result.failed.length, 1);
    assert.equal(result.failed[0]?.code, 'MEDIA_DELETE_FAILED');
    assert.equal(warn.mock.calls.length, 1);
    assert.equal(warn.mock.calls[0]?.[0], 'Limpieza de media pendiente.');
    warn.mockRestore();
  });
});
