import { redirect } from "next/navigation";
import { PageCard } from "@/components/layout/page-card";
import { brokerApi } from "@/lib/api/brokers";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { CompletarPerfilForm } from "./_components/completar-perfil-form";

/** Para quien entró sin haber capturado domicilio y RFC (migración 144). */
export default async function CompletarPerfilPage() {
  const token = await getServerAccessToken();
  if (!token) redirect("/login");
  const perfil = await brokerApi.getPerfil(token).catch(() => null);
  if (perfil?.perfil_completo) redirect("/dashboard");
  const dir =
    perfil?.direcciones?.find((d) => d.principal) ?? perfil?.direcciones?.[0];

  return (
    <PageCard>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-brand-navy text-xl font-bold">
            Completa tu perfil
          </h1>
          <p className="text-sm text-neutral-600">
            Captura tu RFC y tu domicilio. Con eso queda habilitado el registro
            de siniestros y consultas.
          </p>
        </div>
        <CompletarPerfilForm
          inicial={{
            rfc: perfil?.rfc ?? "",
            domicilio: dir?.domicilio ?? "",
            ciudad: dir?.ciudad ?? "",
            estado: dir?.estado ?? "",
            codigo_postal: dir?.codigo_postal ?? "",
          }}
        />
      </div>
    </PageCard>
  );
}
