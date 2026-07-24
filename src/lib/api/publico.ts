import { ApiError, type ApiErrorPayload, request } from "./client";

const baseURL =
  process.env.NEXT_PUBLIC_SKIPPER_API_URL ?? "http://localhost:8080";

export type EvaluacionPublica = {
  calificacion: number;
  comentarios: string | null;
  created_at: string | null;
};

export type EnviarEvaluacionInput = {
  calificacion: number;
  comentarios?: string;
};

export type EtapaCoberturaPublica = {
  nombre: string | null;
  estatus: "pendiente" | "activa" | "finalizada" | "cancelada";
  porcentaje?: number;
};

export type ResultadoCoberturaPublica = {
  tipo: "con_pago" | "sin_pago" | "suma_agotada" | "interrumpida";
  descripcion: string;
  monto: number | null;
  fecha: string | null;
};

export type CoberturaPublica = {
  nombre: string | null;
  etapa_actual: string | null;
  ultima_actividad: string | null;
  avance?: number;
  resultado: ResultadoCoberturaPublica | null;
  etapas: EtapaCoberturaPublica[];
};

export type CasoPublico = {
  folio: string | null;
  estatus: { id: number; label: string };
  tipo_persona: "fisica" | "moral";
  nombre_asegurado: string | null;
  nombre_empresa: string | null;
  nombre_comercial: string | null;
  nombre_representante: string | null;
  rfc: string | null;
  correo: string | null;
  telefono: string | null;
  celular: string | null;
  tipo_seguro: string | null;
  aseguradora: string | null;
  fecha_siniestro: string | null;
  num_siniestro_poliza: string | null;
  folio_poliza: string | null;
  monto_estimado: string | number | null;
  coberturas: CoberturaPublica[];
  avance_general?: number;
  direccion: {
    domicilio: string | null;
    estado: string | null;
    ciudad: string | null;
  };
  contactos_atencion: Array<{
    nombre: string;
    telefono: string | null;
    email: string | null;
  }>;
  beneficiarios: Array<{
    nombre: string;
    parentesco: string | null;
    porcentaje: number | null;
  }>;
  archivos: Array<{
    nombre_original: string;
    mime_type: string | null;
    tamano: number | null;
    url: string | null;
    created_at: string | null;
  }>;
};

export type BrokerPublicoCompartido = {
  nombre: string;
  logo_url: string | null;
};

export type CasoPublicoResponse = {
  caso: CasoPublico;
  broker: BrokerPublicoCompartido | null;
  evaluacion: EvaluacionPublica | null;
};

export type DocumentoPublico = {
  id: number;
  nombre_original: string;
  tipo_documento: string | null;
  mime_type: string | null;
  tamano: number | null;
  url: string | null;
  created_at: string | null;
};

// Documento del checklist que el equipo de Total Claim Assist le asignó al
// asegurado. "pendiente" = aún no lo entrega; "entregado" = ya tiene archivo
// o fecha de entrega registrada.
export type DocumentoChecklist = {
  id: number;
  nombre: string;
  estado: "pendiente" | "entregado";
  fecha_compromiso: string | null;
  fecha_entrega: string | null;
  observaciones: string | null;
  archivo: DocumentoPublico | null;
};

export type GrupoDocumentos = {
  cobertura_id: number | null;
  cobertura: string;
  documentos: DocumentoChecklist[];
};

export type DocumentosResponse = {
  grupos: GrupoDocumentos[];
  otros: DocumentoPublico[];
};

export const publicoApi = {
  getCaso(token: string) {
    return request<CasoPublicoResponse>({
      method: "GET",
      url: `/api/publico/casos/${encodeURIComponent(token)}`,
    });
  },

  enviarEvaluacion(token: string, input: EnviarEvaluacionInput) {
    return request<EvaluacionPublica>({
      method: "POST",
      url: `/api/publico/casos/${encodeURIComponent(token)}/evaluacion`,
      data: input,
    });
  },

  getDocumentos(token: string) {
    return request<DocumentosResponse>({
      method: "GET",
      url: `/api/publico/casos/${encodeURIComponent(token)}/documentos`,
    });
  },

  // fetch nativo (no axios) por el bug de FormData de axios v1 en Node — mismo
  // motivo que subirArchivoCaso en brokers.ts. Corre server-side (server action),
  // así que no hay CORS de por medio. Si `documentoCasoId` viene, la subida se
  // liga a ese documento del checklist y Skipper lo marca como entregado.
  async subirDocumento(
    token: string,
    archivo: File,
    documentoCasoId?: number,
  ): Promise<DocumentoChecklist | DocumentoPublico> {
    const form = new FormData();
    form.append("archivo", archivo);
    if (documentoCasoId) {
      form.append("documento_caso_id", String(documentoCasoId));
    }

    const res = await fetch(
      `${baseURL}/api/publico/casos/${encodeURIComponent(token)}/documentos`,
      {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      },
    );

    if (!res.ok) {
      let payload: ApiErrorPayload | undefined;
      try {
        payload = (await res.json()) as ApiErrorPayload;
      } catch {
        // Respuesta sin JSON; usamos el status para mapear el mensaje.
      }
      throw new ApiError(
        payload?.mensaje ??
          "No pudimos enviar el documento. Intenta de nuevo en unos segundos.",
        res.status,
        payload?.error,
        payload?.detalles ?? payload?.errors,
      );
    }

    return (await res.json()) as DocumentoChecklist | DocumentoPublico;
  },
};

// Devuelve `null` cuando el token expiro o no existe (Skipper responde 410).
// Cualquier otro error sigue propagandose como `ApiError` para que el caller
// muestre fallback generico.
export async function getCasoPublicoOrExpired(
  token: string,
): Promise<CasoPublicoResponse | null> {
  try {
    return await publicoApi.getCaso(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 410) {
      return null;
    }
    throw error;
  }
}

// Los documentos son secundarios: si fallan no deben tumbar la página de
// seguimiento. Cualquier error (incluido 410) se traduce a respuesta vacía.
export async function getDocumentosOrEmpty(
  token: string,
): Promise<DocumentosResponse> {
  try {
    return await publicoApi.getDocumentos(token);
  } catch {
    return { grupos: [], otros: [] };
  }
}
