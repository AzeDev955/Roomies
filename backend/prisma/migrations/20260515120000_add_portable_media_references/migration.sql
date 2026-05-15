-- Referencias portables de media para desacoplar la URL publica del proveedor.
-- Los campos *_url se conservan como contrato de lectura para clientes actuales.

ALTER TABLE "Gasto"
  ADD COLUMN "factura_provider" TEXT,
  ADD COLUMN "factura_key" TEXT,
  ADD COLUMN "factura_variant" TEXT,
  ADD COLUMN "factura_mime_type" TEXT,
  ADD COLUMN "factura_size" INTEGER;

UPDATE "Gasto"
SET
  "factura_provider" = 'external',
  "factura_key" = "factura_url",
  "factura_variant" = 'original'
WHERE "factura_url" IS NOT NULL;

ALTER TABLE "Deuda"
  ADD COLUMN "justificante_provider" TEXT,
  ADD COLUMN "justificante_key" TEXT,
  ADD COLUMN "justificante_variant" TEXT,
  ADD COLUMN "justificante_mime_type" TEXT,
  ADD COLUMN "justificante_size" INTEGER,
  ADD COLUMN "justificante_width" INTEGER,
  ADD COLUMN "justificante_height" INTEGER;

UPDATE "Deuda"
SET
  "justificante_provider" = 'external',
  "justificante_key" = "justificante_url",
  "justificante_variant" = 'original'
WHERE "justificante_url" IS NOT NULL;

ALTER TABLE "FotoAsset"
  ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'cloudinary',
  ADD COLUMN "key" TEXT,
  ADD COLUMN "variant" TEXT NOT NULL DEFAULT 'original',
  ADD COLUMN "mime_type" TEXT,
  ADD COLUMN "size" INTEGER,
  ADD COLUMN "width" INTEGER,
  ADD COLUMN "height" INTEGER;

UPDATE "FotoAsset"
SET "key" = "url"
WHERE "key" IS NULL;

ALTER TABLE "FotoAsset"
  ALTER COLUMN "key" SET NOT NULL,
  ALTER COLUMN "url" DROP NOT NULL;

CREATE INDEX "FotoAsset_provider_key_idx" ON "FotoAsset"("provider", "key");

ALTER TABLE "ContratoAlquiler"
  ADD COLUMN "documento_provider" TEXT,
  ADD COLUMN "documento_key" TEXT,
  ADD COLUMN "documento_variant" TEXT,
  ADD COLUMN "documento_size" INTEGER;

UPDATE "ContratoAlquiler"
SET
  "documento_provider" = 'external',
  "documento_key" = "documento_url",
  "documento_variant" = 'original'
WHERE "documento_url" IS NOT NULL;
