import { apiSkipperListarEventosAdmin } from "@/lib/api/eventos-server";
import { ListaEventos } from "@/components/eventos/lista-eventos";
import type { Evento } from "@/lib/api/eventos";

/** Alta y edicion de conferencias, cursos y talleres (Manuel). */
export default async function AdminConferenciasPage() {
  let eventos: Evento[];
  try {
    eventos = await apiSkipperListarEventosAdmin();
  } catch {
    eventos = [];
  }
  return <ListaEventos modo="admin" eventosIniciales={eventos} />;
}
