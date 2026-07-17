import { PageCard } from "@/components/layout/page-card";
import {
  TERMINOS_INCISOS,
  TERMINOS_PARRAFOS,
  TERMINOS_TITULO,
  TERMINOS_VERSION,
} from "@/lib/terminos";

export const metadata = {
  title: "Condiciones de uso",
};

export default function CondicionesPage() {
  return (
    <PageCard>
      <h1 className="text-brand-navy text-2xl font-semibold">
        {TERMINOS_TITULO}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Versión {TERMINOS_VERSION}
      </p>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-700">
        {TERMINOS_PARRAFOS.map((parrafo, i) => (
          <p key={i}>{parrafo}</p>
        ))}
        <div className="space-y-2 pl-4">
          {TERMINOS_INCISOS.map((inciso, i) => (
            <p key={i}>{inciso}</p>
          ))}
        </div>
      </div>
    </PageCard>
  );
}
