import { getDashboardRoute } from '../authRoutes';

describe('getDashboardRoute', () => {
  it('redirige al dashboard del casero', () => {
    expect(getDashboardRoute('CASERO')).toBe('/casero/viviendas');
  });

  it('redirige al dashboard del inquilino', () => {
    expect(getDashboardRoute('INQUILINO')).toBe('/inquilino/inicio');
  });

  it('rechaza roles no soportados para evitar estados inconsistentes', () => {
    expect(() => getDashboardRoute('ADMIN')).toThrow('Rol de usuario no soportado');
  });
});
