import { prisma } from '../lib/prisma';
import { enviarNotificaciones } from './push.service';

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

  const tokens = usuarios
    .map((usuario) => usuario.expo_push_token)
    .filter((token): token is string => Boolean(token));

  await enviarNotificaciones(tokens, titulo, cuerpo, data);
}
