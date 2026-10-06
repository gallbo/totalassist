import "server-only";

import { apiSkipper, pedirJson } from "@/lib/api/consultas-server";
import {
  queryFiltros,
  type Evento,
  type FiltrosEventos,
} from "@/lib/api/eventos";

/**
 * Eventos para el server component del broker. Sin filtros = de hoy en
 * adelante; con `mes` = ese mes completo (lo usa el calendario).
 */
export async function apiSkipperListarEventosBroker(
  f: FiltrosEventos = {},
): Promise<Evento[]> {
  const res = await apiSkipper(`/api/brokers/eventos${queryFiltros(f)}`);
  const j = await pedirJson<{ data: Evento[] }>(res, "listar conferencias");
  return j.data;
}

/** Lista inicial (de hoy en adelante) para el server component del admin. */
export async function apiSkipperListarEventosAdmin(): Promise<Evento[]> {
  const res = await apiSkipper("/api/totalassist/admin/eventos");
  const j = await pedirJson<{ data: Evento[] }>(
    res,
    "listar conferencias admin",
  );
  return j.data;
}
