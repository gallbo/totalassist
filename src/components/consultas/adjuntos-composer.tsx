"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Mic, StopCircle, Trash2, X } from "lucide-react";
import {
  useAudioRecorder,
  formatMs,
  type RecorderResult,
} from "@/lib/media/use-audio-recorder";
import { cn } from "@/lib/utils";

/**
 * Composer de adjuntos para el modulo Consultas — imagenes + audios
 * (mensaje de voz tipo WhatsApp). Reutilizado por:
 *   - Nueva consulta (broker)
 *   - Hilo broker (respuestas)
 *   - Hilo admin (respuestas de Manuel)
 *
 * ACCESIBILIDAD:
 * - Cada boton tiene `aria-label` y estado `aria-pressed` cuando aplica.
 * - Un `role="status"` con `aria-live` anuncia el tiempo de grabacion
 *   para que VoiceOver (Manuel) escuche "0:03… 0:04…" sin tener que
 *   buscar el contador visualmente.
 * - Los previews traen `alt` con el nombre original del archivo.
 *
 * Callback:
 *   `onChange(archivos, duracionesMs)` — se llama en cada cambio para que
 *   el padre pueda armar el FormData al enviar. `duracionesMs[i]` es un
 *   numero para audios y null para imagenes.
 */
export type AdjuntosComposerHandle = {
  archivos: File[];
  duracionesMs: (number | null)[];
  limpiar: () => void;
};

export function AdjuntosComposer({
  onChange,
  maxImagenes = 5,
  disabled = false,
}: {
  onChange: (archivos: File[], duracionesMs: (number | null)[]) => void;
  maxImagenes?: number;
  disabled?: boolean;
}) {
  const [imagenes, setImagenes] = useState<{ file: File; url: string }[]>([]);
  const [audios, setAudios] = useState<
    { file: File; url: string; durationMs: number }[]
  >([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const recorder = useAudioRecorder();

  const emitirCambio = useCallback(
    (
      imgs: { file: File; url: string }[],
      auds: { file: File; url: string; durationMs: number }[],
    ) => {
      const archivos = [...imgs.map((i) => i.file), ...auds.map((a) => a.file)];
      const duraciones: (number | null)[] = [
        ...imgs.map(() => null),
        ...auds.map((a) => a.durationMs),
      ];
      onChange(archivos, duraciones);
    },
    [onChange],
  );

  const agregarImagenes = (fileList: FileList | null) => {
    if (!fileList) return;
    const nuevas: { file: File; url: string }[] = [];
    for (const f of Array.from(fileList)) {
      if (!f.type.startsWith("image/")) continue;
      nuevas.push({ file: f, url: URL.createObjectURL(f) });
      if (imagenes.length + nuevas.length >= maxImagenes) break;
    }
    if (!nuevas.length) return;
    const merged = [...imagenes, ...nuevas].slice(0, maxImagenes);
    setImagenes(merged);
    emitirCambio(merged, audios);
  };

  const quitarImagen = (i: number) => {
    const target = imagenes[i];
    if (target) URL.revokeObjectURL(target.url);
    const nuevas = imagenes.filter((_, idx) => idx !== i);
    setImagenes(nuevas);
    emitirCambio(nuevas, audios);
  };

  const persistirGrabacion = (r: RecorderResult) => {
    const ext = r.mime.includes("mp4")
      ? "m4a"
      : r.mime.includes("mpeg")
        ? "mp3"
        : r.mime.includes("ogg")
          ? "ogg"
          : "webm";
    const file = new File([r.blob], `voz-${Date.now()}.${ext}`, {
      type: r.mime,
    });
    const nuevos = [...audios, { file, url: r.url, durationMs: r.durationMs }];
    setAudios(nuevos);
    emitirCambio(imagenes, nuevos);
    recorder.reset();
  };

  const quitarAudio = (i: number) => {
    const target = audios[i];
    if (target) URL.revokeObjectURL(target.url);
    const nuevos = audios.filter((_, idx) => idx !== i);
    setAudios(nuevos);
    emitirCambio(imagenes, nuevos);
  };

  const limpiarTodo = () => {
    imagenes.forEach((i) => URL.revokeObjectURL(i.url));
    audios.forEach((a) => URL.revokeObjectURL(a.url));
    setImagenes([]);
    setAudios([]);
    emitirCambio([], []);
    recorder.reset();
  };

  // API imperativa opcional via ref no la exponemos aqui — el padre
  // controla via `onChange` + reset con `key` prop cuando se vacia.

  return (
    <div className="flex flex-col gap-3">
      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled}
          onChange={(e) => {
            agregarImagenes(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || imagenes.length >= maxImagenes}
          className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          aria-label="Agregar imágenes"
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Imagen ({imagenes.length}/{maxImagenes})
        </button>

        {recorder.state !== "recording" ? (
          <button
            type="button"
            onClick={recorder.start}
            disabled={disabled}
            className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            aria-label="Grabar mensaje de voz"
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            Grabar audio
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={recorder.stop}
              aria-pressed="true"
              className="flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
              aria-label={`Detener grabación (llevas ${formatMs(recorder.elapsedMs)})`}
            >
              <StopCircle className="h-4 w-4" aria-hidden="true" />
              Detener
            </button>
            <span
              role="status"
              aria-live="polite"
              className="text-sm font-medium text-red-700"
            >
              {formatMs(recorder.elapsedMs)}
            </span>
            <button
              type="button"
              onClick={recorder.cancel}
              className="text-xs text-neutral-500 underline"
              aria-label="Cancelar grabación"
            >
              Cancelar
            </button>
          </div>
        )}

        {(imagenes.length > 0 || audios.length > 0) && (
          <button
            type="button"
            onClick={limpiarTodo}
            className="ml-auto flex items-center gap-1 text-xs text-neutral-500 underline"
            aria-label="Quitar todos los adjuntos"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Quitar todo
          </button>
        )}
      </div>

      {/* Estado del recorder al terminar (preview + agregar) */}
      {recorder.state === "stopped" && recorder.result ? (
        <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-xs font-medium text-neutral-700">
            Grabación lista ({formatMs(recorder.result.durationMs)})
          </p>
          <audio
            controls
            src={recorder.result.url}
            className="w-full"
            aria-label="Reproducir grabación"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => persistirGrabacion(recorder.result!)}
              className="bg-brand-navy rounded-full px-3 py-1.5 text-xs font-semibold text-white"
            >
              Adjuntar audio
            </button>
            <button
              type="button"
              onClick={recorder.reset}
              className="text-xs text-neutral-500 underline"
            >
              Descartar
            </button>
          </div>
        </div>
      ) : null}

      {recorder.error ? (
        <p role="alert" className="text-xs text-red-700">
          {recorder.error}
        </p>
      ) : null}

      {/* Previews de imágenes ya agregadas */}
      {imagenes.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Imágenes adjuntas">
          {imagenes.map((img, i) => (
            <li key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.file.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => quitarImagen(i)}
                className="absolute -top-1 -right-1 rounded-full bg-neutral-900/80 p-0.5 text-white hover:bg-neutral-900"
                aria-label={`Quitar ${img.file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Audios ya agregados */}
      {audios.length > 0 ? (
        <ul className="flex flex-col gap-2" aria-label="Audios adjuntos">
          {audios.map((a, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2"
            >
              <audio
                controls
                src={a.url}
                className={cn("flex-1", "min-w-0")}
                aria-label={`Reproducir audio de ${formatMs(a.durationMs)}`}
              />
              <span className="text-xs text-neutral-500">
                {formatMs(a.durationMs)}
              </span>
              <button
                type="button"
                onClick={() => quitarAudio(i)}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
                aria-label="Quitar audio"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
