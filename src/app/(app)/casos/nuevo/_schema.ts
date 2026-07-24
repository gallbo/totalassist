import { z } from "zod";

/**
 * Teléfono México — exactamente 10 dígitos (sin lada de país, espacios ni
 * guiones). Se acepta vacío/null porque el campo suele ser opcional; solo
 * cuando el broker escribe algo se valida que sean 10 dígitos.
 *
 * Alicia (jul-2026): "Aquí solo debería aceptar números y el número debe
 * ser mínimo y máximo 10 dígitos ya que es en México."
 */
const telefonoMxSchema = z
  .string()
  .trim()
  .refine((v) => !v || /^\d{10}$/.test(v), {
    message: "Debe tener exactamente 10 dígitos.",
  })
  .nullish();

const beneficiarioSchema = z.object({
  nombre: z.string().min(1, "Captura el nombre."),
  parentesco: z.string().nullish(),
  porcentaje: z.coerce.number().min(0).max(100).nullish(),
});

const direccionSchema = z.object({
  domicilio: z.string().nullish(),
  // El select de Estado entrega string; se convierte a número en el payload.
  estado_id: z.string().nullish(),
  ciudad: z.string().nullish(),
  codigo_postal: z.string().nullish(),
});

const polizaSchema = z.object({
  // Solo en edición: identifica una póliza existente para conservarla.
  id: z.number().optional(),
  numero_poliza: z
    .string()
    .trim()
    .min(1, "Captura el número de póliza.")
    .max(120, "Máximo 120 caracteres."),
  moneda: z.string().nullish(),
  fecha_expedicion: z.string().nullish(),
  vigencia_inicio: z.string().nullish(),
  vigencia_fin: z.string().nullish(),
});

const contactoAseguradoSchema = z.object({
  nombre: z.string().nullish(),
  telefono: telefonoMxSchema,
  email: z.string().email("Correo no válido.").nullish().or(z.literal("")),
  relacion_asegurado: z.string().nullish(),
});

const representanteSchema = z.object({
  nombre: z.string().nullish(),
  cargo: z.string().nullish(),
  rfc: z.string().nullish(),
  correo: z.string().email("Correo no válido.").nullish().or(z.literal("")),
  telefono: telefonoMxSchema,
  direcciones: z.array(direccionSchema).optional(),
  contactos_atencion: z.array(contactoAseguradoSchema).optional(),
});

const aseguradoSchema = z.object({
  tipo_persona: z.enum(["fisica", "moral"]),
  nombre: z.string().nullish(),
  razon_social: z.string().nullish(),
  nombre_comercial: z.string().nullish(),
  rfc: z.string().nullish(),
  correo: z.string().email("Correo no válido.").nullish().or(z.literal("")),
  telefono: telefonoMxSchema,
  direcciones: z.array(direccionSchema).optional(),
  contactos_atencion: z.array(contactoAseguradoSchema).optional(),
  representantes: z.array(representanteSchema).optional(),
});

export const nuevoCasoSchema = z
  .object({
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
    // Pólizas del caso (1:N): un solo tipo de seguro, varias pólizas del mismo
    // siniestro. Al menos una.
    polizas: z.array(polizaSchema).min(1, "Agrega al menos una póliza."),
    asegurados: z
      .array(aseguradoSchema)
      .min(1, "Agrega al menos un asegurado."),
    beneficiarios: z.array(beneficiarioSchema).optional(),
  })
  .superRefine((data, ctx) => {
    data.asegurados.forEach((a, i) => {
      if (a.tipo_persona === "fisica" && !a.nombre?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["asegurados", i, "nombre"],
          message: "Captura el nombre del asegurado.",
        });
      }
      if (a.tipo_persona === "moral") {
        if (!a.razon_social?.trim()) {
          ctx.addIssue({
            code: "custom",
            path: ["asegurados", i, "razon_social"],
            message: "Captura la razón social.",
          });
        }
        const repsConNombre = (a.representantes ?? []).filter((r) =>
          r.nombre?.trim(),
        );
        if (repsConNombre.length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["asegurados", i, "representantes"],
            message: "Agrega al menos un representante.",
          });
        }
      }
    });
    data.polizas.forEach((p, i) => {
      if (
        p.vigencia_inicio &&
        p.vigencia_fin &&
        p.vigencia_fin < p.vigencia_inicio
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["polizas", i, "vigencia_fin"],
          message: "El fin de vigencia no puede ser anterior al inicio.",
        });
      }
    });

    // Alicia (jul-2026): la suma de % participación de todos los
    // beneficiarios registrados debe ser 100%. Se ignoran las filas
    // "fantasma" (nombre vacío) que quedan por el default de 1 fila
    // vacía inicial — solo se valida si hay al menos un beneficiario
    // real con nombre. Si sí lo hay, se exige 100% exacto para evitar
    // que se distribuya mal la póliza.
    const bensConNombre = (data.beneficiarios ?? []).filter((b) =>
      b.nombre?.trim(),
    );
    if (bensConNombre.length > 0) {
      const suma = bensConNombre.reduce(
        (acc, b) => acc + (Number(b.porcentaje) || 0),
        0,
      );
      // Comparamos con tolerancia mínima (0.01) para permitir 33.33+33.33+33.34.
      if (Math.abs(suma - 100) > 0.01) {
        ctx.addIssue({
          code: "custom",
          path: ["beneficiarios"],
          message: `La suma del % de participación de los beneficiarios debe ser 100 (actualmente ${suma}%).`,
        });
      }
    }
  });

export type NuevoCasoSchema = z.infer<typeof nuevoCasoSchema>;
