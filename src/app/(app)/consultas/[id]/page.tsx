import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { HiloConsultaBroker } from "../_components/hilo-consulta-broker";
import { apiSkipperMostrarConsultaBroker } from "@/lib/api/consultas-server";

export default async function ConsultaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const consultaId = Number(id);
  if (!Number.isFinite(consultaId) || consultaId <= 0) notFound();

  const consulta = await apiSkipperMostrarConsultaBroker(consultaId);
  if (!consulta) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/consultas"
        className="text-brand-navy/70 hover:text-brand-navy flex items-center gap-1 self-start text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a mis consultas
      </Link>
      <HiloConsultaBroker consultaInicial={consulta} />
    </div>
  );
}
