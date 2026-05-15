export type ModulosVivienda = {
  mod_limpieza: boolean;
  mod_gastos: boolean;
  mod_inventario: boolean;
};

export type ModulosViviendaActualizados = {
  viviendaId: number;
  modulos: ModulosVivienda;
};

type Listener = (event: ModulosViviendaActualizados) => void;

const listeners = new Set<Listener>();

export const onModulosViviendaActualizados = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const notificarModulosViviendaActualizados = (event: ModulosViviendaActualizados) => {
  listeners.forEach((listener) => listener(event));
};
