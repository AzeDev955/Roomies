ALTER TYPE "TipoGasto" ADD VALUE IF NOT EXISTS 'ALQUILER_HABITACION';

ALTER TABLE "Gasto"
ADD COLUMN "periodo_facturacion" TEXT,
ADD COLUMN "habitacion_cargo_id" INTEGER,
ADD COLUMN "inquilino_cargo_id" INTEGER;

ALTER TABLE "Gasto"
ADD CONSTRAINT "Gasto_habitacion_cargo_id_fkey"
FOREIGN KEY ("habitacion_cargo_id")
REFERENCES "Habitacion"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Gasto"
ADD CONSTRAINT "Gasto_inquilino_cargo_id_fkey"
FOREIGN KEY ("inquilino_cargo_id")
REFERENCES "Usuario"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Gasto_tipo_periodo_habitacion_inquilino_key"
ON "Gasto"("tipo", "periodo_facturacion", "habitacion_cargo_id", "inquilino_cargo_id");
