"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook para grabar audio con `MediaRecorder` (patron tipo WhatsApp voice).
 *
 * Estado:
 *   - idle           → nada grabando, sin resultado.
 *   - permissionAsk  → esperando que el usuario apruebe el permiso del mic.
 *   - recording      → grabando activamente.
 *   - stopped        → hay un blob final listo para enviar.
 *   - error          → algo fallo (permiso denegado, sin soporte, etc.)
 *
 * Salida (`result`): { blob, url, durationMs }. `url` es un ObjectURL que
 * el consumidor puede usar en <audio src>. Se revoca automatico cuando se
 * reinicia o al desmontar.
 *
 * Nota tecnica: MediaRecorder produce audio/webm en Chrome/Firefox y
 * audio/mp4 en Safari. Nuestro backend acepta ambos (ver ConsultasService::MIMES_AUDIO).
 */
export type RecorderState =
  | "idle"
  | "permissionAsk"
  | "recording"
  | "stopped"
  | "error";

export type RecorderResult = {
  blob: Blob;
  url: string;
  durationMs: number;
  mime: string;
};

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecorderResult | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const revokeResult = useCallback(() => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, []);

  const reset = useCallback(() => {
    revokeResult();
    setElapsedMs(0);
    setError(null);
    setState("idle");
  }, [revokeResult]);

  const start = useCallback(async () => {
    setError(null);
    revokeResult();

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError("Tu navegador no permite grabar audio.");
      setState("error");
      return;
    }

    try {
      setState("permissionAsk");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Deja al navegador elegir el mejor mime — webm/opus en Chromium,
      // mp4/aac en Safari. Ambos aceptados por el backend.
      const mr = new MediaRecorder(stream);
      recorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const durationMs = Date.now() - startedAtRef.current;
        // Chrome reporta `video/webm` para grabaciones audio-only (el
        // contenedor WebM no distingue formalmente audio de video), lo
        // que rompia el mime en el backend. Normalizamos al mime real.
        let mime = mr.mimeType || "audio/webm";
        if (mime.startsWith("video/webm")) {
          mime = "audio/webm";
        }
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setResult({ blob, url, durationMs, mime });
        setState("stopped");
        cleanupStream();
        if (tickerRef.current) {
          clearInterval(tickerRef.current);
          tickerRef.current = null;
        }
      };

      startedAtRef.current = Date.now();
      setElapsedMs(0);
      mr.start();
      setState("recording");

      tickerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 200);
    } catch (e) {
      cleanupStream();
      setError(
        e instanceof Error && e.name === "NotAllowedError"
          ? "Necesitamos permiso para usar el micrófono."
          : "No pude iniciar la grabación.",
      );
      setState("error");
    }
  }, [cleanupStream, revokeResult]);

  const stop = useCallback(() => {
    const mr = recorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
    }
  }, []);

  const cancel = useCallback(() => {
    const mr = recorderRef.current;
    if (mr && mr.state !== "inactive") {
      // Sacamos onstop antes para que no dispare el estado "stopped".
      mr.onstop = null;
      mr.stop();
    }
    cleanupStream();
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    reset();
  }, [cleanupStream, reset]);

  // Cleanup al desmontar.
  useEffect(() => {
    return () => {
      cleanupStream();
      if (tickerRef.current) clearInterval(tickerRef.current);
      revokeResult();
    };
  }, [cleanupStream, revokeResult]);

  return {
    state,
    error,
    result,
    elapsedMs,
    start,
    stop,
    cancel,
    reset,
  };
}

export function formatMs(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
