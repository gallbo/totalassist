import { apiSkipperListarConsultasBroker } from "@/lib/api/consultas-server";
import { ListaConsultasBroker } from "./_components/lista-consultas-broker";

/**
 * Modulo Consultas (broker) — vista principal.
 *
 * Server component: hace fetch server-side a Skipper con el token del
 * broker autenticado (via cookie) y pasa la lista inicial al componente
 * cliente. El componente cliente refresca despues de crear/cerrar.
 */
export default async function ConsultasPage() {
  let consultasIniciales: Awaited<
    ReturnType<typeof apiSkipperListarConsultasBroker>
  >["data"];
  try {
    const r = await apiSkipperListarConsultasBroker();
    consultasIniciales = r.data;
  } catch {
    consultasIniciales = [];
  }
  return <ListaConsultasBroker consultasIniciales={consultasIniciales} />;
}
