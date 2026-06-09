import { z } from "zod";

const beneficiarioSchema = z.object({
  nombre: z.string().min(1, "Captura el nombre."),
  parentesco: z.string().nullish(),
  porcentaje: z.coerce.number().min(0).max(100).nullish(),
});

const contactoAtencionSchema = z.object({
  nombre: z.string().min(1, "Captura el nombre."),
  telefono: z.string().nullish(),
  email: z.string().email("Correo no válido.").nullish().or(z.literal("")),
  relacion_asegurado: z.string().nullish(),
});

export const nuevoCasoSchema = z
  .object({
    tipo_persona: z.enum(["fisica", "moral"]),
    nombre_asegurado: z.string().nullish(),
    nombre_empresa: z.string().nullish(),
    nombre_comercial: z.string().nullish(),
    nombre_representante: z.string().nullish(),
    rfc: z.string().nullish(),
    correo: z.string().email("Correo no válido.").nullish().or(z.literal("")),
    telefono: z.string().nullish(),
    celular: z.string().nullish(),
    aseguradora_id: z.coerce
      .number({ error: "Selecciona una aseguradora." })
      .int()
      .positive("Selecciona una aseguradora."),
    tipo_seguro_id: z.coerce
      .number({ error: "Selecciona un tipo de seguro." })
      .int()
      .positive("Selecciona un tipo de seguro."),
    tipo_siniestro_id: z.coerce.number().int().positive().nullish(),
    // El número de siniestro es condicional: obligatorio solo cuando el broker
    // contesta que el siniestro ya se reportó a la aseguradora. Esa validación
    // cruzada vive en el form (depende del cuestionario), no aquí.
    num_siniestro_poliza: z
      .string()
      .trim()
      .max(255, "Máximo 255 caracteres.")
      .nullish(),
    fecha_siniestro: z
      .string()
      .trim()
      .min(1, "Captura la fecha del siniestro."),
    // Datos de la póliza (reemplazan folio y monto estimado).
    numero_poliza: z
      .string()
      .trim()
      .min(1, "Captura el número de póliza.")
      .max(120, "Máximo 120 caracteres."),
    moneda: z.string().nullish(),
    fecha_expedicion: z.string().nullish(),
    vigencia_inicio: z.string().nullish(),
    vigencia_fin: z.string().nullish(),
    estado_id: z.coerce.number().int().positive().nullish(),
    ciudad: z.string().nullish(),
    domicilio: z.string().nullish(),
    codigo_postal: z.string().nullish(),
    contactos_atencion: z.array(contactoAtencionSchema).optional(),
    beneficiarios: z.array(beneficiarioSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo_persona === "fisica" && !data.nombre_asegurado?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["nombre_asegurado"],
        message: "Captura el nombre del asegurado.",
      });
    }
    if (data.tipo_persona === "moral" && !data.nombre_empresa?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["nombre_empresa"],
        message: "Captura la razón social.",
      });
    }
    if (
      data.vigencia_inicio &&
      data.vigencia_fin &&
      data.vigencia_fin < data.vigencia_inicio
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["vigencia_fin"],
        message: "El fin de vigencia no puede ser anterior al inicio.",
      });
    }
  });

export type NuevoCasoSchema = z.infer<typeof nuevoCasoSchema>;
