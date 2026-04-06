import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { enviarNotificacionPush } from './notification.service';
import { RolUsuario } from '../generated/prisma/client';

// Día 1 de cada mes a las 10:00 AM
cron.schedule('0 10 1 * *', async () => {
  console.log('[cron] Ejecutando recordatorio mensual de pago...');

  try {
    const inquilinos = await prisma.usuario.findMany({
      where: {
        rol: RolUsuario.INQUILINO,
        expo_push_token: { not: null },
      },
      select: { id: true },
    });

    if (inquilinos.length === 0) {
      console.log('[cron] No hay inquilinos con push token registrado.');
      return;
    }

    await enviarNotificacionPush(
      inquilinos.map((i) => i.id),
      '📅 Recordatorio de Pago',
      '¡Hola! Recuerda que hoy es día 1. Es momento de gestionar el pago del alquiler de este mes.',
    );

    console.log(`[cron] Recordatorio enviado a ${inquilinos.length} inquilino(s).`);
  } catch (err) {
    console.error('[cron] Error en recordatorio mensual:', err);
  }
});
