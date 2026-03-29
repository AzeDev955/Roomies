import { prisma } from '../lib/prisma';

function randomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'ROOM-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generarCodigoInvitacion(): Promise<string> {
  while (true) {
    const code = randomCode();
    const exists = await prisma.habitacion.findUnique({
      where: { codigo_invitacion: code },
    });
    if (!exists) return code;
  }
}
