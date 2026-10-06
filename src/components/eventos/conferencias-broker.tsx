"use client";

import { useState } from "react";
import { CalendarDays, List } from "lucide-react";
import type { Evento } from "@/lib/api/eventos";
import { cn } from "@/lib/utils";
import { BotonSolicitaInfo } from "@/components/whatsapp/boton-solicita-info";
import { CalendarioEventos } from "./calendario-eventos";
import { ListaEventos } from "./lista-eventos";

type Vista = "calendario" | "lista";

/**
 * /conferencias del broker: vista de calendario (default) o de lista (la
 * misma que usa Manuel, sin acciones de edición).
 */
export function ConferenciasBroker({
  mesActual,
  eventosMes,
  eventosProximos,
}: {
  mesActual: string;
  eventosMes: Evento[];
  eventosProximos: Evento[];
}) {
  const [vista, setVista] = useState<Vista>("calendario");

  const opciones: { valor: Vista; etiqueta: string; icono: typeof List }[] = [
    { valor: "calendario", etiqueta: "Calendario", icono: CalendarDays },
    { valor: "lista", etiqueta: "Lista", icono: List },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-brand-navy text-xl font-bold">Conferencias</h1>
          <p className="text-sm text-neutral-600">
            Conferencias, cursos y talleres de Total Assist. Da clic en un
            evento para ver el detalle y entrar.
          </p>
        </div>
        <div
          role="group"
          aria-label="Tipo de vista"
          className="flex gap-1 self-start rounded-full border border-neutral-200 bg-white p-1"
        >
          {opciones.map((o) => (
            <button
              key={o.valor}
              type="button"
              aria-pressed={vista === o.valor}
              onClick={() => setVista(o.valor)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                vista === o.valor
                  ? "bg-brand-navy text-white"
                  : "text-brand-navy/70 hover:text-brand-navy",
              )}
            >
              <o.icono className="h-3.5 w-3.5" aria-hidden="true" />
              {o.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {vista === "calendario" ? (
        <CalendarioEventos
          mesInicial={mesActual}
          eventosIniciales={eventosMes}
        />
      ) : (
        <ListaEventos
          modo="broker"
          eventosIniciales={eventosProximos}
          sinEncabezado
        />
      )}

      {/* CTA a comercial (mismo botón que Defensa Legal). Texto del servicio
          "Conferencias y capacitaciones" de totalassist-site. */}
      <section className="flex flex-col items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-brand-navy text-lg font-bold">
            Conferencias y capacitaciones para tu equipo
          </h2>
          <p className="text-sm text-neutral-600">
            Llevamos conferencias especializadas a empresas y grupos de trabajo:
            innovación, tendencias del sector y mejores prácticas profesionales.
          </p>
        </div>
        <BotonSolicitaInfo tema="conferencias" className="shrink-0" />
      </section>
    </div>
  );
}
