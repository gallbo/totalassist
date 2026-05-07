import { Unlink } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";

export function EnlaceExpirado() {
  return (
    <PageCard className="text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-8">
        <Unlink className="h-14 w-14 text-neutral-400" />
        <h1 className="text-brand-navy text-xl font-bold">
          Este enlace ya no está disponible
        </h1>
        <p className="text-sm text-neutral-600">
          La liga que estás abriendo expiró. Pídele a tu broker que te comparta
          una nueva para seguir consultando el avance de tu caso.
        </p>
      </div>
    </PageCard>
  );
}
