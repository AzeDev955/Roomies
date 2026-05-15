import assert from 'node:assert/strict';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { describe, test } from 'vitest';
import { BackblazeB2MediaStorageProvider } from '../src/services/backblaze-b2-media.provider';
import { MediaProviderError, type MediaUploadInput } from '../src/services/media.types';

const config = {
  endpoint: 'https://s3.eu-central-003.backblazeb2.com',
  region: 'eu-central-003',
  bucketName: 'roomies-media',
  applicationKeyId: 'key-id',
  applicationKey: 'application-key',
  publicBaseUrl: 'https://cdn.roomies.test/media/',
  signedUrlTtlSeconds: 600,
  cacheControl: 'public, max-age=3600',
};

function uploadInput(overrides: Partial<MediaUploadInput> = {}): MediaUploadInput {
  return {
    buffer: Buffer.from('imagen'),
    fileName: 'Factura Atico 1.png',
    mimeType: 'image/png',
    size: 6,
    purpose: 'expense-invoice',
    visibility: 'private',
    ownerId: 42,
    viviendaId: 7,
    metadata: { origen: 'test' },
    ...overrides,
  };
}

describe('BackblazeB2MediaStorageProvider', () => {
  test('sube objetos con content type, cache control, metadata y key consistente', async () => {
    const sentCommands: unknown[] = [];
    const provider = new BackblazeB2MediaStorageProvider({
      config,
      client: {
        async send(command) {
          sentCommands.push(command);
          return {};
        },
      },
    });

    const media = await provider.upload(uploadInput({ visibility: 'public' }));
    const command = sentCommands[0] as PutObjectCommand;
    const input = command.input;

    assert.ok(command instanceof PutObjectCommand);
    assert.equal(input.Bucket, 'roomies-media');
    assert.match(String(input.Key), /^expense-invoice\/vivienda-7\/owner-42\/\d{4}-\d{2}-\d{2}\/factura-atico-1-/);
    assert.equal(input.ContentType, 'image/png');
    assert.equal(input.CacheControl, 'public, max-age=3600');
    assert.deepEqual(input.Metadata, {
      purpose: 'expense-invoice',
      visibility: 'public',
      ownerId: '42',
      viviendaId: '7',
      origen: 'test',
    });
    assert.equal(media.provider, 'backblaze');
    assert.equal(media.url, `https://cdn.roomies.test/media/${media.key}`);
  });

  test('borra objetos Backblaze por key', async () => {
    let deletedKey: string | undefined;
    const provider = new BackblazeB2MediaStorageProvider({
      config,
      client: {
        async send(command) {
          assert.ok(command instanceof DeleteObjectCommand);
          deletedKey = command.input.Key;
          return {};
        },
      },
    });

    await provider.delete({ provider: 'backblaze', key: 'expense-invoice/vivienda-7/factura.png' });

    assert.equal(deletedKey, 'expense-invoice/vivienda-7/factura.png');
  });

  test('genera URLs firmadas con el TTL configurado', async () => {
    const provider = new BackblazeB2MediaStorageProvider({
      config,
      client: {
        async send() {
          throw new Error('no debe llamar send para firmar');
        },
      },
      async signedUrlFactory(_client, command, options) {
        assert.ok(command instanceof GetObjectCommand);
        assert.equal(command.input.Bucket, 'roomies-media');
        assert.equal(command.input.Key, 'private/key.pdf');
        assert.equal(options.expiresIn, 600);
        return 'https://signed.example/key.pdf';
      },
    });

    const url = await provider.getSignedUrl({ provider: 'backblaze', key: 'private/key.pdf' });

    assert.equal(url, 'https://signed.example/key.pdf');
  });

  test('lee metadata funcional desde HeadObject', async () => {
    const provider = new BackblazeB2MediaStorageProvider({
      config,
      client: {
        async send(command) {
          assert.ok(command instanceof HeadObjectCommand);
          return {
            ContentType: 'application/pdf',
            ContentLength: 120,
            Metadata: {
              purpose: 'rental-contract',
              visibility: 'private',
              ownerId: '42',
            },
          };
        },
      },
    });

    const metadata = await provider.getMetadata({ provider: 'backblaze', key: 'contracts/one.pdf' });

    assert.equal(metadata.mimeType, 'application/pdf');
    assert.equal(metadata.size, 120);
    assert.equal(metadata.purpose, 'rental-contract');
    assert.equal(metadata.visibility, 'private');
  });

  test('traduce errores S3 a errores controlados de media', async () => {
    const provider = new BackblazeB2MediaStorageProvider({
      config,
      client: {
        async send() {
          throw new Error('AccessDenied: forbidden');
        },
      },
    });

    await assert.rejects(
      () => provider.upload(uploadInput()),
      (error) => error instanceof MediaProviderError && error.code === 'MEDIA_UPLOAD_FAILED',
    );
  });
});
