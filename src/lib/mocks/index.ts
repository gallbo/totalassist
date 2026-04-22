export type CasoEstatus =
  | "en-proceso"
  | "interrumpido"
  | "indemnizado"
  | "finalizado";

export type TipoSeguro =
  | "AUTOS"
  | "GASTOS MÉDICOS"
  | "VIDA"
  | "HIPOTECARIO"
  | "GM";

export type Aseguradora = "Qualitas" | "AXA" | "CHUBB";

export type Comentario = {
  id: string;
  autor: string;
  estrellas: number;
  texto: string;
};

export type Beneficiario = {
  id: string;
  nombre: string;
  telefono: string;
};

export type ArchivoAdjunto = {
  id: string;
  nombre: string;
  fechaCreacion: string;
};

export type DatosMoral = {
  razonSocial: string;
  nombreComercial: string;
  identidadFiscal: string;
  representante: {
    nombre: string;
    correo: string;
    telefono: string;
  };
};

export type DatosFisica = {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
};

export type Direccion = {
  domicilio: string;
  estado: string;
  ciudad: string;
  codigoPostal: string;
};

export type Caso = {
  id: string;
  folio: string;
  asegurado: string;
  poliza: string;
  aseguradora: Aseguradora;
  tipo: TipoSeguro;
  tiempoDias: number;
  etapa: number;
  etapaLabel: string;
  estatus: CasoEstatus;
  fechaInicial: string;
  fechaFinal: string;
  personaFisica: boolean;
  broker: string;
  fisica?: DatosFisica;
  moral?: DatosMoral;
  direccion: Direccion;
  contactosAtencion: Beneficiario[];
  beneficiarios: Beneficiario[];
  archivos: ArchivoAdjunto[];
};

export type Paquete = {
  id: string;
  nombre: string;
  fechaContratacion: string;
  fechaExpiracion: string;
  activo: boolean;
};

export type PaqueteDisponible = {
  id: string;
  nombre: string;
  costo: number;
  casos: number;
  duracionDias: number;
  gradiente: string;
};

export const broker = {
  id: "broker-1",
  nombre: "Juan Carlos",
  apellidos: "Ibarra quintero",
  correo: "juan.ibarra@broker.com",
  telefono: "66-72-34-85-23",
  rating: 4,
  agencia: "Espinosa de los Monteros",
  domicilio: "Calle Roma #7503 Col. Estela Ortiz",
  estado: "Sinaloa",
  ciudad: "Culiacán",
  codigoPostal: "80374",
};

export const contactosAtencion: Beneficiario[] = [
  {
    id: "c-1",
    nombre: "Juan Manuel Espinoza Ruiz",
    telefono: "74-46-35-89-34",
  },
];

export const dashboardCounts = {
  enProceso: 5,
  restantes: 2,
  interrumpidos: 3,
};

export const estadoCasosTotales = {
  enProceso: 10,
  interrumpido: 3,
  indemnizado: 7,
  finalizado: 10,
};

export const registroCasos = {
  total: 170,
  delta: 28,
  serie: [
    { mes: "Ene", valor: 10 },
    { mes: "Feb", valor: 25 },
    { mes: "Mar", valor: 60 },
    { mes: "Abr", valor: 70 },
    { mes: "May", valor: 72 },
    { mes: "Jun", valor: 80 },
    { mes: "Jul", valor: 90 },
    { mes: "Ago", valor: 120 },
    { mes: "Sep", valor: 140 },
    { mes: "Oct", valor: 155 },
    { mes: "Nov", valor: 165 },
    { mes: "Dic", valor: 170 },
  ],
};

export const favoritos = {
  aseguradora: "Qualitas" as Aseguradora,
  tipoSeguro: "Auto" as const,
};

export const comentarios: Comentario[] = [
  {
    id: "c-1",
    autor: "Mariana S.",
    estrellas: 5,
    texto:
      "Tuve un pequeño choque la semana pasada y la asistencia llegó en menos de 20 minutos. El proceso de valuación fue súper rápido a través de la app. ¡Muy recomendados!",
  },
  {
    id: "c-2",
    autor: "Roberto M.",
    estrellas: 5,
    texto:
      "Contraté mi póliza de vida en 5 minutos. Los precios son muy competitivos frente a la competencia tradicional.",
  },
  {
    id: "c-3",
    autor: "Esteban G.",
    estrellas: 4,
    texto:
      "La atención médica fue excelente cuando la necesité, aunque tuve que llamar un par de veces para confirmar que mi reembolso estaba en camino.",
  },
  {
    id: "c-4",
    autor: "Lucia F.",
    estrellas: 4,
    texto:
      "Me gusta la transparencia en las cláusulas, no hay letras chiquitas. Solo sugeriría agilizar la entrega física de la tarjeta de asegurado.",
  },
  {
    id: "c-5",
    autor: "Jorge V.",
    estrellas: 2,
    texto:
      "Aunque el seguro es económico, el portal de clientes se cae seguido y me pidieron tres veces el mismo documento para un cambio de domicilio.",
  },
];

const etapaLabel = (n: number, estatus: CasoEstatus) => {
  if (estatus === "indemnizado") return "7 - Indemnizado";
  if (estatus === "finalizado") return "8 - Finalizado";
  return `${n} - Contacto con la aseguradora`;
};

const direccionSinaloa: Direccion = {
  domicilio: "Calle Roma #7503 Col. Estela Ortiz",
  estado: "Sinaloa",
  ciudad: "Culiacán",
  codigoPostal: "80374",
};

const direccionCDMX: Direccion = {
  domicilio: "Av. de los Insurgentes Sur #1450, Piso 8, San José Insurgentes",
  estado: "CDMX",
  ciudad: "Ciudad de México",
  codigoPostal: "03900",
};

const contactoDefault: Beneficiario[] = [
  {
    id: "c-def",
    nombre: "Juan Manuel Espinoza Ruiz",
    telefono: "74-46-35-89-34",
  },
];

const beneficiariosDefault: Beneficiario[] = [
  {
    id: "b-def",
    nombre: "Juan Manuel Ezpinoza Ruiz",
    telefono: "66-71-17-34-67",
  },
];

const archivosCompleto: ArchivoAdjunto[] = [
  { id: "f-1", nombre: "INE", fechaCreacion: "05-01-2026" },
  { id: "f-2", nombre: "Póliza firmada", fechaCreacion: "06-01-2026" },
];

const rawCasos: Array<Omit<Caso, "etapaLabel">> = [
  {
    id: "1",
    folio: "TCA-001-2026",
    asegurado: "Juan Ibarra",
    poliza: "001-0001-00001",
    aseguradora: "Qualitas",
    tipo: "AUTOS",
    tiempoDias: 45,
    etapa: 1,
    estatus: "en-proceso",
    fechaInicial: "10-01-2026",
    fechaFinal: "10-01-2027",
    personaFisica: true,
    broker: "Juan Ibarra",
    fisica: {
      nombres: "Juan Carlos",
      apellidos: "Ibarra quintero",
      correo: "juan.ibarra@broker.com",
      telefono: "66-72-34-85-23",
    },
    direccion: direccionSinaloa,
    contactosAtencion: [],
    beneficiarios: beneficiariosDefault,
    archivos: [],
  },
  {
    id: "2",
    folio: "TCA-002-2026",
    asegurado: "LogiPan",
    poliza: "001-0001-00002",
    aseguradora: "AXA",
    tipo: "AUTOS",
    tiempoDias: 50,
    etapa: 1,
    estatus: "interrumpido",
    fechaInicial: "05-02-2026",
    fechaFinal: "05-02-2027",
    personaFisica: false,
    broker: "Juan Ibarra",
    moral: {
      razonSocial: "Logística y Distribución Panamericana S.A. de C. V.",
      nombreComercial: "LogiPan",
      identidadFiscal: "LDP920110-GR8",
      representante: {
        nombre: "Roberto Carlos Mendoza",
        correo: "rmendoza@logipan.mx",
        telefono: "79-23-45-86-83",
      },
    },
    direccion: direccionCDMX,
    contactosAtencion: contactoDefault,
    beneficiarios: [],
    archivos: [
      { id: "f-x", nombre: "Acta constitutiva", fechaCreacion: "05-02-2026" },
    ],
  },
  {
    id: "3",
    folio: "TCA-003-2026",
    asegurado: "Mario Ramos",
    poliza: "001-0001-00003",
    aseguradora: "CHUBB",
    tipo: "VIDA",
    tiempoDias: 10,
    etapa: 8,
    estatus: "finalizado",
    fechaInicial: "01-03-2026",
    fechaFinal: "01-03-2027",
    personaFisica: true,
    broker: "Juan Ibarra",
    fisica: {
      nombres: "Mario",
      apellidos: "Ramos López",
      correo: "mario.ramos@gmail.com",
      telefono: "55-12-34-56-78",
    },
    direccion: direccionSinaloa,
    contactosAtencion: contactoDefault,
    beneficiarios: beneficiariosDefault,
    archivos: archivosCompleto,
  },
  {
    id: "4",
    folio: "TCA-004-2026",
    asegurado: "Jorge Valdez",
    poliza: "001-0001-00004",
    aseguradora: "Qualitas",
    tipo: "AUTOS",
    tiempoDias: 7,
    etapa: 1,
    estatus: "en-proceso",
    fechaInicial: "14-03-2026",
    fechaFinal: "14-03-2027",
    personaFisica: true,
    broker: "Juan Ibarra",
    fisica: {
      nombres: "Jorge",
      apellidos: "Valdez Núñez",
      correo: "jvaldez@gmail.com",
      telefono: "66-12-45-67-89",
    },
    direccion: direccionSinaloa,
    contactosAtencion: [],
    beneficiarios: [],
    archivos: [],
  },
  {
    id: "5",
    folio: "TCA-005-2026",
    asegurado: "Maria Martinez",
    poliza: "001-0001-00005",
    aseguradora: "AXA",
    tipo: "GM",
    tiempoDias: 15,
    etapa: 1,
    estatus: "interrumpido",
    fechaInicial: "20-03-2026",
    fechaFinal: "20-03-2027",
    personaFisica: true,
    broker: "Juan Ibarra",
    fisica: {
      nombres: "María",
      apellidos: "Martínez Ruiz",
      correo: "maria.martinez@gmail.com",
      telefono: "55-98-76-54-32",
    },
    direccion: direccionCDMX,
    contactosAtencion: contactoDefault,
    beneficiarios: [],
    archivos: [],
  },
  {
    id: "6",
    folio: "TCA-006-2026",
    asegurado: "Diana Benitez",
    poliza: "001-0001-00006",
    aseguradora: "CHUBB",
    tipo: "VIDA",
    tiempoDias: 90,
    etapa: 7,
    estatus: "indemnizado",
    fechaInicial: "22-01-2026",
    fechaFinal: "22-01-2027",
    personaFisica: true,
    broker: "Juan Ibarra",
    fisica: {
      nombres: "Diana",
      apellidos: "Benítez García",
      correo: "dianabenitez@hotmail.com",
      telefono: "55-11-22-33-44",
    },
    direccion: direccionSinaloa,
    contactosAtencion: contactoDefault,
    beneficiarios: beneficiariosDefault,
    archivos: archivosCompleto,
  },
  {
    id: "7",
    folio: "TCA-007-2026",
    asegurado: "Manuel Villegas",
    poliza: "001-0001-00007",
    aseguradora: "Qualitas",
    tipo: "AUTOS",
    tiempoDias: 6,
    etapa: 1,
    estatus: "en-proceso",
    fechaInicial: "04-04-2026",
    fechaFinal: "04-04-2027",
    personaFisica: true,
    broker: "Juan Ibarra",
    fisica: {
      nombres: "Manuel",
      apellidos: "Villegas",
      correo: "mvillegas@gmail.com",
      telefono: "33-22-11-44-55",
    },
    direccion: direccionSinaloa,
    contactosAtencion: [],
    beneficiarios: [],
    archivos: [],
  },
  {
    id: "8",
    folio: "TCA-008-2026",
    asegurado: "Jesús Rios",
    poliza: "001-0001-00008",
    aseguradora: "AXA",
    tipo: "GM",
    tiempoDias: 12,
    etapa: 1,
    estatus: "interrumpido",
    fechaInicial: "01-04-2026",
    fechaFinal: "01-04-2027",
    personaFisica: true,
    broker: "Juan Ibarra",
    fisica: {
      nombres: "Jesús",
      apellidos: "Ríos Castro",
      correo: "jesus.rios@gmail.com",
      telefono: "66-77-88-99-00",
    },
    direccion: direccionSinaloa,
    contactosAtencion: [],
    beneficiarios: [],
    archivos: [],
  },
  {
    id: "15",
    folio: "TCA-015-2026",
    asegurado: "LogiPan (finalizado)",
    poliza: "001-0001-00015",
    aseguradora: "AXA",
    tipo: "AUTOS",
    tiempoDias: 50,
    etapa: 8,
    estatus: "finalizado",
    fechaInicial: "05-01-2026",
    fechaFinal: "05-01-2027",
    personaFisica: false,
    broker: "Juan Ibarra",
    moral: {
      razonSocial: "Logística y Distribución Panamericana S.A. de C. V.",
      nombreComercial: "LogiPan",
      identidadFiscal: "LDP920110-GR8",
      representante: {
        nombre: "Roberto Carlos Mendoza",
        correo: "rmendoza@logipan.mx",
        telefono: "79-23-45-86-83",
      },
    },
    direccion: direccionCDMX,
    contactosAtencion: contactoDefault,
    beneficiarios: [],
    archivos: [{ id: "fa-1", nombre: "INE", fechaCreacion: "05-01-2026" }],
  },
];

const extraCasos: Array<Omit<Caso, "etapaLabel">> = Array.from(
  { length: 21 },
  (_, i) => {
    const n = i + 9 > 14 ? i + 10 : i + 9;
    const estatusCycle: CasoEstatus[] = [
      "en-proceso",
      "interrumpido",
      "indemnizado",
      "finalizado",
    ];
    const aseguradoraCycle: Aseguradora[] = ["Qualitas", "AXA", "CHUBB"];
    const tipoCycle: TipoSeguro[] = ["AUTOS", "GM", "VIDA", "GASTOS MÉDICOS"];
    const estatus = estatusCycle[i % 4];
    const personaFisica = i % 3 !== 0;
    return {
      id: `${n}`,
      folio: `TCA-${String(n).padStart(3, "0")}-2026`,
      asegurado: personaFisica ? `Asegurado ${n}` : `Empresa ${n} S.A.`,
      poliza: `001-0001-${String(n).padStart(5, "0")}`,
      aseguradora: aseguradoraCycle[i % 3],
      tipo: tipoCycle[i % 4],
      tiempoDias: 5 + i * 3,
      etapa: estatus === "finalizado" ? 8 : estatus === "indemnizado" ? 7 : 1,
      estatus,
      fechaInicial: "10-04-2026",
      fechaFinal: "10-04-2027",
      personaFisica,
      broker: "Juan Ibarra",
      ...(personaFisica
        ? {
            fisica: {
              nombres: "Nombre",
              apellidos: `Apellido ${n}`,
              correo: `asegurado${n}@correo.com`,
              telefono: "55-00-00-00-00",
            },
          }
        : {
            moral: {
              razonSocial: `Empresa ${n} Sociedad Anónima de C.V.`,
              nombreComercial: `Empresa ${n}`,
              identidadFiscal: `EMP${n}0101-ABC`,
              representante: {
                nombre: "Representante Legal",
                correo: `rep${n}@empresa.com`,
                telefono: "55-11-22-33-44",
              },
            },
          }),
      direccion: i % 2 === 0 ? direccionSinaloa : direccionCDMX,
      contactosAtencion: i % 4 === 0 ? contactoDefault : [],
      beneficiarios: i % 5 === 0 ? beneficiariosDefault : [],
      archivos:
        estatus === "finalizado" || estatus === "indemnizado"
          ? archivosCompleto
          : [],
    };
  },
);

export const casos: Caso[] = [...rawCasos, ...extraCasos].map((c) => ({
  ...c,
  etapaLabel: etapaLabel(c.etapa, c.estatus),
}));

export const misPaquetes: Paquete[] = [
  {
    id: "mp-1",
    nombre: "Paquete 1",
    fechaContratacion: "02-02-2026",
    fechaExpiracion: "01-03-2026",
    activo: true,
  },
  {
    id: "mp-2",
    nombre: "Paquete 1",
    fechaContratacion: "19-01-2026",
    fechaExpiracion: "02-02-2026",
    activo: false,
  },
  {
    id: "mp-3",
    nombre: "Paquete 1",
    fechaContratacion: "02-01-2026",
    fechaExpiracion: "18-01-2026",
    activo: false,
  },
];

export const paquetesDisponibles: PaqueteDisponible[] = [
  {
    id: "p-5",
    nombre: "Paquete 1",
    costo: 2500,
    casos: 5,
    duracionDias: 10,
    gradiente: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #f5c800 100%)",
  },
  {
    id: "p-10",
    nombre: "Paquete 2",
    costo: 4800,
    casos: 10,
    duracionDias: 15,
    gradiente: "linear-gradient(135deg, #0f172a 0%, #64748b 50%, #f5c800 100%)",
  },
  {
    id: "p-15",
    nombre: "Paquete 3",
    costo: 7200,
    casos: 15,
    duracionDias: 30,
    gradiente: "linear-gradient(135deg, #1e293b 0%, #6366f1 50%, #f5c800 100%)",
  },
];
