import assert from 'node:assert/strict';
import { beforeEach, describe, test, vi } from 'vitest';

const getPublicUrlMock = vi.hoisted(() => vi.fn());
const getSignedUrlMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/media.service', () => ({
  createMediaStorageProvider: () => ({
    getPublicUrl: getPublicUrlMock,
    getSignedUrl: getSignedUrlMock,
  }),
}));

const {
  getUploadVisibilityForPurpose,
  resolveMediaUrl,
  resolveOptionalMediaUrl,
} = await import('../src/services/media-serving.service');

describe('media serving service', () => {
  beforeEach(() => {
    getPublicUrlMock.mockReset();
    getSignedUrlMock.mockReset();
    delete process.env.MEDIA_PRIVATE_SIGNED_URL_TTL_SECONDS;
    delete process.env.MEDIA_SHARED_SIGNED_URL_TTL_SECONDS;
  });

  test('sirve fotos compartidas de inventario con URL firmada y subida privada', async () => {
    getSignedUrlMock.mockResolvedValue('https://signed.roomies.test/inventory.webp');

    const url = await resolveMediaUrl({
      provider: 'backblaze',
      key: 'inventory-photo/vivienda-7/foto.webp',
      url: 'https://stale.example/inventory.webp',
      purpose: 'inventory-photo',
    });

    assert.equal(getUploadVisibilityForPurpose('inventory-photo'), 'private');
    assert.equal(url, 'https://signed.roomies.test/inventory.webp');
    assert.equal(getPublicUrlMock.mock.calls.length, 0);
    assert.deepEqual(getSignedUrlMock.mock.calls[0]?.[0], {
      provider: 'backblaze',
      key: 'inventory-photo/vivienda-7/foto.webp',
      expiresInSeconds: 900,
    });
  });

  test('sirve documentos privados con TTL privado configurable', async () => {
    process.env.MEDIA_PRIVATE_SIGNED_URL_TTL_SECONDS = '120';
    getSignedUrlMock.mockResolvedValue('https://signed.roomies.test/factura.pdf');

    const url = await resolveMediaUrl({
      provider: 'backblaze',
      key: 'expense-invoice/vivienda-7/factura.pdf',
      purpose: 'expense-invoice',
    });

    assert.equal(url, 'https://signed.roomies.test/factura.pdf');
    assert.equal(getSignedUrlMock.mock.calls[0]?.[0].expiresInSeconds, 120);
  });

  test('sirve media publica con URL publica del proveedor', async () => {
    getPublicUrlMock.mockResolvedValue('https://cdn.roomies.test/listing.webp');

    const url = await resolveMediaUrl({
      provider: 'backblaze',
      key: 'listing-photo/vivienda-7/hero.webp',
      purpose: 'listing-photo',
    });

    assert.equal(getUploadVisibilityForPurpose('listing-photo'), 'public');
    assert.equal(url, 'https://cdn.roomies.test/listing.webp');
    assert.equal(getSignedUrlMock.mock.calls.length, 0);
  });

  test('no reutiliza URLs legacy cuando falla la firma de un privado Backblaze', async () => {
    getSignedUrlMock.mockRejectedValue(new Error('firma no disponible'));

    const url = await resolveOptionalMediaUrl({
      provider: 'backblaze',
      key: 'payment-proof/vivienda-7/justificante.webp',
      url: 'https://old-public.example/justificante.webp',
      purpose: 'payment-proof',
    });

    assert.equal(url, null);
  });
});
