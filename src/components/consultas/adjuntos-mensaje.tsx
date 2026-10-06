"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Adjunto } from "@/lib/api/consultas";
import { formatMs } from "@/lib/media/use-audio-recorder";

/**
 * Renderiza la lista de adjuntos (imágenes + audios) de un mensaje del
 * hilo. Se reusa entre burbuja del broker y del admin.
 *
 * ACCESIBILIDAD:
 * - Imagenes con `alt` con el nombre original (VoiceOver: "imagen, factura.jpg").
 * - Audios con `<audio controls>` nativo — Manuel lo maneja perfecto con
 *   VoiceOver, no reinventamos el player.
 * - Un click en una imagen la amplia (lightbox simple) para visualizar
 *   el detalle sin salir del hilo. Cerrar con Esc o clic fuera.
 */
export function AdjuntosMensaje({ adjuntos }: { adjuntos: Adjunto[] }) {
  const [lightbox, setLightbox] = useState<Adjunto | null>(null);
  if (adjuntos.length === 0) return null;

  const imagenes = adjuntos.filter((a) => a.tipo === "imagen");
  const audios = adjuntos.filter((a) => a.tipo === "audio");

  return (
    <div className="flex flex-col gap-2">
      {imagenes.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {imagenes.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setLightbox(a)}
                className="focus:ring-brand-yellow rounded-lg focus:ring-2 focus:outline-none"
                aria-label={`Ampliar imagen ${a.nombre_original}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.url}
                  alt={a.nombre_original}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {audios.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {audios.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2"
            >
              <audio
                controls
                src={a.url}
                className="min-w-0 flex-1"
                aria-label={
                  a.duracion_ms
                    ? `Audio de ${formatMs(a.duracion_ms)}`
                    : "Audio"
                }
              />
              {a.duracion_ms ? (
                <span className="text-xs text-neutral-500">
                  {formatMs(a.duracion_ms)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vista ampliada de ${lightbox.nombre_original}`}
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setLightbox(null);
          }}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Cerrar vista ampliada"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt={lightbox.nombre_original}
            className="max-h-full max-w-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
