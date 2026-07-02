"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import {
  TERMINOS_INCISOS,
  TERMINOS_PARRAFOS,
  TERMINOS_TITULO,
  TERMINOS_VERSION,
} from "@/lib/terminos";

export function TerminosModal({
  open,
  onClose,
  onAccept,
}: {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Términos y condiciones"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white text-neutral-900 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-5">
          <div>
            <h2 className="text-brand-navy text-base font-bold sm:text-lg">
              {TERMINOS_TITULO}
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Versión {TERMINOS_VERSION}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="hover:text-brand-navy -mr-1 shrink-0 text-neutral-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
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

        <div className="flex justify-end gap-3 border-t border-neutral-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="text-brand-navy rounded-pill px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="bg-brand-yellow hover:bg-brand-yellow-hover text-brand-navy rounded-pill px-8 py-2.5 text-sm font-semibold transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
