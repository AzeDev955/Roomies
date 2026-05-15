export type RolUsuario = 'CASERO' | 'INQUILINO';
export type DashboardRoute = '/casero/viviendas' | '/inquilino/inicio';

export function getDashboardRoute(rol: string | null | undefined): DashboardRoute {
  if (rol === 'CASERO') {
    return '/casero/viviendas';
  }

  if (rol === 'INQUILINO') {
    return '/inquilino/inicio';
  }

  throw new Error(`Rol de usuario no soportado: ${rol ?? 'sin rol'}`);
}
