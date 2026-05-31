import { notFound, redirect } from "next/navigation";
import { PageCard } from "@/components/layout/page-card";
import {
  brokerApi,
  type CasoDetalle,
  type CuestionarioCaso,
} from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { CuestionarioCliente } from "./_components/cuestionario-cliente";

type Datos =
  | { ok: true; caso: CasoDetalle; cuestionario: CuestionarioCaso }
  | { ok: false };

export default async function CuestionarioCasoPage({
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
    const [caso, cuestionario] = await Promise.all([
      brokerApi.getCaso(token, casoId),
      brokerApi.getCuestionario(token, casoId),
    ]);
    datos = { ok: true, caso, cuestionario };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login");
      if (error.status === 404) notFound();
    }
    datos = { ok: false };
  }

  if (!datos.ok) {
    return (
      <PageCard>
        <p className="text-sm text-neutral-600">
          No pudimos cargar el cuestionario. Intenta de nuevo en unos segundos.
        </p>
      </PageCard>
    );
  }

  return (
    <PageCard>
      <CuestionarioCliente
        caso={datos.caso}
        preguntas={datos.cuestionario.cuestionario}
      />
    </PageCard>
  );
}
