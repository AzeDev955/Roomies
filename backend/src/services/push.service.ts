import { Expo, type ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

const enviarMensajes = async (mensajes: ExpoPushMessage[]) => {
  if (mensajes.length === 0) {
    return;
  }

  const chunks = expo.chunkPushNotifications(mensajes);

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);

      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          console.error('[push] Error en ticket:', ticket.message);
        }
      }
    } catch (error) {
      console.error('[push] Error enviando chunk:', error);
    }
  }
};

export async function enviarNotificacion(
  token: string,
  titulo: string,
  mensaje: string,
  data?: Record<string, unknown>,
): Promise<void> {
  if (!Expo.isExpoPushToken(token)) {
    console.warn(`[push] Token Expo invalido ignorado: ${token}`);
    return;
  }

  await enviarMensajes([
    {
      to: token,
      title: titulo,
      body: mensaje,
      data: data ?? {},
      sound: 'default',
    },
  ]);
}

export async function enviarNotificaciones(
  tokens: string[],
  titulo: string,
  mensaje: string,
  data?: Record<string, unknown>,
): Promise<void> {
  const mensajes = tokens
    .filter((token) => Expo.isExpoPushToken(token))
    .map<ExpoPushMessage>((token) => ({
      to: token,
      title: titulo,
      body: mensaje,
      data: data ?? {},
      sound: 'default',
    }));

  await enviarMensajes(mensajes);
}
