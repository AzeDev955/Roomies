CREATE TABLE "FotoVivienda" (
  "id" SERIAL NOT NULL,
  "vivienda_id" INTEGER NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'backblaze',
  "key" TEXT NOT NULL,
  "url" TEXT,
  "variant" TEXT NOT NULL DEFAULT 'medium',
  "mime_type" TEXT,
  "size" INTEGER,
  "width" INTEGER,
  "height" INTEGER,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "es_portada" BOOLEAN NOT NULL DEFAULT false,
  "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FotoVivienda_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FotoVivienda"
  ADD CONSTRAINT "FotoVivienda_vivienda_id_fkey"
  FOREIGN KEY ("vivienda_id") REFERENCES "Vivienda"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "FotoVivienda_vivienda_id_orden_idx" ON "FotoVivienda"("vivienda_id", "orden");
CREATE INDEX "FotoVivienda_provider_key_idx" ON "FotoVivienda"("provider", "key");
