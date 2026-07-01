import { redirect } from "next/navigation";
import { PageCard } from "@/components/layout/page-card";
import { brokerApi, type ListaCasos } from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { CasosTable } from "./_components/casos-table";

type SearchParams = Promise<{
  q?: string;
  page?: string;
  estatus_caso?: string;
}>;

export default async function CasosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const token = await getServerAccessToken();
  if (!token) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q ?? "";
  const estatusCaso = params.estatus_caso ?? "todos";

  let lista: ListaCasos | null = null;
  let registroHabilitado = true;
  let tieneCupo = true;
  try {
    const [listaResp, config, paquetes] = await Promise.all([
      brokerApi.getCasos(token, {
        page,
        per_page: 20,
        q: q || undefined,
        estatus_caso: estatusCaso !== "todos" ? Number(estatusCaso) : undefined,
      }),
      brokerApi.getConfig(token).catch(() => null),
      brokerApi.getPaquetes(token).catch(() => null),
    ]);
    lista = listaResp;
    if (config) {
      registroHabilitado = config.registro_casos_habilitado;
    }
    if (paquetes) {
      tieneCupo = paquetes.some((p) => p.activo);
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
  }

  if (!lista) {
    return (
      <PageCard>
        <p className="text-sm text-neutral-600">
          No pudimos cargar tus casos. Intenta de nuevo en unos segundos.
        </p>
      </PageCard>
    );
  }

  return (
    <PageCard>
      <CasosTable
        initial={lista}
        initialQuery={q}
        initialEstatus={estatusCaso}
        registroHabilitado={registroHabilitado}
        tieneCupo={tieneCupo}
      />
    </PageCard>
  );
}
