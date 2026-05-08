import { redirect } from "next/navigation";
import {
  brokerApi,
  type FeedbackResumen,
  type PerfilBroker,
} from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { PageCard } from "@/components/layout/page-card";
import { PerfilCliente } from "./_components/perfil-cliente";

async function cargarPerfil(
  token: string,
): Promise<PerfilBroker | "auth" | "error"> {
  try {
    return await brokerApi.getPerfil(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return "auth";
    return "error";
  }
}

export default async function PerfilPage() {
  const token = await getServerAccessToken();
  if (!token) redirect("/login");

  const [perfil, feedback] = await Promise.all([
    cargarPerfil(token),
    brokerApi.getFeedbackResumen(token).catch<FeedbackResumen>(() => ({
      promedio: 0,
      total: 0,
    })),
  ]);

  if (perfil === "auth") redirect("/login");

  if (perfil === "error") {
    return (
      <PageCard>
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <h1 className="text-brand-navy text-xl font-bold">
            No pudimos cargar tu perfil
          </h1>
          <p className="text-sm text-neutral-600">
            Intenta recargar la página. Si el problema persiste, contáctanos.
          </p>
        </div>
      </PageCard>
    );
  }

  return (
    <PageCard>
      <PerfilCliente initial={perfil} feedback={feedback} />
    </PageCard>
  );
}
