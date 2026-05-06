CREATE TYPE "EstadoPeriodoOcupacion" AS ENUM (
  'ACTIVO',
  'FINALIZADO',
  'PENDIENTE_REVISION'
);

CREATE TYPE "OrigenPeriodoOcupacion" AS ENUM (
  'CONTRATO_FIRMADO',
  'ALTA_MANUAL',
  'INFERIDO_CARGO_ALQUILER',
  'MIGRADO'
);

CREATE TABLE "PeriodoOcupacion" (
  "id" SERIAL NOT NULL,
  "vivienda_id" INTEGER NOT NULL,
  "habitacion_id" INTEGER,
  "inquilino_id" INTEGER NOT NULL,
  "contrato_id" INTEGER,
  "fecha_inicio" TIMESTAMP(3) NOT NULL,
  "fecha_fin" TIMESTAMP(3),
  "estado" "EstadoPeriodoOcupacion" NOT NULL DEFAULT 'ACTIVO',
  "origen" "OrigenPeriodoOcupacion" NOT NULL,
  "renta_mensual" DOUBLE PRECISION,
  "requiere_revision" BOOLEAN NOT NULL DEFAULT false,
  "notas" TEXT,
  "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PeriodoOcupacion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PeriodoOcupacion_vivienda_id_fecha_inicio_idx" ON "PeriodoOcupacion"("vivienda_id", "fecha_inicio");
CREATE INDEX "PeriodoOcupacion_habitacion_id_fecha_inicio_idx" ON "PeriodoOcupacion"("habitacion_id", "fecha_inicio");
CREATE INDEX "PeriodoOcupacion_inquilino_id_fecha_inicio_idx" ON "PeriodoOcupacion"("inquilino_id", "fecha_inicio");
CREATE INDEX "PeriodoOcupacion_contrato_id_idx" ON "PeriodoOcupacion"("contrato_id");

ALTER TABLE "PeriodoOcupacion"
  ADD CONSTRAINT "PeriodoOcupacion_vivienda_id_fkey"
  FOREIGN KEY ("vivienda_id") REFERENCES "Vivienda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PeriodoOcupacion"
  ADD CONSTRAINT "PeriodoOcupacion_habitacion_id_fkey"
  FOREIGN KEY ("habitacion_id") REFERENCES "Habitacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PeriodoOcupacion"
  ADD CONSTRAINT "PeriodoOcupacion_inquilino_id_fkey"
  FOREIGN KEY ("inquilino_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PeriodoOcupacion"
  ADD CONSTRAINT "PeriodoOcupacion_contrato_id_fkey"
  FOREIGN KEY ("contrato_id") REFERENCES "ContratoAlquiler"("id") ON DELETE SET NULL ON UPDATE CASCADE;
