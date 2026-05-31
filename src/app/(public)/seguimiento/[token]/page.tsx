import { PageCard } from "@/components/layout/page-card";
import { ApiError } from "@/lib/api/client";
import {
  getCasoPublicoOrExpired,
  getDocumentosOrEmpty,
  type GrupoDocumentos,
} from "@/lib/api/publico";
import { DocumentosAsegurado } from "./_components/documentos-asegurado";
import { EnlaceExpirado } from "./_components/enlace-expirado";
import { Evaluacion } from "./_components/evaluacion";
import { SeguimientoCliente } from "./_components/seguimiento-cliente";
import { SeguimientoHeader } from "./_components/seguimiento-header";

const ESTATUS_CERRADOS = new Set([1, 3]);

type Props = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function SeguimientoPage({ params }: Props) {
  const { token } = await params;

  let payload: Awaited<ReturnType<typeof getCasoPublicoOrExpired>> = null;
  let grupos: GrupoDocumentos[] = [];
  let huboError = false;
  try {
    [payload, grupos] = await Promise.all([
      getCasoPublicoOrExpired(token),
      getDocumentosOrEmpty(token),
    ]);
  } catch (error) {
    huboError = error instanceof ApiError;
  }

  if (huboError) {
    return (
      <>
        <SeguimientoHeader broker={null} />
        <PageCard>
          <p className="text-sm text-neutral-600">
            No pudimos cargar el caso. Intenta de nuevo en unos segundos.
          </p>
        </PageCard>
      </>
    );
  }

  if (!payload) {
    return (
      <>
        <SeguimientoHeader broker={null} />
        <EnlaceExpirado />
      </>
    );
  }

  const muestraEvaluacion = ESTATUS_CERRADOS.has(payload.caso.estatus.id);

  return (
    <>
      <SeguimientoHeader broker={payload.broker} />
      <PageCard>
        <SeguimientoCliente caso={payload.caso} />
        <div className="mt-6">
          <DocumentosAsegurado token={token} grupos={grupos} />
        </div>
        {muestraEvaluacion ? (
          <div className="mt-6">
            <Evaluacion token={token} evaluacionInicial={payload.evaluacion} />
          </div>
        ) : null}
      </PageCard>
    </>
  );
}
