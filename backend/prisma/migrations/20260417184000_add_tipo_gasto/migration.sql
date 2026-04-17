CREATE TYPE "TipoGasto" AS ENUM (
  'ENTRE_COMPANEROS',
  'FACTURA_PUNTUAL',
  'FACTURA_MENSUAL',
  'CARGO_RECURRENTE'
);

ALTER TABLE "Gasto"
ADD COLUMN "tipo" "TipoGasto" NOT NULL DEFAULT 'ENTRE_COMPANEROS';

ALTER TABLE "GastoRecurrente"
ADD COLUMN "tipo" "TipoGasto" NOT NULL DEFAULT 'FACTURA_MENSUAL';

UPDATE "Gasto"
SET "tipo" = 'FACTURA_PUNTUAL'
FROM "Vivienda"
WHERE "Gasto"."vivienda_id" = "Vivienda"."id"
  AND "Gasto"."pagador_id" = "Vivienda"."casero_id";
