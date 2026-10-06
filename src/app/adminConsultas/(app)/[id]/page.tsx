import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { HiloConsultaAdmin } from "../../_components/hilo-consulta-admin";
import { apiSkipperMostrarConsultaAdmin } from "@/lib/api/consultas-server";

export default async function AdminConsultaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const consultaId = Number(id);
  if (!Number.isFinite(consultaId) || consultaId <= 0) notFound();

  const consulta = await apiSkipperMostrarConsultaAdmin(consultaId);
  if (!consulta) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/adminConsultas"
        className="text-brand-navy/70 hover:text-brand-navy flex items-center gap-1 self-start text-sm"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Volver a la lista
      </Link>
      <HiloConsultaAdmin consultaInicial={consulta} />
    </div>
  );
}
