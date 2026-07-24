import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { BrandButton } from "@/components/ui/brand-button";
import type { DashboardData } from "@/lib/api/brokers";

type Props = {
  counts: DashboardData["casos_counts"];
  paqueteActivo: DashboardData["paquete_activo"];
};

// Umbral desde el cual mostrar la alerta "te quedan pocos casos". El
// cliente (Alicia, jul-2026) pidió que aparezca cuando queden 1 o menos
// casos disponibles en el paquete.
const UMBRAL_ALERTA = 1;

/**
 * Bloque "Estado de los casos" rediseñado (rediseño jul-2026).
 *
 * Estructura visual:
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │  Estado de los casos                       ┌───────────────┐  │
 *   │                                            │               │  │
 *   │  ┌──────────────────┬────────────────┐    │    Comprar    │  │
 *   │  │ Casos utilizados │ Casos disp Y/Z │    │               │  │
 *   │  └──────────────────┴────────────────┘    │               │  │
 *   │                                            │               │  │
 *   │  ┌──────────┬──────────────┬───────────┐  │               │  │
 *   │  │  En P.   │ Interr.  (0) │ Final.(0) │  │               │  │
 *   │  └──────────┴──────────────┴───────────┘  └───────────────┘  │
 *   └───────────────────────────────────────────────────────────────┘
 *
 * Cuando `casos_restantes <= UMBRAL_ALERTA` aparece una franja amarilla
 * bajo el título con el aviso.
 */
export function EstadoCasosBloque({ counts, paqueteActivo }: Props) {
  const casosDisponibles = paqueteActivo?.casos_restantes ?? 0;
  const totalPaquete = paqueteActivo?.numero_casos ?? 0;
  const casosUtilizados = Math.max(0, totalPaquete - casosDisponibles);
  const mostrarAlerta =
    paqueteActivo !== null && casosDisponibles <= UMBRAL_ALERTA;

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
      <div className="flex items-center gap-3">
        <h2 className="text-brand-navy text-base font-bold">
          Estado de los casos
        </h2>
      </div>

      {mostrarAlerta && (
        <div
          className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
          <span>
            {casosDisponibles === 0
              ? "Ya no te quedan casos disponibles. Contrata un nuevo paquete para seguir registrando."
              : "Te queda 1 caso disponible en tu paquete. Considera contratar uno nuevo."}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {/* Contenido principal: 2 barras apiladas */}
        <div className="flex flex-1 flex-col gap-3">
          {/* Barra 1: Casos utilizados vs disponibles */}
          <div className="flex overflow-hidden rounded-lg ring-1 ring-neutral-200">
            <div className="bg-brand-navy flex-1 px-5 py-3 text-sm font-semibold text-white">
              Casos utilizados ({casosUtilizados})
            </div>
            <div className="flex-1 bg-blue-50 px-5 py-3 text-sm font-semibold text-neutral-700">
              Casos disponibles {casosDisponibles}/{totalPaquete}
            </div>
          </div>

          {/* Barra 2: Estatus segmentado */}
          <div className="grid grid-cols-3 overflow-hidden rounded-lg ring-1 ring-neutral-200">
            <div className="bg-neutral-500 px-4 py-3 text-center text-sm font-semibold text-white">
              En proceso ({counts.en_proceso})
            </div>
            <div className="bg-neutral-700 px-4 py-3 text-center text-sm font-semibold text-white">
              Interrumpido ({counts.interrumpido})
            </div>
            <div className="bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white">
              Finalizado ({counts.finalizado})
            </div>
          </div>
        </div>

        {/* Botón Comprar a la derecha (en móvil pasa abajo).
            En desktop se centra vertical con las barras y queda a la
            altura de un botón CTA estándar — no ocupa toda la altura
            del bloque para no dominar visualmente. */}
        <div className="flex lg:items-center lg:self-center">
          <BrandButton
            render={<Link href="/paquetes" />}
            className="h-12 w-full px-8 text-sm whitespace-nowrap lg:w-auto"
          >
            Comprar
          </BrandButton>
        </div>
      </div>
    </section>
  );
}
