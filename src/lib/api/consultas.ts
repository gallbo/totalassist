/**
 * Tipos + labels + HTTP CLIENT del modulo Consultas.
 *
 * Este archivo es seguro tanto en cliente como en servidor: no importa
 * nada `server-only`. Las funciones server-side viven en
 * `consultas-server.ts` (que si toca cookies/headers). Los componentes
 * cliente importan de aqui.
 */

// ── Tipos ──────────────────────────────────────────────────────────────

export type TipoOpinion = "tecnica" | "juridica";
export type EstatusConsulta = "sin_asignar" | "en_curso" | "cerrada";
export type AutorTipo = "broker" | "admin";
export type TipoAdjunto = "imagen" | "audio";

export type Adjunto = {
  id: number;
  tipo: TipoAdjunto;
  nombre_original: string;
  mime: string;
  tamano_bytes: number;
  url: string;
  duracion_ms: number | null;
};

export type Mensaje = {
  id: number;
  autor_tipo: AutorTipo;
  autor_id: number;
  texto: string | null;
  leido_at: string | null;
  created_at: string;
  adjuntos: Adjunto[];
};

export type ConsultaResumen = {
  id: number;
  asunto: string;
  tipo_opinion: TipoOpinion;
  tipo_pregunta: string | null;
  estatus: EstatusConsulta;
  created_at: string;
  updated_at: string;
  ultimo_mensaje_at: string | null;
  sin_leer: number;
  /** Solo lo llena el endpoint admin. */
  broker?: { id: number; nombre: string; email: string } | null;
};

export type ConsultaDetalle = ConsultaResumen & {
  mensajes: Mensaje[];
};

export type TipoPregunta = { id: number; nombre: string };

export type BandejaAdmin =
  | "sin_responder"
  | "nuevos_mensajes"
  | "respondidas"
  | "cerradas";

// ── Labels para la UI ─────────────────────────────────────────────────

export const LABEL_TIPO_OPINION: Record<TipoOpinion, string> = {
  tecnica: "Técnica",
  juridica: "Jurídica",
};

export const LABEL_ESTATUS: Record<EstatusConsulta, string> = {
  sin_asignar: "Sin responder",
  en_curso: "En curso",
  cerrada: "Cerrada",
};

// ── API CLIENT (para componentes "use client") ────────────────────────
//
// Los componentes client-side NO manejan el access_token: le pegan al
// proxy `/api/proxy/skipper/...` (implementado en src/app/api/proxy) que
// agrega el Bearer server-side. Asi el token vive solo en la cookie
// httpOnly y jamas toca el bundle del cliente.

export async function apiClient<T>(
  path: string,
  init: RequestInit = {},
  contexto = path,
): Promise<T> {
  const res = await fetch(`/api/proxy/skipper${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const j = (await res.json()) as { message?: string };
      if (j?.message) mensaje = j.message;
    } catch {
      // ignorar
    }
    throw new Error(`${contexto}: ${mensaje}`);
  }
  return (await res.json()) as T;
}

// -- Broker (client) --

export async function obtenerConsultaBrokerClient(
  consultaId: number,
): Promise<ConsultaDetalle> {
  const j = await apiClient<{ data: ConsultaDetalle }>(
    `/api/brokers/consultas/${consultaId}`,
    { method: "GET" },
    "recargar consulta",
  );
  return j.data;
}

export async function crearConsultaClient(input: {
  asunto?: string;
  tipo_opinion: TipoOpinion;
  tipo_pregunta_id?: number | null;
  texto?: string;
  adjuntos?: File[];
  duraciones_ms?: (number | null)[];
}): Promise<ConsultaDetalle> {
  const fd = new FormData();
  if (input.asunto) fd.set("asunto", input.asunto);
  fd.set("tipo_opinion", input.tipo_opinion);
  if (input.tipo_pregunta_id != null)
    fd.set("tipo_pregunta_id", String(input.tipo_pregunta_id));
  if (input.texto) fd.set("texto", input.texto);
  (input.adjuntos ?? []).forEach((f) => fd.append("adjuntos[]", f));
  (input.duraciones_ms ?? []).forEach((d, i) => {
    if (d != null) fd.append(`duraciones_ms[${i}]`, String(d));
  });

  const j = await apiClient<{ data: ConsultaDetalle }>(
    "/api/brokers/consultas",
    { method: "POST", body: fd },
    "crear consulta",
  );
  return j.data;
}

export async function agregarMensajeBrokerClient(
  consultaId: number,
  input: {
    texto?: string;
    adjuntos?: File[];
    duraciones_ms?: (number | null)[];
  },
): Promise<Mensaje> {
  const fd = new FormData();
  if (input.texto) fd.set("texto", input.texto);
  (input.adjuntos ?? []).forEach((f) => fd.append("adjuntos[]", f));
  (input.duraciones_ms ?? []).forEach((d, i) => {
    if (d != null) fd.append(`duraciones_ms[${i}]`, String(d));
  });

  const j = await apiClient<{ data: Mensaje }>(
    `/api/brokers/consultas/${consultaId}/mensajes`,
    { method: "POST", body: fd },
    "agregar mensaje",
  );
  return j.data;
}

export async function marcarLeidosBrokerClient(
  consultaId: number,
): Promise<void> {
  await apiClient(`/api/brokers/consultas/${consultaId}/leer`, {
    method: "POST",
  });
}

export async function cerrarConsultaBrokerClient(
  consultaId: number,
): Promise<ConsultaDetalle> {
  const j = await apiClient<{ data: ConsultaDetalle }>(
    `/api/brokers/consultas/${consultaId}/cerrar`,
    { method: "POST" },
    "cerrar consulta",
  );
  return j.data;
}

// -- Admin (client) --

export async function obtenerConsultaAdminClient(
  consultaId: number,
): Promise<ConsultaDetalle> {
  const j = await apiClient<{ data: ConsultaDetalle }>(
    `/api/totalassist/admin/consultas/${consultaId}`,
    { method: "GET" },
    "recargar consulta",
  );
  return j.data;
}

export async function agregarMensajeAdminClient(
  consultaId: number,
  input: {
    texto?: string;
    adjuntos?: File[];
    duraciones_ms?: (number | null)[];
  },
): Promise<Mensaje> {
  const fd = new FormData();
  if (input.texto) fd.set("texto", input.texto);
  (input.adjuntos ?? []).forEach((f) => fd.append("adjuntos[]", f));
  (input.duraciones_ms ?? []).forEach((d, i) => {
    if (d != null) fd.append(`duraciones_ms[${i}]`, String(d));
  });

  const j = await apiClient<{ data: Mensaje }>(
    `/api/totalassist/admin/consultas/${consultaId}/mensajes`,
    { method: "POST", body: fd },
    "responder consulta",
  );
  return j.data;
}

export async function marcarLeidosAdminClient(
  consultaId: number,
): Promise<void> {
  await apiClient(`/api/totalassist/admin/consultas/${consultaId}/leer`, {
    method: "POST",
  });
}

export async function cerrarConsultaAdminClient(
  consultaId: number,
): Promise<ConsultaDetalle> {
  const j = await apiClient<{ data: ConsultaDetalle }>(
    `/api/totalassist/admin/consultas/${consultaId}/cerrar`,
    { method: "POST" },
    "cerrar consulta",
  );
  return j.data;
}

export async function reabrirConsultaAdminClient(
  consultaId: number,
): Promise<ConsultaDetalle> {
  const j = await apiClient<{ data: ConsultaDetalle }>(
    `/api/totalassist/admin/consultas/${consultaId}/reabrir`,
    { method: "POST" },
    "reabrir consulta",
  );
  return j.data;
}

// -- Enviar cliente final a comercial (reusa endpoint publico de Connect) --

/**
 * Envia los datos de un cliente final capturados por Manuel al area
 * comercial de Skipper. Reusa el endpoint publico
 * POST /api/connect/comercial/usuario/nuevo que ya existia para Connect
 * (ProspectoClienteController::crearUsuarioConnect); ahi se crea un
 * ProspectoCliente con via_id=6 y se notifica a los "fishers" del
 * departamento comercial por email.
 *
 * `conversacionResumen` se incluye para que el fisher tenga contexto
 * del hilo entre broker y Manuel.
 */
export async function enviarClienteAComercialClient(input: {
  nombre: string;
  email?: string;
  telefono?: string;
  conversacionResumen: string;
  urlArchivos?: string;
}): Promise<void> {
  const fd = new FormData();
  fd.set("nombre", input.nombre);
  if (input.email) fd.set("email", input.email);
  if (input.telefono) fd.set("telefono", input.telefono);
  fd.set("conversacion", input.conversacionResumen);
  fd.set("urlArchivos", input.urlArchivos ?? "");

  await apiClient(
    "/api/connect/comercial/usuario/nuevo",
    { method: "POST", body: fd },
    "enviar a comercial",
  );
}
