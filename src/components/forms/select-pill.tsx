"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SelectPillOption = { value: string; label: string };

type Props = {
  label: string;
  options: SelectPillOption[];
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  buscable?: boolean;
};

export function SelectPill({
  label,
  options,
  value,
  onChange,
  invalid = false,
  buscable = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const seleccionada = options.find((o) => o.value === value);

  // Cierra el panel con Escape (devolviendo el foco al botón) o al hacer clic
  // fuera. El botón y las opciones viven dentro de rootRef, así que sus clics
  // no disparan el cierre por click-outside.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setFiltro("");
        botonRef.current?.focus();
      }
    }
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFiltro("");
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const filtradas = filtro
    ? options.filter((o) =>
        o.label.toLowerCase().includes(filtro.toLowerCase()),
      )
    : options;

  const mostrarBusqueda = buscable && options.length > 6;

  return (
    <div className="relative w-full sm:w-auto" ref={rootRef}>
      <button
        type="button"
        ref={botonRef}
        onClick={() => {
          setOpen((o) => !o);
          if (open) setFiltro("");
        }}
        className={cn(
          "bg-brand-yellow text-brand-navy hover:bg-brand-yellow-hover inline-flex h-10 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold sm:w-auto",
          invalid && "ring-2 ring-red-500",
        )}
      >
        <span className="max-w-[260px] truncate">
          {seleccionada?.label ?? label}
        </span>
      </button>
      {open && (
        <div className="absolute top-full right-0 left-0 z-20 mt-2 flex max-h-80 flex-col rounded-xl bg-blue-50 shadow-lg ring-1 ring-neutral-200 sm:left-auto sm:min-w-[260px]">
          {mostrarBusqueda && (
            <div className="border-b border-blue-100 p-2">
              <input
                type="text"
                placeholder="Buscar…"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                autoFocus
                className="text-brand-navy w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-blue-300"
              />
            </div>
          )}
          <div className="overflow-y-auto py-2">
            {filtradas.length === 0 ? (
              <div className="px-5 py-2 text-xs text-neutral-500">
                {filtro
                  ? "No hay resultados para esa búsqueda."
                  : "Sin opciones disponibles."}
              </div>
            ) : (
              filtradas.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setFiltro("");
                  }}
                  className={cn(
                    "block w-full px-5 py-2 text-left text-sm",
                    value === o.value
                      ? "text-brand-navy font-semibold"
                      : "text-brand-navy/80 hover:text-brand-navy",
                  )}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
