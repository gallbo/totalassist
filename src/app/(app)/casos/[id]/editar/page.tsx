import { notFound, redirect } from "next/navigation";
import { PageCard } from "@/components/layout/page-card";
import {
  brokerApi,
  type Aseguradora,
  type CasoDetalle,
  type Estado,
  type TipoSeguro,
} from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { EditarCasoCliente } from "./_components/editar-caso-cliente";

type Datos =
  | {
      ok: true;
      caso: CasoDetalle;
      aseguradoras: Aseguradora[];
      tiposSeguro: TipoSeguro[];
      estados: Estado[];
    }
  | { ok: false; status: number };

export default async function EditarCasoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const casoId = Number(id);
  if (!Number.isFinite(casoId) || casoId <= 0) notFound();

  const token = await getServerAccessToken();
  if (!token) {
    redirect("/login");
  }

  let datos: Datos;
  try {
    const [caso, bootstrap] = await Promise.all([
      brokerApi.getCaso(token, casoId),
      brokerApi.getNuevoCasoBootstrap(token),
    ]);
    datos = {
      ok: true,
      caso,
      aseguradoras: bootstrap.aseguradoras,
      tiposSeguro: bootstrap.tipos_seguro,
      estados: bootstrap.estados,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login");
      if (error.status === 404) notFound();
      datos = { ok: false, status: error.status };
    } else {
      datos = { ok: false, status: 0 };
    }
  }

  if (!datos.ok) {
    return (
      <PageCard>
        <p className="text-sm text-neutral-600">
          No pudimos cargar el caso. Intenta de nuevo en unos segundos.
        </p>
      </PageCard>
    );
  }

  return (
    <PageCard>
      <EditarCasoCliente
        caso={datos.caso}
        aseguradoras={datos.aseguradoras}
        tiposSeguro={datos.tiposSeguro}
        estados={datos.estados}
      />
    </PageCard>
  );
}
