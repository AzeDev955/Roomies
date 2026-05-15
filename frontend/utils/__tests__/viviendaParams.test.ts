import { extractViviendaIdFromPath, resolveViviendaIdParam } from '../viviendaParams';

describe('viviendaParams', () => {
  it('extrae el id de vivienda desde tabs anidados', () => {
    expect(extractViviendaIdFromPath('/casero/vivienda/42/tablon')).toBe('42');
  });

  it('extrae el id de vivienda desde pantallas hijas', () => {
    expect(extractViviendaIdFromPath('/casero/vivienda/42/editar-habitacion')).toBe('42');
  });

  it('prioriza la ruta real sobre un params.id contaminado por otra pantalla dinamica', () => {
    expect(resolveViviendaIdParam('999', '/casero/vivienda/42/incidencias')).toBe('42');
  });

  it('usa params.id como fallback cuando no hay segmento vivienda', () => {
    expect(resolveViviendaIdParam(['77'], '/casero/viviendas')).toBe('77');
  });

  it('devuelve undefined para parametros vacios', () => {
    expect(resolveViviendaIdParam('', '/casero/viviendas')).toBeUndefined();
  });
});
