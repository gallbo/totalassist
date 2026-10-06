import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apiSkipperTiposPregunta } from "@/lib/api/consultas-server";
import { NuevaConsultaForm } from "../_components/nueva-consulta-form";

export default async function NuevaConsultaPage() {
  let tiposPregunta: Awaited<ReturnType<typeof apiSkipperTiposPregunta>>;
  try {
    tiposPregunta = await apiSkipperTiposPregunta();
  } catch {
    tiposPregunta = [];
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/consultas"
        className="text-brand-navy/70 hover:text-brand-navy flex items-center gap-1 self-start text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a mis consultas
      </Link>
      <h1 className="text-brand-navy text-xl font-bold">Nueva consulta</h1>
      <p className="text-sm text-neutral-600">
        Elige el tipo (Técnica o Jurídica) y describe tu duda con detalle. El
        equipo te responderá por este mismo canal y te llegará un correo cuando
        haya respuesta.
      </p>
      <NuevaConsultaForm tiposPregunta={tiposPregunta} />
    </div>
  );
}
