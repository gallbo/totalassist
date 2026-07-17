export const PRIVACIDAD_VERSION = "2026-07-03";

export const PRIVACIDAD_URL_SITE =
  "https://totalclaimassist.com/avisodeprivacidadagentes";
export const PRIVACIDAD_URL_PORTAL = "https://totalclaimassist.app/privacidad";

export const PRIVACIDAD_TITULO = "AVISO DE PRIVACIDAD";
export const PRIVACIDAD_SUBTITULO = "AGENTES DE SEGUROS";

export const PRIVACIDAD_INTRO =
  'En cumplimiento a lo previsto en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (la "Ley"), su reglamento y los lineamientos aplicables, le informamos lo siguiente:';

export type AvisoSeccion = {
  titulo?: string;
  parrafos?: string[];
  incisos?: string[];
};

const RESPONSABLE_PARRAFO =
  'Claim Assist México, S.C. (en lo sucesivo "CAM"), señalando para efectos del presente aviso de privacidad el domicilio ubicado en Blvd. Enrique Sanchez Alonso 2249, Col. Parque Alamedas, C.P. 80030, en Culiacán, Sinaloa, será el responsable de recabar sus datos personales. También será responsable del uso y protección que se le dé a los mismos y a aquellos datos que sean recabados por cualquiera de las sociedades que sean sus controladoras, subsidiarias o filiales, o por terceros contratados para realizar servicios en nombre de CAM, de conformidad con el presente aviso de privacidad ("el Aviso de Privacidad").';

const FINALIDADES_PRINCIPALES_INTRO =
  "Los Datos Personales y Datos Personales Sensibles serán utilizados para cualesquiera de las siguientes finalidades principales:";

const FINALIDADES_PRINCIPALES: string[] = [
  "Identificarle, contactarle y comunicarle.",
  "Generar su expediente como cliente.",
  "Cumplir con la prestación de los servicios.",
  "Asegurar el cumplimiento de todo tipo de obligaciones legales.",
  "Enviarle notificaciones con respecto a cambios en este Aviso de Privacidad.",
];

const FINALIDADES_SECUNDARIAS_INTRO =
  "Adicional a las finalidades anteriores, CAM podrá utilizar sus Datos Personales para cualesquiera de las siguientes finalidades secundarias:";

const FINALIDADES_SECUNDARIAS: string[] = [
  "Fines estadísticos.",
  "Invitarle a participar en eventos y capacitaciones de CAM.",
  "Fines publicitarios.",
];

const MECANISMOS_PARRAFO =
  "En cualquier momento, usted tiene derecho a revocar el consentimiento para el tratamiento de sus Datos Personales y Datos Personales Sensibles, a fin de que dejemos de hacer uso de estos, para lo cual deberá presentar su solicitud conforme al procedimiento y requisitos señalados en el Aviso de Privacidad integral.";

// Aviso integral: contenido completo de la página de privacidad.
export const PRIVACIDAD_INTEGRAL: AvisoSeccion[] = [
  {
    titulo: "Responsable del tratamiento",
    parrafos: [RESPONSABLE_PARRAFO],
  },
  {
    titulo: "Datos Personales",
    parrafos: [
      "En virtud de su relación comercial existente o futura con CAM, usted nos podría proporcionar o nos proporciona la totalidad o algunos de los siguientes datos personales:",
    ],
    incisos: [
      "(i) Datos de identificación del cliente y representante o apoderado legal: identificación oficial, imagen, acta constitutiva, poder notarial del representante o apoderado legal, firma autógrafa del representante o apoderado legal;",
      "(ii) Datos de contacto: teléfono, comprobante de domicilio y correo electrónico;",
      '(iii) Datos fiscales: identificación fiscal, dirección fiscal, constancia de situación fiscal, opinión del cumplimiento de obligaciones fiscales y comprobante de residencia fiscal (en adelante, "los Datos Personales").',
    ],
  },
  {
    titulo: "Datos Personales Sensibles",
    parrafos: [
      "Además de los datos personales mencionados anteriormente, para las finalidades informadas en el presente aviso de privacidad, usted nos podrá proporcionar los siguientes datos personales considerados como sensibles:",
    ],
    incisos: [
      "(i) Datos de geolocalización: coordenadas exactas de ubicación del siniestro;",
      '(ii) expediente médico y datos de salud: antecedentes familiares y personales, estado de salud físico o mental, presente, pasado o futuro, intervenciones quirúrgicas u hospitalizaciones, tipo de sangre, hábitos higiénicos, alimenticios o recreativos, alergias, discapacidades, enfermedades o padecimientos y medicamentos, causa de muerte; así como cualquier otro dato de salud necesario para reclamar cualquier póliza de seguros relacionada con automóviles, la salud y con la vida (en adelante, "los Datos Personales Sensibles").',
    ],
  },
  {
    titulo: "Finalidad del tratamiento",
    parrafos: [FINALIDADES_PRINCIPALES_INTRO],
    incisos: FINALIDADES_PRINCIPALES,
  },
  {
    parrafos: [FINALIDADES_SECUNDARIAS_INTRO],
    incisos: FINALIDADES_SECUNDARIAS,
  },
  {
    titulo: "Mecanismos para oponerse a las finalidades secundarias",
    parrafos: [MECANISMOS_PARRAFO],
  },
];

// Aviso simplificado: contenido del popup de aceptación en el registro.
export const PRIVACIDAD_SIMPLIFICADO_TITULO =
  "AVISO DE PRIVACIDAD SIMPLIFICADO";

export const PRIVACIDAD_SIMPLIFICADO: AvisoSeccion[] = [
  {
    titulo: "Responsable",
    parrafos: [RESPONSABLE_PARRAFO],
  },
  {
    titulo: "Finalidad del tratamiento",
    parrafos: [FINALIDADES_PRINCIPALES_INTRO],
    incisos: FINALIDADES_PRINCIPALES,
  },
  {
    parrafos: [FINALIDADES_SECUNDARIAS_INTRO],
    incisos: FINALIDADES_SECUNDARIAS,
  },
  {
    titulo: "Mecanismos para oponerse a las finalidades secundarias",
    parrafos: [MECANISMOS_PARRAFO],
  },
];

export const PRIVACIDAD_SIMPLIFICADO_CHECKBOX =
  "He leído el Aviso de Privacidad simplificado.";

// Texto del checkbox de consentimiento pleno en el formulario de registro.
// Los enlaces se renderizan hacia las dos URLs del aviso integral.
export const PRIVACIDAD_CONSENTIMIENTO = {
  pre: "He leído el Aviso de Privacidad integral que se encuentra en ",
  urlSite: PRIVACIDAD_URL_SITE,
  mid: " y en ",
  urlPortal: PRIVACIDAD_URL_PORTAL,
  post: ", y mediante la selección de esta casilla manifiesto mi pleno consentimiento con el tratamiento que se le dará a mis Datos Personales y a mis Datos Personales Sensibles.",
};
