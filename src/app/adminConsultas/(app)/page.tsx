import { apiSkipperListarConsultasAdmin } from "@/lib/api/consultas-server";
import { TabsAdmin } from "../_components/tabs-admin";

/**
 * Home del panel admin de Manuel. Server component: prefetchea la bandeja
 * "sin_responder" y la pasa al componente cliente, que puede cambiar de
 * bandeja on-the-fly llamando al proxy.
 */
export default async function AdminHomePage() {
  let iniciales: Awaited<
    ReturnType<typeof apiSkipperListarConsultasAdmin>
  >["data"];
  try {
    const r = await apiSkipperListarConsultasAdmin({
      bandeja: "sin_responder",
    });
    iniciales = r.data;
  } catch {
    iniciales = [];
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-brand-navy text-2xl font-bold">
          Consultas de brokers
        </h1>
        <p className="text-sm text-neutral-600">
          Elige una bandeja para ver las consultas. Puedes moverte entre
          bandejas con las flechas del teclado.
        </p>
      </header>
      <TabsAdmin
        bandejaInicial="sin_responder"
        consultasIniciales={iniciales}
      />
    </div>
  );
}
