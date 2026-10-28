"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import {
  activarPush,
  esIOS,
  estadoPush,
  type EstadoPush,
} from "@/lib/push-admin";

/**
 * Aviso para activar las notificaciones push del panel (consulta nueva y
 * mensajes del broker). Solo se muestra mientras no estén activas.
 *
 * ACCESIBILIDAD (Manuel usa VoiceOver): es una región con nombre, el botón
 * tiene texto visible y el resultado se anuncia con role="status".
 */
export function ActivarNotificaciones() {
  const [estado, setEstado] = useState<EstadoPush | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let vivo = true;
    estadoPush()
      .then((e) => vivo && setEstado(e))
      .catch(() => vivo && setEstado("no-soportado"));
    return () => {
      vivo = false;
    };
  }, []);

  if (estado === null || estado === "no-soportado") return null;

  if (estado === "activo") {
    // Solo se anuncia justo después de activarlas; en visitas siguientes no
    // se pinta nada.
    return mensaje ? (
      <p role="status" className="sr-only">
        {mensaje}
      </p>
    ) : null;
  }

  const onActivar = async () => {
    if (trabajando) return;
    setTrabajando(true);
    setMensaje("");
    try {
      const nuevo = await activarPush();
      setEstado(nuevo);
      setMensaje(
        nuevo === "activo"
          ? "Notificaciones activadas. Te avisaremos de consultas y mensajes nuevos."
          : nuevo === "bloqueado"
            ? "Las notificaciones quedaron bloqueadas."
            : "No se activaron las notificaciones.",
      );
    } catch (e) {
      setMensaje(
        e instanceof Error && e.message
          ? `No se pudieron activar: ${e.message}`
          : "No se pudieron activar las notificaciones.",
      );
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <section
      aria-label="Notificaciones"
      className="mx-auto mt-4 w-full max-w-5xl px-4"
    >
      <div className="border-brand-navy/20 flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <BellRing
            className="text-brand-navy mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-brand-navy text-sm">
            {estado === "ios-sin-instalar"
              ? "Para recibir avisos de consultas nuevas en tu iPhone, abre esta página desde el ícono de la app en tu pantalla de inicio."
              : estado === "bloqueado"
                ? esIOS()
                  ? "Las notificaciones están bloqueadas. Actívalas en Ajustes, Notificaciones, TA Connect, y vuelve a abrir la app."
                  : "Las notificaciones están bloqueadas en este navegador. Permítelas en la configuración del sitio (el ícono junto a la dirección) y recarga la página."
                : "Activa las notificaciones para que te avisemos al momento de cada consulta o mensaje nuevo."}
          </p>
        </div>
        {estado === "inactivo" ? (
          <button
            type="button"
            onClick={onActivar}
            disabled={trabajando}
            className="bg-brand-navy inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {trabajando ? "Activando…" : "Activar notificaciones"}
          </button>
        ) : null}
      </div>
      <p role="status" className="sr-only">
        {mensaje}
      </p>
      {mensaje ? <p className="mt-2 text-sm text-red-700">{mensaje}</p> : null}
    </section>
  );
}
