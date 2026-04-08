import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from '../lib/prisma';

const expo = new Expo();

export async function enviarNotificacionPush(
  userIds: number[],
  titulo: string,
  cuerpo: string,
  data?: Record<string, unknown>
): Promise<void> {
  const usuarios = await prisma.usuario.findMany({
    where: { id: { in: userIds } },
    select: { expo_push_token: true },
  });

  const mensajes: ExpoPushMessage[] = usuarios
    .map((u) => u.expo_push_token)
    .filter((token): token is string => !!token && Expo.isExpoPushToken(token))
    .map((token) => ({
      to: token,
      title: titulo,
      body: cuerpo,
      data: data ?? {},
      sound: 'default' as const,
    }));

  if (mensajes.length === 0) return;

  const chunks = expo.chunkPushNotifications(mensajes);

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          console.error('[push] Error en ticket:', ticket.message);
        }
      }
    } catch (err) {
      console.error('[push] Error enviando chunk:', err);
    }
  }
}
