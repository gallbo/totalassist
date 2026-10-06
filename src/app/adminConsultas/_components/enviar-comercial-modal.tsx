"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import {
  enviarClienteAComercialClient,
  type ConsultaDetalle,
} from "@/lib/api/consultas";
import { toast } from "@/lib/toast";

/**
 * Modal para que Manuel capture los datos del cliente final que un broker
 * mencionó en la consulta y los envíe al área comercial de Skipper.
 *
 * Reusa `POST /api/connect/comercial/usuario/nuevo`
 * (ProspectoClienteController::crearUsuarioConnect) — el mismo endpoint
 * que usaba Connect. La conversacion del hilo va como contexto y las
 * URLs de los adjuntos concatenadas en `urlArchivos`.
 *
 * ACCESIBILIDAD:
 * - `<dialog>` HTML5 con focus trap y Escape nativo.
 * - Al abrir el foco se va al primer input (nombre).
 * - Los inputs opcionales tienen `aria-describedby` con hint.
 */
export function EnviarComercialModal({
  open,
  consulta,
  onClose,
}: {
  open: boolean;
  consulta: ConsultaDetalle;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const nombreRef = useRef<HTMLInputElement | null>(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // Reset del form al abrir + focus al primer input.
      setNombre("");
      setEmail("");
      setTelefono("");
      setNotas("");
      setError(null);
      setTimeout(() => nombreRef.current?.focus(), 0);
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  const armarConversacionResumen = (): string => {
    // Serializamos el hilo en un formato JSON legible para el fisher.
    // Incluimos el broker que abrio la consulta y las notas de Manuel.
    const broker = consulta.broker
      ? `${consulta.broker.nombre} <${consulta.broker.email}>`
      : "Broker desconocido";
    return JSON.stringify(
      {
        origen: "TotalAssist — Consultas",
        consulta_id: consulta.id,
        asunto: consulta.asunto,
        broker,
        tipo_opinion: consulta.tipo_opinion,
        tipo_pregunta: consulta.tipo_pregunta,
        notas_admin: notas.trim() || null,
        mensajes: consulta.mensajes.map((m) => ({
          autor: m.autor_tipo,
          fecha: m.created_at,
          texto: m.texto,
          adjuntos: m.adjuntos.map((a) => ({ tipo: a.tipo, url: a.url })),
        })),
      },
      null,
      2,
    );
  };

  const armarUrlArchivos = (): string => {
    // Concatenamos las URLs de Dropbox — el email al fisher las embed
    // para que el area comercial las descargue si necesita el contexto
    // visual/auditivo de la consulta.
    return consulta.mensajes
      .flatMap((m) => m.adjuntos.map((a) => a.url))
      .join("\n");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nombreTrim = nombre.trim();
    if (nombreTrim.length < 3) {
      setError("El nombre es obligatorio.");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await enviarClienteAComercialClient({
        nombre: nombreTrim,
        email: email.trim() || undefined,
        telefono: telefono.trim() || undefined,
        conversacionResumen: armarConversacionResumen(),
        urlArchivos: armarUrlArchivos(),
      });
      toast.success("Cliente enviado al área comercial.");
      onClose();
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No pudimos enviar los datos.";
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="enviar-comercial-title"
      aria-describedby="enviar-comercial-desc"
      className="m-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/50"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5" noValidate>
        <div className="flex flex-col gap-1">
          <h2
            id="enviar-comercial-title"
            className="text-brand-navy text-base font-bold"
          >
            Enviar cliente a comercial
          </h2>
          <p id="enviar-comercial-desc" className="text-sm text-neutral-600">
            Captura los datos del cliente final que mencionó el broker. El
            equipo comercial recibirá un correo con el contexto de la consulta.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="prospecto-nombre"
            className="text-brand-navy text-sm font-semibold"
          >
            Nombre <span aria-hidden="true">*</span>
          </label>
          <input
            id="prospecto-nombre"
            ref={nombreRef}
            type="text"
            required
            aria-required="true"
            value={nombre}
            maxLength={255}
            onChange={(e) => setNombre(e.target.value)}
            disabled={enviando}
            className="focus:ring-brand-yellow rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="prospecto-email"
              className="text-brand-navy text-sm font-semibold"
            >
              Correo
            </label>
            <input
              id="prospecto-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={enviando}
              className="focus:ring-brand-yellow rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="prospecto-tel"
              className="text-brand-navy text-sm font-semibold"
            >
              Teléfono
            </label>
            <input
              id="prospecto-tel"
              type="tel"
              value={telefono}
              maxLength={10}
              inputMode="numeric"
              onChange={(e) => setTelefono(e.target.value)}
              disabled={enviando}
              className="focus:ring-brand-yellow rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="prospecto-notas"
            className="text-brand-navy text-sm font-semibold"
          >
            Notas para comercial (opcional)
          </label>
          <textarea
            id="prospecto-notas"
            rows={3}
            value={notas}
            maxLength={1000}
            onChange={(e) => setNotas(e.target.value)}
            disabled={enviando}
            placeholder="Contexto o ganchos de venta que el equipo comercial deba saber."
            className="focus:ring-brand-yellow rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando || nombre.trim().length < 3}
            className="bg-brand-navy hover:bg-brand-navy/90 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {enviando ? "Enviando…" : "Enviar a comercial"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
