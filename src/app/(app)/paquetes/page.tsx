import { redirect } from "next/navigation";
import { PageCard } from "@/components/layout/page-card";
import {
  brokerApi,
  type PaqueteCatalogo,
  type PaqueteContratado,
} from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { PaquetesCliente } from "./_components/paquetes-cliente";

type Datos =
  | { ok: true; paquetes: PaqueteContratado[]; catalogo: PaqueteCatalogo[] }
  | { ok: false };

export default async function PaquetesPage() {
  const token = await getServerAccessToken();
  if (!token) {
    redirect("/login");
  }

  let datos: Datos;
  try {
    const [paquetes, catalogo] = await Promise.all([
      brokerApi.getPaquetes(token),
      brokerApi.getCatalogoPaquetes(token),
    ]);
    datos = { ok: true, paquetes, catalogo };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    datos = { ok: false };
  }

  if (!datos.ok) {
    return (
      <PageCard>
        <p className="text-sm text-neutral-600">
          No pudimos cargar tus paquetes. Intenta de nuevo en unos segundos.
        </p>
      </PageCard>
    );
  }

  return (
    <PageCard>
      <PaquetesCliente paquetes={datos.paquetes} catalogo={datos.catalogo} />
    </PageCard>
  );
}
