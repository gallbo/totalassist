"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { IndicadorRequerido } from "@/components/ui/indicador-requerido";

// Acordeón simple para seccionar formularios largos. Cada sección controla su
// estado abierto/cerrado; `forzarAbierto` permite al padre abrir una sección
// cuando tiene errores de validación. `obligatorio` pinta el indicador
// amarillo/azul en el header; `nota` muestra un texto corto a su izquierda.
export function AccordionSection({
  titulo,
  descripcion,
  abiertoInicial = false,
  forzarAbierto = false,
  conError = false,
  obligatorio,
  nota,
  children,
}: {
  titulo: string;
  descripcion?: string;
  abiertoInicial?: boolean;
  forzarAbierto?: boolean;
  conError?: boolean;
  obligatorio?: boolean;
  nota?: string;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const visible = abierto || forzarAbierto;

  return (
    <section
      className={cn(
        "rounded-xl border",
        conError ? "border-red-300" : "border-neutral-200",
      )}
    >
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left hover:bg-neutral-50 sm:px-5"
        aria-expanded={visible}
      >
        <span className="flex min-w-0 flex-col">
          <span
            className={cn(
              "text-base font-bold",
              conError ? "text-red-700" : "text-brand-navy",
            )}
          >
            {titulo}
          </span>
          {descripcion ? (
            <span className="text-sm text-neutral-600">{descripcion}</span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-2 sm:gap-3">
          {nota ? (
            <span className="hidden text-xs text-neutral-500 sm:block">
              {nota}
            </span>
          ) : null}
          {obligatorio !== undefined ? (
            <IndicadorRequerido obligatorio={obligatorio} />
          ) : null}
          <ChevronDown
            className={cn(
              "text-brand-navy/60 h-5 w-5 transition-transform",
              visible && "rotate-180",
            )}
          />
        </span>
      </button>
      {visible ? (
        <div className="flex flex-col gap-4 border-t border-neutral-100 px-4 pt-4 pb-5 sm:px-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
