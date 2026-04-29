import { notFound, redirect } from "next/navigation";
import { PageCard } from "@/components/layout/page-card";
import { brokerApi, type CasoDetalle } from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { CasoDetalleVista } from "./_components/caso-detalle";

export default async function CasoDetallePage({
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

  let caso: CasoDetalle | null = null;
  try {
    caso = await brokerApi.getCaso(token, casoId);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login");
      if (error.status === 404) notFound();
    }
  }

  if (!caso) {
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
      <CasoDetalleVista caso={caso} />
    </PageCard>
  );
}
