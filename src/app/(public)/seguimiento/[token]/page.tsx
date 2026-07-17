import { PageCard } from "@/components/layout/page-card";
import { ApiError } from "@/lib/api/client";
import {
  getCasoPublicoOrExpired,
  getDocumentosOrEmpty,
  type DocumentosResponse,
} from "@/lib/api/publico";
import { EnlaceExpirado } from "./_components/enlace-expirado";
import { SeguimientoHeader } from "./_components/seguimiento-header";
import { SeguimientoTabs } from "./_components/seguimiento-tabs";

const ESTATUS_CERRADOS = new Set([1, 3]);

type Props = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function SeguimientoPage({ params }: Props) {
  const { token } = await params;

  let payload: Awaited<ReturnType<typeof getCasoPublicoOrExpired>> = null;
  let documentos: DocumentosResponse = { grupos: [], otros: [] };
  let huboError = false;
  try {
    [payload, documentos] = await Promise.all([
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
        <SeguimientoTabs
          caso={payload.caso}
          token={token}
          documentos={documentos}
          evaluacion={payload.evaluacion}
          muestraEvaluacion={muestraEvaluacion}
        />
      </PageCard>
    </>
  );
}
