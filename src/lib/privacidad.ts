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

const DOMICILIO =
  "Blvd. Enrique Sánchez Alonso 2249, Col. Parque Alamedas, C.P. 80030, en Culiacán, Sinaloa";

const RESPONSABLE_PARRAFO = `Claim Assist México, S.C. (en lo sucesivo "CAM"), señalando para efectos del presente aviso de privacidad el domicilio ubicado en ${DOMICILIO}, será el responsable de recabar sus datos personales. También será responsable del uso y protección que se le dé a los mismos y a aquellos datos que sean recabados por cualquiera de las sociedades que sean sus controladoras, subsidiarias o filiales, o por terceros contratados para realizar servicios en nombre de CAM, de conformidad con el presente aviso de privacidad ("el Aviso de Privacidad").`;

const DATOS_PERSONALES_INTRO =
  "En virtud de su relación comercial existente o futura con CAM, usted nos podría proporcionar o nos proporciona la totalidad o algunos de los siguientes datos personales:";

const DATOS_PERSONALES_INCISOS: string[] = [
  "(i) Datos de identificación del cliente y representante o apoderado legal: identificación oficial, imagen, acta constitutiva, poder notarial del representante o apoderado legal, firma autógrafa del representante o apoderado legal;",
  "(ii) Datos de contacto: teléfono, comprobante de domicilio y correo electrónico;",
  '(iii) Datos fiscales: identificación fiscal, dirección fiscal, constancia de situación fiscal, opinión del cumplimiento de obligaciones fiscales y comprobante de residencia fiscal (en adelante, "los Datos Personales").',
];

const DATOS_SENSIBLES_INTRO =
  "Además de los datos personales mencionados anteriormente, para las finalidades informadas en el presente aviso de privacidad, usted nos podrá proporcionar los siguientes datos personales considerados como sensibles:";

const DATOS_SENSIBLES_INCISOS: string[] = [
  "(i) Datos de geolocalización: coordenadas exactas de ubicación del siniestro;",
  '(ii) expediente médico y datos de salud: antecedentes familiares y personales, estado de salud físico o mental, presente, pasado o futuro, intervenciones quirúrgicas u hospitalizaciones, tipo de sangre, hábitos higiénicos, alimenticios o recreativos, alergias, discapacidades, enfermedades o padecimientos y medicamentos, causa de muerte; así como cualquier otro dato de salud necesario para reclamar cualquier póliza de seguros relacionada con automóviles, la salud y con la vida (en adelante, "los Datos Personales Sensibles").',
];

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

// El aviso simplificado remite al integral porque el procedimiento ARCO no se
// reproduce en el popup; el integral lo resuelve contra sus propios parrafos.
const REVOCACION_SIMPLIFICADO =
  "En cualquier momento, usted tiene derecho a revocar el consentimiento para el tratamiento de sus Datos Personales y Datos Personales Sensibles, a fin de que dejemos de hacer uso de estos, para lo cual deberá presentar su solicitud conforme al procedimiento y requisitos señalados en el Aviso de Privacidad integral.";

const REVOCACION_INTEGRAL =
  "En cualquier momento, usted tiene derecho a revocar el consentimiento para el tratamiento de sus Datos Personales y Datos Personales Sensibles, a fin de que dejemos de hacer uso de estos, para lo cual deberá presentar su solicitud conforme al procedimiento y requisitos señalados en los párrafos anteriores.";

// Aviso integral: contenido completo de la página de privacidad.
export const PRIVACIDAD_INTEGRAL: AvisoSeccion[] = [
  {
    titulo: "Responsable del tratamiento",
    parrafos: [RESPONSABLE_PARRAFO],
  },
  {
    titulo: "Datos Personales",
    parrafos: [DATOS_PERSONALES_INTRO],
    incisos: DATOS_PERSONALES_INCISOS,
  },
  {
    titulo: "Datos Personales Sensibles",
    parrafos: [DATOS_SENSIBLES_INTRO],
    incisos: DATOS_SENSIBLES_INCISOS,
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
    titulo: "Obtención de los datos",
    parrafos: [
      "Podemos recabar sus Datos Personales y Datos Personales Sensibles de distintas formas: cuando usted nos los proporciona directamente o cuando obtenemos información a través de otras fuentes que están permitidas por la Ley, cumpliendo en todo momento con las finalidades señaladas en el Aviso de Privacidad.",
    ],
  },
  {
    titulo: "Transferencia de datos",
    parrafos: [
      "Sus Datos Personales y Datos Personales Sensibles podrán ser transferidos a las empresas controladoras, subsidiarias, afiliadas o cualquier otra perteneciente a CAM, en México o en el extranjero; a terceros, nacionales o extranjeros, para el cumplimiento de las finalidades antes mencionadas, o cuando dicha comunicación de datos esté prevista en una Ley o Tratado, o bien, cuando sea requerido por la autoridad competente.",
      "A través de la firma de convenios y/o la adopción de otros documentos vinculantes, procuraremos que dichos terceros mantengan medidas de seguridad, administrativas, técnicas y físicas adecuadas para resguardar sus datos personales, así como que dichos terceros únicamente utilicen sus Datos Personales y Datos Personales Sensibles para las finalidades para los cuales fueron recabados y de conformidad con el presente Aviso de Privacidad. No obstante, lo anterior, no cederemos o transferiremos sus Datos a terceros no relacionados con la empresa, salvo en los casos antes citados y los previstos en la Ley.",
    ],
  },
  {
    titulo: "Medidas de seguridad y confidencialidad",
    parrafos: [
      "Implementaremos las medidas de seguridad, técnicas, administrativas y físicas, necesarias para procurar la integridad de sus Datos Personales y Datos Personales Sensibles, y evitar su daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado. Únicamente el personal autorizado, que ha cumplido y observado los correspondientes requisitos de confidencialidad, podrá participar en su tratamiento.",
      "El personal autorizado tiene prohibido permitir el acceso de personas no autorizadas y utilizar sus Datos Personales y Datos Personales Sensibles para fines distintos en los establecidos en el presente Aviso de Privacidad. La obligación de confidencialidad de las personas que participan en el tratamiento de sus Datos Personales y Datos Personales Sensibles subsiste aún después de terminada la relación con CAM.",
    ],
  },
  {
    titulo: "Responsabilidad del Titular",
    parrafos: [
      "Es responsabilidad de usted, como Titular de los Datos Personales y Datos Personales Sensibles, garantizar que los Datos facilitados a CAM sean veraces y completos, así como comunicar a CAM cualquier modificación en los mismos a efecto de que se pueda cumplir con la obligación de mantener la información actualizada.",
    ],
  },
  {
    titulo: "Derechos ARCO",
    parrafos: [
      "Es importante informarle que como Titular de la información tiene derecho a acceder a sus Datos Personales y Datos Personales Sensibles que poseemos y a los detalles del tratamiento de estos, así como a rectificarlos en caso de ser inexactos o incompletos; cancelarlos cuando considere que no se requieren para alguna de las finalidades señaladas en el presente Aviso de Privacidad o estén siendo utilizados para finalidades no consentidas; y oponerse al tratamiento de los mismos para fines específicos o limitar su uso o divulgación.",
      `Para ejercitar esos derechos, es necesario que presente una solicitud escrita dirigida al Departamento de Datos Personales de CAM, S.C., al siguiente domicilio: ${DOMICILIO} en el horario de 09:00 a 17:00 horas, en días hábiles.`,
    ],
  },
  {
    titulo: "Requisitos de la solicitud",
    parrafos: [
      "Toda solicitud para que sea tramitada deberá contener y acompañar lo siguiente:",
    ],
    incisos: [
      "El nombre del Titular y domicilio u otro medio para comunicarle la respuesta a su solicitud. En caso de que el Titular no señale domicilio para recibir la respuesta, se tendrá por no presentada la solicitud, para lo cual se emitirá la constancia pertinente.",
      "Los documentos que acrediten la identidad (credencial para votar con fotografía, pasaporte, cartilla militar, o licencia de conducir), en copia simple y habiendo exhibido el original para su cotejo o en su caso, la representación legal del Titular (mediante Escritura Pública o carta poder firmada ante dos testigos).",
      "La descripción clara y precisa de los datos personales respecto de los que se busca ejercer alguno de los derechos.",
      "Cualquier otro elemento o documento que facilite la localización de los datos personales.",
    ],
  },
  {
    titulo: "Respuesta y plazos",
    parrafos: [
      "La respuesta a su solicitud se dará, a su elección como Titular, por medio de correo electrónico, o mediante respuesta escrita cuando acuda directamente a las oficinas de CAM en la dirección señalada a recogerla, pudiéndose reproducir la respuesta en documentos electrónicos, copias simples, o de manera verbal. CAM tendrá un plazo de veinte días hábiles, contados desde la fecha en que se recibió la solicitud o a partir de que el Titular solventó el requerimiento de información, para comunicarle al Titular si la misma es procedente. En caso de que la solicitud sea procedente, se hará efectiva dentro de los quince días siguientes a la fecha en que se comunique la respuesta. Los plazos referidos podrán ser ampliados una sola vez por un periodo igual cuando esté justificado.",
    ],
  },
  {
    titulo: "Departamento de Datos Personales",
    parrafos: [
      "Para efectos de conocer más a fondo los requisitos de las solicitudes, procedencia de estas o formularios, el Titular puede contactar al Departamento de Datos Personales en cualquiera de las siguientes formas: directamente en el domicilio de la empresa o a la dirección de correo avisodeprivacidadclientes@totalclaimassist.com.",
    ],
  },
  {
    titulo:
      "Revocación del consentimiento y oposición a las finalidades secundarias",
    parrafos: [REVOCACION_INTEGRAL],
  },
  {
    titulo: "Modificaciones al Aviso de Privacidad",
    parrafos: [
      "CAM se reserva el derecho de modificar en cualquier momento el presente Aviso de Privacidad para cumplir con actualizaciones legislativas, jurisprudenciales, políticas internas, nuevos requisitos para la prestación de servicios o cualquier otra causa. Cualquier modificación, así como el presente documento actualizado estará disponible en las plataformas o instalaciones en que sea utilizado.",
    ],
  },
  {
    titulo: "Legislación aplicable",
    parrafos: [
      "El presente Aviso de Privacidad, así como el manejo en general que haga CAM, se rige por la legislación vigente y aplicable en los Estados Unidos Mexicanos, por lo que cualquier controversia que se suscite con motivo de su aplicación deberá ventilarse ante los Órganos Jurisdiccionales competentes en la Ciudad de Culiacán, Sinaloa.",
    ],
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
    parrafos: [REVOCACION_SIMPLIFICADO],
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
