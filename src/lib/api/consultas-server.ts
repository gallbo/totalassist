import "server-only";

import { getServerAccessToken } from "@/lib/auth-tokens";
import type {
  BandejaAdmin,
  ConsultaDetalle,
  ConsultaResumen,
  EstatusConsulta,
  TipoPregunta,
} from "@/lib/api/consultas";

/**
 * HTTP wrappers SERVER-SIDE del modulo Consultas.
 *
 * Solo usable en server components y route handlers. Aisla el import de
 * `getServerAccessToken` (que toca `next/headers`) del bundle cliente —
 * ver el error de build que salio cuando estaba todo mezclado en el
 * archivo `consultas.ts`.
 */

const SKIPPER_URL =
  process.env.NEXT_PUBLIC_SKIPPER_API_URL ?? "http://localhost:8080";

export async function apiSkipper(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getServerAccessToken();
  if (!token) {
    throw new Error("No hay sesión activa.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  return fetch(`${SKIPPER_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function pedirJson<T>(
  res: Response,
  contexto: string,
): Promise<T> {
  if (!res.ok) {
    let mensaje = `Skipper devolvió ${res.status} en ${contexto}`;
    try {
      const j = (await res.json()) as { message?: string };
      if (j?.message) mensaje = j.message;
    } catch {
      // ignorar
    }
    throw new Error(mensaje);
  }
  return (await res.json()) as T;
}

// ── Broker (server) ───────────────────────────────────────────────────

export async function apiSkipperListarConsultasBroker(params?: {
  estatus?: EstatusConsulta;
  q?: string;
  page?: number;
}): Promise<{
  data: ConsultaResumen[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}> {
  const q = new URLSearchParams();
  if (params?.estatus) q.set("estatus", params.estatus);
  if (params?.q) q.set("q", params.q);
  if (params?.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiSkipper(`/api/brokers/consultas${qs ? `?${qs}` : ""}`);
  return pedirJson(res, "listar mis consultas");
}

export async function apiSkipperMostrarConsultaBroker(
  id: number,
): Promise<ConsultaDetalle | null> {
  const res = await apiSkipper(`/api/brokers/consultas/${id}`);
  if (res.status === 404) return null;
  const j = await pedirJson<{ data: ConsultaDetalle }>(res, "mostrar consulta");
  return j.data;
}

export async function apiSkipperTiposPregunta(): Promise<TipoPregunta[]> {
  const res = await apiSkipper("/api/brokers/consultas/catalogos/tipos");
  const j = await pedirJson<{ data: TipoPregunta[] }>(res, "catálogo de tipos");
  return j.data;
}

// ── Admin (server) ────────────────────────────────────────────────────

export async function apiSkipperListarConsultasAdmin(params?: {
  bandeja?: BandejaAdmin;
  page?: number;
}): Promise<{
  data: ConsultaResumen[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    bandeja: BandejaAdmin;
  };
}> {
  const q = new URLSearchParams();
  if (params?.bandeja) q.set("bandeja", params.bandeja);
  if (params?.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiSkipper(
    `/api/totalassist/admin/consultas${qs ? `?${qs}` : ""}`,
  );
  return pedirJson(res, "listar bandeja admin");
}

export async function apiSkipperMostrarConsultaAdmin(
  id: number,
): Promise<ConsultaDetalle | null> {
  const res = await apiSkipper(`/api/totalassist/admin/consultas/${id}`);
  if (res.status === 404) return null;
  const j = await pedirJson<{ data: ConsultaDetalle }>(
    res,
    "mostrar consulta admin",
  );
  return j.data;
}

export async function apiSkipperConteoAdmin(): Promise<{
  sin_responder: number;
  nuevos_mensajes: number;
}> {
  const res = await apiSkipper("/api/totalassist/admin/consultas/conteo");
  return pedirJson(res, "conteo bandejas admin");
}
