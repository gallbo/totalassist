"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Download, Share, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Botón "Instalar app" (PWA) de los logins del broker y del admin.
 * Replica el de Connect: se muestra siempre que la app no esté instalada.
 *
 *  - Chrome / Edge / Android: abre el diálogo nativo de instalación con el
 *    evento `beforeinstallprompt`. Ese evento suele dispararse ANTES de que
 *    React monte este botón, así que lo captura un script en el <head> del
 *    layout raíz (SCRIPT_CAPTURA_INSTALACION) y lo deja en
 *    window.__taInstallPrompt.
 *  - iPhone/iPad (Safari no tiene ese evento) o navegadores sin instalación
 *    directa: abre una ventana con las instrucciones manuales.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __taInstallPrompt?: BeforeInstallPromptEvent | null;
    __taInstalada?: boolean;
  }
}

/** Se inyecta en el <head> del layout raíz (ver src/app/layout.tsx). */
export const SCRIPT_CAPTURA_INSTALACION = `
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  window.__taInstallPrompt = e;
});
window.addEventListener('appinstalled', function () {
  window.__taInstallPrompt = null;
  window.__taInstalada = true;
  window.dispatchEvent(new Event('ta-app-instalada'));
});
`;

function estaInstalada(): boolean {
  return (
    window.__taInstalada === true ||
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function suscribirInstalacion(cb: () => void) {
  window.addEventListener("ta-app-instalada", cb);
  return () => window.removeEventListener("ta-app-instalada", cb);
}

function esIos(): boolean {
  const ua = window.navigator.userAgent.toLowerCase();
  // iPadOS se reporta como Mac con pantalla táctil.
  return (
    /iphone|ipad|ipod/.test(ua) ||
    (ua.includes("macintosh") && navigator.maxTouchPoints > 1)
  );
}

export function InstallAppButton({
  variante = "claro",
  compacto = false,
  className,
}: {
  /** "oscuro" = sobre fondo azul marino (splash del admin). */
  variante?: "claro" | "oscuro";
  /** Solo ícono hasta xl (header con poco espacio); el texto aparece en pantallas anchas. */
  compacto?: boolean;
  className?: string;
}) {
  // En el servidor asumimos "instalada" para no pintar el botón y evitar
  // diferencias de hidratación; en el cliente se evalúa de verdad.
  const instalada = useSyncExternalStore(
    suscribirInstalacion,
    estaInstalada,
    () => true,
  );
  const [instrucciones, setInstrucciones] = useState<"ios" | "otro" | null>(
    null,
  );

  if (instalada) return null;

  const onClick = async () => {
    const prompt = window.__taInstallPrompt;
    if (prompt) {
      await prompt.prompt();
      await prompt.userChoice;
      // El evento solo se puede usar una vez.
      window.__taInstallPrompt = null;
      return;
    }
    setInstrucciones(esIos() ? "ios" : "otro");
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label="Instalar Total Assist como aplicación"
        title="Instalar app"
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition sm:text-sm",
          variante === "oscuro"
            ? "bg-white/10 text-white backdrop-blur hover:bg-white/20"
            : "border-brand-navy/20 text-brand-navy border bg-white hover:bg-neutral-50",
          className,
        )}
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        <span className={compacto ? "hidden xl:inline" : undefined}>
          Instalar app
        </span>
      </button>
      {instrucciones ? (
        <InstruccionesDialog
          tipo={instrucciones}
          onClose={() => setInstrucciones(null)}
        />
      ) : null}
    </>
  );
}

function InstruccionesDialog({
  tipo,
  onClose,
}: {
  tipo: "ios" | "otro";
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="instalar-titulo"
      className="m-auto w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-4 p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <h2
            id="instalar-titulo"
            className="text-brand-navy text-base font-bold"
          >
            Instalar Total Assist
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {tipo === "ios" ? (
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-neutral-700">
            <li>
              Toca el botón <strong>Compartir</strong>{" "}
              <Share
                className="text-brand-navy inline h-4 w-4 align-text-bottom"
                aria-hidden="true"
              />{" "}
              de Safari.
            </li>
            <li>
              Elige <strong>Agregar a pantalla de inicio</strong>.
            </li>
            <li>
              Toca <strong>Agregar</strong>. Total Assist quedará como una app
              en tu inicio.
            </li>
          </ol>
        ) : (
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-neutral-700">
            <li>Abre el menú de tu navegador (el ícono de tres puntos).</li>
            <li>
              Elige <strong>Instalar app</strong> o{" "}
              <strong>Agregar a pantalla de inicio</strong>.
            </li>
            <li>Confirma. Total Assist quedará como una app en tu equipo.</li>
          </ol>
        )}
        <button
          type="button"
          onClick={onClose}
          className="bg-brand-navy hover:bg-brand-navy/90 rounded-full px-4 py-2 text-sm font-semibold text-white"
        >
          Entendido
        </button>
      </div>
    </dialog>
  );
}
