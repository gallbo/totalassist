import { apiSkipperListarEventosBroker } from "@/lib/api/eventos-server";
import { ConferenciasBroker } from "@/components/eventos/conferencias-broker";

/**
 * Conferencias / cursos / talleres (broker). Reemplaza la seccion de
 * eventos de Connect. Server component: trae el mes actual (calendario,
 * vista por defecto) y los proximos eventos (vista de lista).
 */
export default async function ConferenciasPage() {
  // Mes actual en la zona de negocio; Skipper interpreta `mes` igual.
  const mesActual = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mazatlan",
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .slice(0, 7);

  const [eventosMes, eventosProximos] = await Promise.all([
    apiSkipperListarEventosBroker({ mes: mesActual }).catch(() => []),
    apiSkipperListarEventosBroker().catch(() => []),
  ]);

  return (
    <ConferenciasBroker
      mesActual={mesActual}
      eventosMes={eventosMes}
      eventosProximos={eventosProximos}
    />
  );
}
