import Link from "next/link";
import { redirect } from "next/navigation";
import { PageCard } from "@/components/layout/page-card";
import { BrandButton } from "@/components/ui/brand-button";
import { MensajeAltaDemanda } from "@/components/mensaje-alta-demanda";
import {
  brokerApi,
  type Aseguradora,
  type CuestionarioPregunta,
  type Estado,
  type PaqueteContratado,
  type TipoSeguro,
} from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { NuevoCasoCliente } from "./_components/nuevo-caso-cliente";

type Datos =
  | {
      ok: true;
      aseguradoras: Aseguradora[];
      tiposSeguro: TipoSeguro[];
      estados: Estado[];
      paqueteActivo: PaqueteContratado | null;
      cuestionarios: Record<string, CuestionarioPregunta[]>;
    }
  | { ok: false };

export default async function NuevoCasoPage() {
  const token = await getServerAccessToken();
  if (!token) {
    redirect("/login");
  }

  const config = await brokerApi.getConfig(token).catch(() => null);
  if (config && !config.registro_casos_habilitado) {
    return (
      <PageCard>
        <div className="flex flex-col items-start gap-4">
          <h1 className="text-brand-navy text-lg font-bold">
            Registro de casos en pausa
          </h1>
          <p className="max-w-prose text-sm leading-relaxed text-neutral-600">
            <MensajeAltaDemanda />
          </p>
          <BrandButton
            type="button"
            tone="secondary"
            render={<Link href="/casos" />}
            className="h-11 px-6"
          >
            Volver a mis casos
          </BrandButton>
        </div>
      </PageCard>
    );
  }

  let datos: Datos;
  try {
    const bootstrap = await brokerApi.getNuevoCasoBootstrap(token);

    const paqueteActivo: PaqueteContratado | null = bootstrap.paquete_activo
      ? {
          id: bootstrap.paquete_activo.id,
          paquete_id: bootstrap.paquete_activo.id,
          descripcion: bootstrap.paquete_activo.descripcion,
          tipo: null,
          fecha_contratacion: null,
          fecha_expiracion: bootstrap.paquete_activo.fecha_expiracion,
          numero_casos: bootstrap.paquete_activo.numero_casos,
          casos_consumidos: bootstrap.paquete_activo.casos_consumidos,
          casos_restantes: bootstrap.paquete_activo.casos_restantes,
          vigente: true,
          activo: true,
        }
      : null;

    datos = {
      ok: true,
      aseguradoras: bootstrap.aseguradoras,
      tiposSeguro: bootstrap.tipos_seguro,
      estados: bootstrap.estados,
      paqueteActivo,
      cuestionarios: bootstrap.cuestionarios ?? {},
    };
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
          No pudimos cargar el formulario. Intenta de nuevo en unos segundos.
        </p>
      </PageCard>
    );
  }

  return (
    <PageCard>
      <NuevoCasoCliente
        aseguradoras={datos.aseguradoras}
        tiposSeguro={datos.tiposSeguro}
        estados={datos.estados}
        paqueteActivo={datos.paqueteActivo}
        cuestionarios={datos.cuestionarios}
      />
    </PageCard>
  );
}
