export type TutorialRole = 'CASERO' | 'INQUILINO';

export type TutorialStep = {
  id: string;
  route: string;
  targetId: string;
  title: string;
  description: string;
};

type CaseroTutorialOptions = {
  hasGastos: boolean;
};

type InquilinoTutorialOptions = {
  hasVivienda: boolean;
  hasGastos: boolean;
};

export const TUTORIAL_VERSION = 'v1';

export function buildCaseroTutorialSteps({
  hasGastos,
}: CaseroTutorialOptions): TutorialStep[] {
  const steps: TutorialStep[] = [
    {
      id: 'casero-viviendas-main',
      route: '/casero/viviendas',
      targetId: 'casero.viviendas.main',
      title: 'Tus viviendas, de un vistazo',
      description:
        'Aqui veras todas tus propiedades y podras entrar al detalle de cada una para gestionar habitaciones, incidencias y anuncios.',
    },
    {
      id: 'casero-viviendas-action',
      route: '/casero/viviendas',
      targetId: 'casero.viviendas.action',
      title: 'Empieza creando o ampliando',
      description:
        'Usa esta accion para añadir una vivienda nueva y empezar a invitar inquilinos sin perder el contexto.',
    },
  ];

  if (hasGastos) {
    steps.push({
      id: 'casero-cobros-main',
      route: '/casero/cobros',
      targetId: 'casero.cobros.main',
      title: 'Controla cobros y facturas',
      description:
        'Este panel resume lo pendiente, lo pagado y las facturas emitidas para cada vivienda con modulo de gastos activo.',
    });
  }

  steps.push(
    {
      id: 'perfil-apariencia',
      route: '/casero/perfil',
      targetId: 'perfil.apariencia',
      title: 'Ajusta la app a tu gusto',
      description:
        'Desde aqui puedes cambiar la apariencia para que Roomies se adapte mejor a tu forma de usarla.',
    },
    {
      id: 'perfil-tutorial',
      route: '/casero/perfil',
      targetId: 'perfil.tutorial',
      title: 'Vuelve al tutorial cuando quieras',
      description:
        'Si necesitas refrescar el recorrido o enseñarselo a otra persona, puedes lanzarlo otra vez desde esta seccion.',
    },
  );

  return steps;
}

export function buildInquilinoTutorialSteps({
  hasVivienda,
  hasGastos,
}: InquilinoTutorialOptions): TutorialStep[] {
  if (!hasVivienda) {
    return [
      {
        id: 'inquilino-onboarding-main',
        route: '/inquilino/inicio',
        targetId: 'inquilino.inicio.main',
        title: 'Tu punto de entrada',
        description:
          'Introduce aqui el codigo de invitacion que te comparta tu casero para entrar en tu habitacion y desbloquear el resto de modulos.',
      },
      {
        id: 'perfil-apariencia',
        route: '/inquilino/perfil',
        targetId: 'perfil.apariencia',
        title: 'Personaliza la experiencia',
        description:
          'Desde perfil puedes cambiar la apariencia y revisar tus datos cuando lo necesites.',
      },
      {
        id: 'perfil-tutorial',
        route: '/inquilino/perfil',
        targetId: 'perfil.tutorial',
        title: 'Repite la guia cuando quieras',
        description:
          'Si mas adelante quieres recordar el funcionamiento de la app, puedes abrir esta guia de nuevo desde aqui.',
      },
    ];
  }

  const steps: TutorialStep[] = [
    {
      id: 'inquilino-inicio-main',
      route: '/inquilino/inicio',
      targetId: 'inquilino.inicio.main',
      title: 'Asi se ve tu vivienda',
      description:
        'En esta pantalla tienes el resumen de tu habitacion, tus companeros y las zonas comunes para orientarte rapidamente.',
    },
    {
      id: 'inquilino-inicio-incidencias',
      route: '/inquilino/inicio',
      targetId: 'inquilino.inicio.incidencias',
      title: 'Sigue y reporta incidencias',
      description:
        'Aqui podras revisar problemas activos y abrir uno nuevo cuando ocurra algo en tu habitacion o en una zona comun.',
    },
  ];

  if (hasGastos) {
    steps.push({
      id: 'inquilino-gastos-main',
      route: '/inquilino/gastos',
      targetId: 'inquilino.gastos.main',
      title: 'Separa cuentas sin liarte',
      description:
        'Este apartado distingue lo que debes a companeros de lo relacionado con el casero para que entiendas cada pendiente de un vistazo.',
    });
  }

  steps.push(
    {
      id: 'perfil-apariencia',
      route: '/inquilino/perfil',
      targetId: 'perfil.apariencia',
      title: 'Ajusta la apariencia',
      description:
        'Puedes cambiar el modo visual de la app desde perfil para que te resulte mas comoda cada dia.',
    },
    {
      id: 'perfil-tutorial',
      route: '/inquilino/perfil',
      targetId: 'perfil.tutorial',
      title: 'Recupera esta ayuda cuando quieras',
      description:
        'Si quieres repetir el recorrido o ensenarselo a otra persona, podras volver a lanzarlo desde este bloque.',
    },
  );

  return steps;
}
