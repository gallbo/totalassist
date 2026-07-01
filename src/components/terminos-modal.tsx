"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TERMINOS_SECCIONES, TERMINOS_VERSION } from "@/lib/terminos";

export function TerminosModal({
  triggerClassName,
  triggerLabel = "términos y condiciones",
}: {
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Términos y condiciones"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white text-neutral-900 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-5">
              <div>
                <h2 className="text-brand-navy text-lg font-bold">
                  Términos y condiciones
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Versión {TERMINOS_VERSION}
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
                className="hover:text-brand-navy -mr-1 shrink-0 text-neutral-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto p-5">
              {TERMINOS_SECCIONES.map((seccion) => (
                <section key={seccion.titulo}>
                  <h3 className="text-brand-navy text-sm font-semibold">
                    {seccion.titulo}
                  </h3>
                  <div className="mt-2 space-y-2 text-sm leading-relaxed text-neutral-600">
                    {seccion.parrafos.map((parrafo, i) => (
                      <p key={i}>{parrafo}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="flex justify-end border-t border-neutral-200 p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="bg-brand-navy hover:bg-brand-navy-hover rounded-pill px-6 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
