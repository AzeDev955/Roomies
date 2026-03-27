import type { RolUsuario } from '../../generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        rol: RolUsuario;
      };
    }
  }
}

export {};
