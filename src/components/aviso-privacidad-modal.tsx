"use client";

import { useEffect } from "react";
import {
  PRIVACIDAD_SIMPLIFICADO,
  PRIVACIDAD_SIMPLIFICADO_TITULO,
  PRIVACIDAD_SUBTITULO,
  PRIVACIDAD_VERSION,
} from "@/lib/privacidad";

// Popup del aviso de privacidad simplificado que salta al abrir el registro.
// No se puede cerrar salvo con el boton Aceptar (no hay backdrop, Escape ni X).
export function AvisoPrivacidadModal({
  open,
  onAccept,
  integralHref,
}: {
  open: boolean;
  onAccept: () => void;
  integralHref: string;
}) {
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
      aria-label="Aviso de privacidad"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white text-neutral-900 shadow-2xl">
        <div className="border-b border-neutral-200 p-5">
          <h2 className="text-brand-navy text-base font-bold sm:text-lg">
            {PRIVACIDAD_SIMPLIFICADO_TITULO}
          </h2>
          <p className="text-brand-navy mt-0.5 text-sm font-semibold">
            {PRIVACIDAD_SUBTITULO}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Versión {PRIVACIDAD_VERSION}
          </p>
        </div>

        <div className="space-y-4 overflow-y-auto p-5 text-sm leading-relaxed text-neutral-700">
          {PRIVACIDAD_SIMPLIFICADO.map((seccion, i) => (
            <div key={i} className="space-y-2">
              {seccion.titulo && (
                <h3 className="text-brand-navy text-sm font-semibold">
                  {seccion.titulo}
                </h3>
              )}
              {seccion.parrafos?.map((parrafo, j) => (
                <p key={j}>{parrafo}</p>
              ))}
              {seccion.incisos && (
                <ul className="list-disc space-y-1 pl-6">
                  {seccion.incisos.map((inciso, j) => (
                    <li key={j}>{inciso}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <p>
            Este Aviso de Privacidad es simplificado. Para consultar el Aviso de
            Privacidad integral, ingrese al siguiente enlace:{" "}
            <a
              href={integralHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-navy font-semibold underline"
            >
              Aviso de Privacidad integral
            </a>
            .
          </p>
        </div>

        <div className="flex justify-end border-t border-neutral-200 p-5">
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
