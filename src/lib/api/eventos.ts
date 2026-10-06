/**
 * Tipos + labels + HTTP CLIENT del modulo Conferencias (eventos).
 * Seguro en cliente y servidor; las funciones server-side viven en
 * `eventos-server.ts`.
 *
 * Backend: Skipper `Api\Broker\EventoController` (lectura) y
 * `Api\TotalAssistAdmin\EventoController` (alta/edicion por Manuel).
 */
import { apiClient } from "@/lib/api/consultas";

export type TipoEvento = "conferencia" | "curso" | "taller";

export type Evento = {
  id: number;
  tipo: TipoEvento;
  nombre: string;
  descripcion: string;
  /** ISO en UTC (termina en Z). */
  fecha: string;
  /** Fecha aun no confirmada: se muestra "Próximamente". */
  proximamente: boolean;
  url: string | null;
};

export type EventoInput = Omit<Evento, "id">;

export type FiltrosEventos = {
  tipo?: TipoEvento;
  /** YYYY-MM. Sin mes = de hoy en adelante. */
  mes?: string;
};

export const TIPOS_EVENTO: TipoEvento[] = ["conferencia", "curso", "taller"];

export const LABEL_TIPO_EVENTO: Record<TipoEvento, string> = {
  conferencia: "Conferencia",
  curso: "Curso",
  taller: "Taller",
};

export function queryFiltros(f: FiltrosEventos): string {
  const q = new URLSearchParams();
  if (f.tipo) q.set("tipo", f.tipo);
  if (f.mes) q.set("mes", f.mes);
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ── Broker (client) ──

export async function listarEventosBrokerClient(
  f: FiltrosEventos,
): Promise<Evento[]> {
  const j = await apiClient<{ data: Evento[] }>(
    `/api/brokers/eventos${queryFiltros(f)}`,
    { method: "GET" },
    "cargar conferencias",
  );
  return j.data;
}

// ── Admin (client) ──

export async function listarEventosAdminClient(
  f: FiltrosEventos,
): Promise<Evento[]> {
  const j = await apiClient<{ data: Evento[] }>(
    `/api/totalassist/admin/eventos${queryFiltros(f)}`,
    { method: "GET" },
    "cargar conferencias",
  );
  return j.data;
}

export async function guardarEventoAdminClient(
  input: EventoInput,
  id?: number,
): Promise<Evento> {
  const j = await apiClient<{ data: Evento }>(
    id
      ? `/api/totalassist/admin/eventos/${id}`
      : "/api/totalassist/admin/eventos",
    { method: id ? "PUT" : "POST", body: JSON.stringify(input) },
    id ? "editar evento" : "crear evento",
  );
  return j.data;
}

export async function borrarEventoAdminClient(id: number): Promise<void> {
  await apiClient(
    `/api/totalassist/admin/eventos/${id}`,
    { method: "DELETE" },
    "borrar evento",
  );
}
