export type LegalDocumentKey = 'terminos' | 'privacidad';

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalDocument = {
  key: LegalDocumentKey;
  title: string;
  shortTitle: string;
  summary: string;
  version: string;
  effectiveDate: string;
  reviewNote: string;
  sections: LegalSection[];
};

const LEGAL_VERSION = '2026.04';
const LEGAL_EFFECTIVE_DATE = '22 de abril de 2026';
const LEGAL_REVIEW_NOTE =
  'Texto base informativo pendiente de revision legal profesional antes de publicacion definitiva.';

export const legalDocuments: Record<LegalDocumentKey, LegalDocument> = {
  terminos: {
    key: 'terminos',
    title: 'Terminos de uso',
    shortTitle: 'Terminos',
    summary:
      'Condiciones generales para crear cuenta, usar la app y mantener una convivencia respetuosa dentro de Roomies.',
    version: LEGAL_VERSION,
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    reviewNote: LEGAL_REVIEW_NOTE,
    sections: [
      {
        title: '1. Uso del servicio',
        paragraphs: [
          'Roomies es una aplicacion para gestionar viviendas compartidas, habitaciones, incidencias, tablon, gastos y otras funciones relacionadas con la convivencia.',
          'El uso de la app debe hacerse de buena fe, respetando a otros usuarios y sin emplearla para actividades ilicitas, fraudulentas o que puedan perjudicar a terceros.',
        ],
      },
      {
        title: '2. Cuenta y acceso',
        paragraphs: [
          'Cada usuario debe aportar datos veraces, mantener sus credenciales protegidas y notificar incidencias de seguridad si detecta un acceso no autorizado.',
          'Roomies puede limitar o suspender cuentas que incumplan estas condiciones, afecten al funcionamiento del servicio o vulneren derechos de otros usuarios.',
        ],
      },
      {
        title: '3. Contenido y convivencia',
        paragraphs: [
          'Los anuncios, incidencias, nombres de vivienda, documentos y demas contenidos que suba cada usuario son responsabilidad de quien los publica.',
          'No se permite compartir informacion ofensiva, enganosa, discriminatoria o que revele datos de terceros sin base legitima para ello.',
        ],
      },
      {
        title: '4. Funcionalidades economicas',
        paragraphs: [
          'Los importes, facturas, deudas, justificantes y repartos mostrados en la app dependen de la informacion introducida por los usuarios responsables de cada vivienda.',
          'Roomies facilita la gestion y trazabilidad de esos datos, pero no sustituye el asesoramiento legal, fiscal o contable que pueda ser necesario en casos concretos.',
        ],
      },
      {
        title: '5. Disponibilidad y cambios',
        paragraphs: [
          'Intentamos mantener la app disponible y segura, aunque pueden producirse interrupciones temporales por mantenimiento, incidencias tecnicas o mejoras del servicio.',
          'Estas condiciones pueden actualizarse en el futuro. La app queda preparada para versionar estos documentos y mostrar su fecha de entrada en vigor.',
        ],
      },
      {
        title: '6. Contacto y vigencia',
        paragraphs: [
          'Si tienes dudas sobre el uso de la app o sobre estas condiciones, debes contactar con el equipo responsable antes de apoyarte en este texto como documento legal definitivo.',
          'La version visible en la app identifica la revision actualmente publicada para que futuras actualizaciones puedan compararse con claridad.',
        ],
      },
    ],
  },
  privacidad: {
    key: 'privacidad',
    title: 'Politica de privacidad',
    shortTitle: 'Privacidad',
    summary:
      'Explica que datos usamos en Roomies, con que finalidad y que opciones tiene cada usuario sobre su informacion.',
    version: LEGAL_VERSION,
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    reviewNote: LEGAL_REVIEW_NOTE,
    sections: [
      {
        title: '1. Datos que tratamos',
        paragraphs: [
          'Roomies puede tratar datos de identificacion y contacto como nombre, apellidos, email, telefono, documento de identidad, rol dentro de la app y credenciales necesarias para autenticacion.',
          'Segun las funciones utilizadas, tambien puede almacenar datos de viviendas, habitaciones, incidencias, anuncios, gastos, justificantes, inventario, imagenes y tokens de notificaciones push.',
        ],
      },
      {
        title: '2. Finalidades del tratamiento',
        paragraphs: [
          'Utilizamos los datos para crear y mantener cuentas, permitir la participacion en viviendas, gestionar incidencias, pagos, mensajeria interna y mejorar la seguridad operativa del servicio.',
          'Tambien podemos usar cierta informacion para soporte tecnico, prevencion de abuso, diagnostico de errores y comunicaciones funcionales relacionadas con la actividad del usuario.',
        ],
      },
      {
        title: '3. Base de legitimacion',
        paragraphs: [
          'El tratamiento principal se apoya en la ejecucion del servicio solicitado por el usuario y en el cumplimiento de obligaciones asociadas a la gestion de la cuenta y la convivencia digital.',
          'Cuando una funcion requiera consentimiento adicional, como ciertas comunicaciones o futuras actualizaciones legales, la app podra solicitarlo de forma expresa y versionada.',
        ],
      },
      {
        title: '4. Cesiones y acceso a terceros',
        paragraphs: [
          'Los datos solo deben compartirse con otros usuarios cuando la funcion lo requiera, por ejemplo para identificar companeros de vivienda, gestionar incidencias o repartir gastos.',
          'Tambien pueden intervenir proveedores tecnologicos necesarios para autenticacion, almacenamiento, infraestructura, correo o notificaciones, siempre dentro del marco operativo del servicio.',
        ],
      },
      {
        title: '5. Conservacion y seguridad',
        paragraphs: [
          'Conservamos los datos durante el tiempo necesario para prestar el servicio, atender obligaciones legales y resolver incidencias o reclamaciones justificadas.',
          'Aplicamos medidas tecnicas y organizativas razonables para proteger la informacion, aunque ningun sistema conectado a internet puede garantizar seguridad absoluta.',
        ],
      },
      {
        title: '6. Derechos del usuario',
        paragraphs: [
          'Cada usuario puede solicitar acceso, rectificacion, supresion o limitacion del tratamiento de sus datos, asi como plantear dudas sobre el uso de su informacion en la plataforma.',
          'Antes de publicar la app de forma definitiva, este texto debe revisarse y completarse con la informacion juridica y de contacto exigible en la jurisdiccion aplicable.',
        ],
      },
    ],
  },
};

export function getLegalDocument(key: LegalDocumentKey) {
  return legalDocuments[key];
}
