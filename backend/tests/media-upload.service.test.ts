import assert from 'node:assert/strict';
import { beforeEach, describe, test, vi } from 'vitest';
import type { MediaUploadInput } from '../src/services/media.types';

const uploadMock = vi.hoisted(() => vi.fn());
const getSignedUrlMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/media.service', () => ({
  createMediaStorageProvider: () => ({
    upload: uploadMock,
    getSignedUrl: getSignedUrlMock,
  }),
}));

const { uploadDocumentMedia } = await import('../src/services/media-upload.service');

describe('media upload service', () => {
  beforeEach(() => {
    uploadMock.mockReset();
    getSignedUrlMock.mockReset();
  });

  test('sube documentos financieros a Backblaze como privados', async () => {
    uploadMock.mockImplementation(async (input: MediaUploadInput) => ({
      provider: 'backblaze',
      key: 'expense-invoice/vivienda-7/owner-42/factura.pdf',
      url: null,
      variant: 'original',
      mimeType: input.mimeType,
      size: input.size,
      width: null,
      height: null,
      visibility: input.visibility,
      purpose: input.purpose,
    }));
    getSignedUrlMock.mockResolvedValue('https://signed.roomies.test/factura.pdf');

    const media = await uploadDocumentMedia({
      file: {
        buffer: Buffer.from('pdf'),
        originalname: 'factura.pdf',
        mimetype: 'application/pdf',
        size: 3,
      } as Express.Multer.File,
      purpose: 'expense-invoice',
      visibility: 'private',
      ownerId: 42,
      viviendaId: 7,
    });

    assert.equal(uploadMock.mock.calls.length, 1);
    assert.equal(uploadMock.mock.calls[0]?.[0].purpose, 'expense-invoice');
    assert.equal(uploadMock.mock.calls[0]?.[0].visibility, 'private');
    assert.equal(uploadMock.mock.calls[0]?.[0].ownerId, 42);
    assert.equal(getSignedUrlMock.mock.calls[0]?.[0].key, 'expense-invoice/vivienda-7/owner-42/factura.pdf');
    assert.equal(media?.provider, 'backblaze');
    assert.equal(media?.url, 'https://signed.roomies.test/factura.pdf');
  });
});
