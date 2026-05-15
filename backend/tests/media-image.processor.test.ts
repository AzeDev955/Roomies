import assert from 'node:assert/strict';
import sharp from 'sharp';
import { describe, test } from 'vitest';
import { processImageForUpload } from '../src/services/media-image.processor';
import { MediaProviderError } from '../src/services/media.types';

async function createPng(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: '#67c6a3',
    },
  })
    .png()
    .toBuffer();
}

describe('processImageForUpload', () => {
  test('convierte una imagen valida a variantes WebP listas para subir', async () => {
    const buffer = await createPng(1200, 600);

    const variants = await processImageForUpload({
      buffer,
      fileName: 'Salon Principal.png',
      mimeType: 'image/png',
      size: buffer.length,
      purpose: 'inventory-photo',
      ownerId: 42,
      viviendaId: 7,
      webpQuality: 80,
    });

    assert.deepEqual(
      variants.map((variant) => variant.variant),
      ['thumb', 'medium', 'large'],
    );
    assert.deepEqual(
      variants.map((variant) => variant.width),
      [300, 800, 1200],
    );
    assert.equal(variants[0].height, 150);
    assert.equal(variants[1].height, 400);
    assert.equal(variants[2].height, 600);

    for (const variant of variants) {
      assert.equal(variant.mimeType, 'image/webp');
      assert.ok(variant.size > 0);
      assert.ok(variant.buffer.length > 0);
      assert.match(variant.suggestedKey, /^inventory-photo\/vivienda-7\/owner-42\/\d{4}-\d{2}-\d{2}\/salon-principal-/);
      assert.equal(variant.metadata.webpQuality, 80);
      assert.equal(variant.metadata.originalMimeType, 'image/png');
    }
  });

  test('no agranda imagenes pequenas al generar variantes', async () => {
    const buffer = await createPng(180, 90);

    const variants = await processImageForUpload({
      buffer,
      fileName: 'thumb.webp',
      mimeType: 'image/webp',
      size: buffer.length,
      purpose: 'payment-proof',
      ownerId: 3,
    });

    assert.deepEqual(
      variants.map((variant) => variant.width),
      [180, 180, 180],
    );
    assert.deepEqual(
      variants.map((variant) => variant.height),
      [90, 90, 90],
    );
  });

  test('conserva el original solo cuando se pide explicitamente', async () => {
    const buffer = await createPng(400, 200);

    const variants = await processImageForUpload({
      buffer,
      fileName: 'contrato.png',
      mimeType: 'image/png',
      size: buffer.length,
      purpose: 'rental-contract',
      ownerId: 9,
      keepOriginal: true,
    });

    assert.equal(variants[0].variant, 'original');
    assert.equal(variants[0].mimeType, 'image/png');
    assert.equal(variants[0].buffer, buffer);
  });

  test('rechaza tipos no permitidos con error controlado', async () => {
    await assert.rejects(
      () =>
        processImageForUpload({
          buffer: Buffer.from('pdf'),
          fileName: 'factura.pdf',
          mimeType: 'application/pdf',
          size: 3,
          purpose: 'expense-invoice',
          ownerId: 1,
        }),
      (error) => error instanceof MediaProviderError && error.code === 'MEDIA_UNSUPPORTED_TYPE',
    );
  });

  test('rechaza imagenes demasiado pesadas con error controlado', async () => {
    const buffer = await createPng(20, 20);

    await assert.rejects(
      () =>
        processImageForUpload({
          buffer,
          fileName: 'foto.png',
          mimeType: 'image/png',
          size: buffer.length,
          purpose: 'inventory-photo',
          ownerId: 1,
          maxSizeBytes: 1,
        }),
      (error) => error instanceof MediaProviderError && error.code === 'MEDIA_FILE_TOO_LARGE',
    );
  });
});
