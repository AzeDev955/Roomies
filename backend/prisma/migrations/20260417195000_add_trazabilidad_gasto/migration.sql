ALTER TABLE "Gasto"
ADD COLUMN "fecha_modificacion" TIMESTAMP(3),
ADD COLUMN "modificado_por_id" INTEGER;

ALTER TABLE "Gasto"
ADD CONSTRAINT "Gasto_modificado_por_id_fkey"
FOREIGN KEY ("modificado_por_id")
REFERENCES "Usuario"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
