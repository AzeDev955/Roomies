import cron from 'node-cron';
import { EstadoDeuda } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { enviarNotificacion } from '../services/push.service';

let cronRecordatoriosMorososIniciado = false;

const formatearImporte = (importe: number) => {
  const importeNormalizado = Number.isInteger(importe)
    ? importe.toString()
    : importe.toFixed(2).replace('.', ',');

  return `${importeNormalizado}€`;
};

const formatearNombre = (nombre: string, apellidos?: string | null) =>
  [nombre, apellidos].filter(Boolean).join(' ');

export const enviarRecordatoriosMorosos = async () => {
  const deudasPendientes = await prisma.deuda.findMany({
    where: {
      estado: EstadoDeuda.PENDIENTE,
      deudor: {
        expo_push_token: {
          not: null,
        },
      },
    },
    select: {
      id: true,
      importe: true,
      deudor: {
        select: {
          expo_push_token: true,
        },
      },
      acreedor: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
        },
      },
    },
  });

  if (deudasPendientes.length === 0) {
    console.log('[cron] No hay deudas pendientes con push token registrado.');
    return;
  }

  console.log(`[cron] Enviando ${deudasPendientes.length} recordatorio(s) de deuda pendiente.`);

  for (const deuda of deudasPendientes) {
    const token = deuda.deudor.expo_push_token;

    if (!token) {
      continue;
    }

    const nombreAcreedor = formatearNombre(deuda.acreedor.nombre, deuda.acreedor.apellidos);
    const mensaje = `Tienes un pago de ${formatearImporte(deuda.importe)} con ${nombreAcreedor} pendiente de realizar`;

    try {
      await enviarNotificacion(token, 'Pago pendiente', mensaje, {
        deudaId: deuda.id,
        acreedorId: deuda.acreedor.id,
        tipo: 'recordatorio_deuda_pendiente',
      });
    } catch (error) {
      console.error(`[cron] Error enviando recordatorio de la deuda ${deuda.id}:`, error);
    }
  }
};

export const iniciarCronRecordatoriosMorosos = () => {
  if (cronRecordatoriosMorososIniciado) {
    return;
  }

  cron.schedule('0 12 5 * *', async () => {
    console.log('[cron] Ejecutando recordatorio mensual de pagos pendientes...');
    await enviarRecordatoriosMorosos();
  });

  cronRecordatoriosMorososIniciado = true;
  console.log('[cron] Recordatorio mensual de pagos pendientes programado para el dia 5 de cada mes a las 12:00.');
};
