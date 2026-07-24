import Link from "next/link";
import { FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CasoResumen } from "@/lib/api/brokers";
import { CompartirCasoModal } from "@/app/(app)/casos/[id]/_components/compartir-caso-modal";

type Props = {
  casos: CasoResumen[];
};

/**
 * Bloque "Más recientes" — reemplaza al viejo "Tus favoritos" (jul-2026).
 *
 * Muestra los últimos 2 casos que el broker haya subido a la plataforma
 * con:
 *   - Aseguradora
 *   - Tipo de seguro
 *   - Botón compartir (abre `CompartirCasoModal` para generar la liga que
 *     el broker le manda a su asegurado — reutilizamos el mismo Sheet que
 *     está en la vista de detalle del caso).
 *   - Botón "Ver" que lleva al detalle interno del caso.
 *
 * Cuando el broker aún no tiene casos, se muestra un vacío educativo con
 * llamada a /casos/nuevo.
 */
export function MasRecientes({ casos }: Props) {
  if (casos.length === 0) {
    return (
      <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
        <h2 className="text-brand-navy text-base font-bold">Más recientes</h2>
        <div className="flex flex-col items-center gap-2 rounded-xl bg-blue-50/50 px-4 py-6 text-center">
          <FileText className="text-brand-navy/40 h-8 w-8" strokeWidth={1.5} />
          <div className="text-brand-navy text-sm font-semibold">
            Aún no tienes casos registrados
          </div>
          <p className="text-xs text-neutral-500">
            Cuando registres un caso aparecerá aquí.
          </p>
          <Button
            variant="outline"
            className="mt-2 rounded-full"
            render={<Link href="/casos/nuevo" />}
          >
            Registrar caso
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
      <h2 className="text-brand-navy text-base font-bold">Más recientes</h2>

      <div className="flex flex-col divide-y divide-neutral-100">
        {casos.map((caso) => (
          <div
            key={caso.id}
            className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
          >
            {/* Aseguradora — bloque principal */}
            <div className="min-w-0 flex-1">
              <div className="text-brand-navy text-sm leading-tight font-bold uppercase">
                {caso.aseguradora ?? "Sin aseguradora"}
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">Aseguradora</div>
            </div>

            {/* Tipo de seguro — bloque secundario */}
            <div className="min-w-0 flex-1">
              <div className="text-brand-navy text-sm leading-tight font-bold">
                {caso.tipo_seguro ?? "Sin tipo"}
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">
                Tipo de seguro
              </div>
            </div>

            {/* Botón compartir — abre el Sheet que ya usamos en /casos/[id]
                para generar la liga que va al asegurado. `correoCliente`
                queda null aquí porque no lo tenemos en el listado; el
                broker puede copiar la liga y compartirla manualmente. */}
            <div className="flex items-center gap-3 sm:gap-2">
              <CompartirCasoModal
                casoId={caso.id}
                correoCliente={null}
                trigger={
                  <button
                    type="button"
                    aria-label={`Compartir liga del caso ${caso.folio ?? caso.id}`}
                    className="hover:ring-brand-navy flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-neutral-300 transition hover:bg-neutral-50"
                  >
                    <Share2 className="text-brand-navy h-4 w-4" />
                  </button>
                }
              />

              {/* Botón Ver — link al detalle del caso */}
              <Button
                variant="ghost"
                className="text-brand-navy rounded-lg bg-blue-50 px-6 text-sm font-semibold hover:bg-blue-100"
                render={<Link href={`/casos/${caso.id}`} />}
              >
                Ver
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
