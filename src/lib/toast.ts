"use client";

// NOTA: este archivo ES el wrapper, por lo tanto debe importar del paquete
// real `sonner`, no de sí mismo. Ver PR de sonidos (jul-2026).
import { toast as toastBase } from "sonner";

/**
 * Wrapper de `sonner` que agrega feedback auditivo a los toasts de éxito
 * y error, con el mismo criterio que usa Skipper (mismos MP3 en
 * `public/sounds/`). Los tipos `info`, `warning`, `message`, `loading` y
 * `promise` se dejan silenciosos para no saturar al broker cuando la app
 * emite varias notificaciones seguidas.
 *
 * Uso: cambia
 *   import { toast } from "sonner";
 * por
 *   import { toast } from "@/lib/toast";
 *
 * El API es idéntico al de sonner — no hay que tocar nada más.
 */

// Cache singleton por tipo de sonido. Reusar el mismo <audio> evita crear
// un nuevo buffer en cada toast (barato pero innecesario), y garantiza
// que si el broker recibe 2 toasts en cadena rápida el sonido reinicie
// desde el principio con `currentTime = 0`.
const cache = new Map<"success" | "error", HTMLAudioElement>();

// Volumen medio — audible pero no invasivo. Igual criterio que en Skipper
// escalado al rango 0–1 del elemento HTMLAudio.
const VOLUMEN = 0.6;

function reproducir(tipo: "success" | "error") {
  if (typeof window === "undefined") return; // SSR: no hay Audio.

  let audio = cache.get(tipo);
  if (!audio) {
    audio = new Audio(`/sounds/${tipo}.mp3`);
    audio.volume = VOLUMEN;
    cache.set(tipo, audio);
  }

  // Rebobinar por si el toast anterior aún no había terminado.
  audio.currentTime = 0;

  // Los navegadores modernos requieren interacción previa del usuario
  // para permitir audio. Si aún no la hubo, `play()` rechaza y no queremos
  // que ese rechazo rompa el flow del toast — solo silenciarlo.
  void audio.play().catch(() => {});
}

export const toast = {
  success: (...args: Parameters<typeof toastBase.success>) => {
    reproducir("success");
    return toastBase.success(...args);
  },
  error: (...args: Parameters<typeof toastBase.error>) => {
    reproducir("error");
    return toastBase.error(...args);
  },
  // Sin sonido — se conservan por compat.
  info: toastBase.info,
  warning: toastBase.warning,
  message: toastBase.message,
  loading: toastBase.loading,
  dismiss: toastBase.dismiss,
  promise: toastBase.promise,
};
