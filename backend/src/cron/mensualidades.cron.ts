import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { crearGastoDividido } from '../services/gasto.service';

let cronMensualidadesIniciado = false;

export const procesarMensualidadesDelDia = async () => {
  const diaActual = new Date().getDate();

  const gastosRecurrentes = await prisma.gastoRecurrente.findMany({
    where: {
      activo: true,
      dia_del_mes: diaActual,
    },
  });

  if (gastosRecurrentes.length === 0) {
    console.log(`[cron] No hay mensualidades pendientes para el día ${diaActual}.`);
    return;
  }

  console.log(`[cron] Procesando ${gastosRecurrentes.length} mensualidad(es) del día ${diaActual}.`);

  for (const gastoRecurrente of gastosRecurrentes) {
    try {
      await crearGastoDividido({
        concepto: gastoRecurrente.concepto,
        importe: gastoRecurrente.importe,
        tipo: gastoRecurrente.tipo,
        viviendaId: gastoRecurrente.vivienda_id,
        pagadorId: gastoRecurrente.pagador_id,
      });

      console.log(
        `[cron] Mensualidad ${gastoRecurrente.id} convertida en gasto para vivienda ${gastoRecurrente.vivienda_id}.`,
      );
    } catch (error) {
      console.error(
        `[cron] Error procesando mensualidad ${gastoRecurrente.id}:`,
        error,
      );
    }
  }
};

export const iniciarCronMensualidades = () => {
  if (cronMensualidadesIniciado) {
    return;
  }

  cron.schedule('0 2 * * *', async () => {
    console.log('[cron] Ejecutando motor de mensualidades...');
    await procesarMensualidadesDelDia();
  });

  cronMensualidadesIniciado = true;
  console.log('[cron] Motor de mensualidades programado para las 02:00.');
};
