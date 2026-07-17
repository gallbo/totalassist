"use client";

import { useEffect, useState } from "react";
import {
  TERMINOS_ACEPTO_CHECKBOX,
  TERMINOS_INCISOS,
  TERMINOS_PARRAFOS,
  TERMINOS_TITULO,
  TERMINOS_VERSION,
} from "@/lib/terminos";

// Popup de términos y condiciones que salta al abrir el registro.
// No se puede cerrar hasta marcar la casilla (no hay backdrop, Escape ni X).
export function TerminosModal({
  open,
  onAccept,
}: {
  open: boolean;
  onAccept: () => void;
}) {
  const [leido, setLeido] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Términos y condiciones"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white text-neutral-900 shadow-2xl">
        <div className="border-b border-neutral-200 p-5">
          <h2 className="text-brand-navy text-base font-bold sm:text-lg">
            {TERMINOS_TITULO}
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Versión {TERMINOS_VERSION}
          </p>
        </div>

        <div className="space-y-4 overflow-y-auto p-5 text-sm leading-relaxed text-neutral-700">
          {TERMINOS_PARRAFOS.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
          <div className="space-y-2 pl-4">
            {TERMINOS_INCISOS.map((inciso, i) => (
              <p key={i}>{inciso}</p>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t border-neutral-200 p-5">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={leido}
              onChange={(e) => setLeido(e.target.checked)}
              className="accent-brand-navy mt-0.5 h-5 w-5 shrink-0 cursor-pointer"
            />
            <span>{TERMINOS_ACEPTO_CHECKBOX}</span>
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onAccept}
              disabled={!leido}
              className="bg-brand-yellow hover:bg-brand-yellow-hover text-brand-navy rounded-pill px-8 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
