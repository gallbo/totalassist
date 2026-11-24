import Link from "next/link";
import { PageCard } from "@/components/layout/page-card";
import { BrandButton } from "@/components/ui/brand-button";

/** Sin domicilio y RFC no se registran siniestros ni consultas (Skipper, migración 144). */
export function BloqueoPerfilIncompleto({ que }: { que: string }) {
  return (
    <PageCard>
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-brand-navy text-lg font-bold">
          Completa tu perfil para {que}
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-neutral-600">
          Antes de empezar necesitamos tu RFC y tu domicilio. Te toma un minuto
          y después ya puedes registrar siniestros y consultas.
        </p>
        <BrandButton
          type="button"
          render={<Link href="/completar-perfil" />}
          className="h-11 px-6"
        >
          Completar perfil
        </BrandButton>
      </div>
    </PageCard>
  );
}
