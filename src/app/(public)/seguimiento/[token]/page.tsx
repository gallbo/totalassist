import { PageCard } from "@/components/layout/page-card";
import { ApiError } from "@/lib/api/client";
import { getCasoPublicoOrExpired } from "@/lib/api/publico";
import { EnlaceExpirado } from "./_components/enlace-expirado";
import { SeguimientoCliente } from "./_components/seguimiento-cliente";
import { SeguimientoHeader } from "./_components/seguimiento-header";

type Props = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function SeguimientoPage({ params }: Props) {
  const { token } = await params;

  let payload: Awaited<ReturnType<typeof getCasoPublicoOrExpired>> = null;
  let huboError = false;
  try {
    payload = await getCasoPublicoOrExpired(token);
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

  return (
    <>
      <SeguimientoHeader broker={payload.broker} />
      <PageCard>
        <SeguimientoCliente caso={payload.caso} />
      </PageCard>
    </>
  );
}
