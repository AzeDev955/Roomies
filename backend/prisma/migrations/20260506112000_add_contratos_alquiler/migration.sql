CREATE TYPE "EstadoContratoAlquiler" AS ENUM (
  'BORRADOR',
  'PENDIENTE_FIRMA',
  'FIRMADO',
  'RECHAZADO',
  'ANULADO'
);

CREATE TYPE "TipoEventoContratoAlquiler" AS ENUM (
  'CREADO',
  'ENVIADO_FIRMA',
  'FIRMADO',
  'RECHAZADO',
  'ANULADO'
);

CREATE TABLE "ContratoAlquiler" (
  "id" SERIAL NOT NULL,
  "vivienda_id" INTEGER NOT NULL,
  "habitacion_id" INTEGER,
  "casero_id" INTEGER NOT NULL,
  "inquilino_id" INTEGER NOT NULL,
  "version" INTEGER NOT NULL,
  "estado" "EstadoContratoAlquiler" NOT NULL DEFAULT 'BORRADOR',
  "documento_url" TEXT NOT NULL,
  "documento_nombre" TEXT,
  "documento_mime" TEXT,
  "documento_hash" TEXT NOT NULL,
  "renta_mensual" DOUBLE PRECISION NOT NULL,
  "fecha_inicio" TIMESTAMP(3) NOT NULL,
  "fecha_fin" TIMESTAMP(3),
  "notas" TEXT,
  "enviado_en" TIMESTAMP(3),
  "firmado_en" TIMESTAMP(3),
  "rechazado_en" TIMESTAMP(3),
  "anulado_en" TIMESTAMP(3),
  "firma_usuario_id" INTEGER,
  "firma_documento_identidad" TEXT,
  "firma_origen_tecnico" TEXT,
  "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContratoAlquiler_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventoContratoAlquiler" (
  "id" SERIAL NOT NULL,
  "contrato_id" INTEGER NOT NULL,
  "usuario_id" INTEGER NOT NULL,
  "tipo" "TipoEventoContratoAlquiler" NOT NULL,
  "estado_desde" "EstadoContratoAlquiler",
  "estado_hasta" "EstadoContratoAlquiler",
  "origen_tecnico" TEXT,
  "metadata" JSONB,
  "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EventoContratoAlquiler_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContratoAlquiler_vivienda_id_estado_idx" ON "ContratoAlquiler"("vivienda_id", "estado");
CREATE INDEX "ContratoAlquiler_inquilino_id_estado_idx" ON "ContratoAlquiler"("inquilino_id", "estado");
CREATE UNIQUE INDEX "ContratoAlquiler_vivienda_id_habitacion_id_inquilino_id_version_key"
  ON "ContratoAlquiler"("vivienda_id", "habitacion_id", "inquilino_id", "version");
CREATE INDEX "EventoContratoAlquiler_contrato_id_fecha_idx" ON "EventoContratoAlquiler"("contrato_id", "fecha");

ALTER TABLE "ContratoAlquiler"
  ADD CONSTRAINT "ContratoAlquiler_vivienda_id_fkey"
  FOREIGN KEY ("vivienda_id") REFERENCES "Vivienda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContratoAlquiler"
  ADD CONSTRAINT "ContratoAlquiler_habitacion_id_fkey"
  FOREIGN KEY ("habitacion_id") REFERENCES "Habitacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContratoAlquiler"
  ADD CONSTRAINT "ContratoAlquiler_casero_id_fkey"
  FOREIGN KEY ("casero_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ContratoAlquiler"
  ADD CONSTRAINT "ContratoAlquiler_inquilino_id_fkey"
  FOREIGN KEY ("inquilino_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ContratoAlquiler"
  ADD CONSTRAINT "ContratoAlquiler_firma_usuario_id_fkey"
  FOREIGN KEY ("firma_usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EventoContratoAlquiler"
  ADD CONSTRAINT "EventoContratoAlquiler_contrato_id_fkey"
  FOREIGN KEY ("contrato_id") REFERENCES "ContratoAlquiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventoContratoAlquiler"
  ADD CONSTRAINT "EventoContratoAlquiler_usuario_id_fkey"
  FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
