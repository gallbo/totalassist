import { ApiError, request } from "./client";

export type EvaluacionPublica = {
  calificacion: number;
  comentarios: string | null;
  created_at: string | null;
};

export type EnviarEvaluacionInput = {
  calificacion: number;
  comentarios?: string;
};

export type CasoPublico = {
  folio: string | null;
  estatus: { id: number; label: string };
  tipo_persona: "fisica" | "moral";
  nombre_asegurado: string | null;
  nombre_empresa: string | null;
  nombre_comercial: string | null;
  nombre_representante: string | null;
  tipo_seguro: string | null;
  aseguradora: string | null;
  fecha_siniestro: string | null;
  num_siniestro_poliza: string | null;
  folio_poliza: string | null;
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
