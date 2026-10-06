"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Send,
  MessageCircle,
  Share2,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import {
  LABEL_ESTATUS,
  LABEL_TIPO_OPINION,
  agregarMensajeAdminClient,
  cerrarConsultaAdminClient,
  marcarLeidosAdminClient,
  obtenerConsultaAdminClient,
  reabrirConsultaAdminClient,
  type ConsultaDetalle,
  type Mensaje,
} from "@/lib/api/consultas";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { AdjuntosComposer } from "@/components/consultas/adjuntos-composer";
import { AdjuntosMensaje } from "@/components/consultas/adjuntos-mensaje";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TextoConLinks } from "@/components/consultas/texto-con-links";
import { EnviarComercialModal } from "./enviar-comercial-modal";
import {
  INVITACIONES,
  INVITACIONES_ACTIVAS,
  type TipoInvitacion,
} from "./invitaciones";

const MAX_CARACTERES = 2000;

/**
 * Detalle de consulta desde el panel admin (Manuel).
 *
 * Acciones desde aqui:
 *   - Marcar mensajes del broker como leidos al montar (fire-and-forget).
 *   - Responder con texto + adjuntos (imagenes + audios).
 *   - Enviar mensajes predefinidos (WhatsApp, calificar), con confirm.
 *   - Cerrar (con confirm).
 *   - Reabrir si esta cerrada.
 *
 * ACCESIBILIDAD:
 * - Cada bloque es su propio <section> con aria-label para landmarks.
 * - Los mensajes van en <ol> (orden cronologico importa), con id para
 *   moverles foco al primero sin leer al montar.
 * - Al responder, el foco vuelve al textarea.
 */
export function HiloConsultaAdmin({
  consultaInicial,
}: {
  consultaInicial: ConsultaDetalle;
}) {
  const [consulta, setConsulta] = useState<ConsultaDetalle>(consultaInicial);
  const [texto, setTexto] = useState("");
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [duracionesMs, setDuracionesMs] = useState<(number | null)[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [composerKey, setComposerKey] = useState(0);
  const [refrescando, setRefrescando] = useState(false);
  const [confirmarCerrar, setConfirmarCerrar] = useState(false);
  const [enviarComercial, setEnviarComercial] = useState(false);
  const [invitacion, setInvitacion] = useState<TipoInvitacion | null>(null);
  const respuestaRef = useRef<HTMLTextAreaElement | null>(null);

  const cerrada = consulta.estatus === "cerrada";

  const refrescar = async () => {
    if (refrescando) return;
    setRefrescando(true);
    try {
      const fresh = await obtenerConsultaAdminClient(consulta.id);
      setConsulta(fresh);
      if (fresh.sin_leer > 0) {
        marcarLeidosAdminClient(consulta.id).catch(() => {});
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos actualizar.");
    } finally {
      setRefrescando(false);
    }
  };

  // Marcar leídos y mover foco al primer mensaje sin leer.
  useEffect(() => {
    if (consulta.sin_leer > 0) {
      marcarLeidosAdminClient(consulta.id).catch(() => {});
    }
    const primerSinLeer = consulta.mensajes.find(
      (m) => !m.leido_at && m.autor_tipo === "broker",
    );
    if (primerSinLeer) {
      document.getElementById(`mensaje-${primerSinLeer.id}`)?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consulta.id]);

  const puedeEnviar =
    (texto.trim().length >= 3 || adjuntos.length > 0) && !enviando && !cerrada;

  const enviarRespuesta = async () => {
    if (!puedeEnviar) return;
    setEnviando(true);
    try {
      const mensaje = await agregarMensajeAdminClient(consulta.id, {
        texto: texto.trim() || undefined,
        adjuntos,
        duraciones_ms: duracionesMs,
      });
      setConsulta((c) => ({
        ...c,
        estatus: c.estatus === "sin_asignar" ? "en_curso" : c.estatus,
        mensajes: [...c.mensajes, mensaje],
        ultimo_mensaje_at: mensaje.created_at,
      }));
      setTexto("");
      setAdjuntos([]);
      setDuracionesMs([]);
      setComposerKey((k) => k + 1);
      toast.success("Respuesta enviada.");
      respuestaRef.current?.focus();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos responder.");
    } finally {
      setEnviando(false);
    }
  };

  const ejecutarCerrar = async () => {
    setConfirmarCerrar(false);
    try {
      const actualizada = await cerrarConsultaAdminClient(consulta.id);
      setConsulta(actualizada);
      toast.success("Consulta cerrada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos cerrar.");
    }
  };

  const onReabrir = async () => {
    try {
      const actualizada = await reabrirConsultaAdminClient(consulta.id);
      setConsulta(actualizada);
      toast.success("Consulta reabierta.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos reabrir.");
    }
  };

  const ejecutarInvitacion = async () => {
    const tipo = invitacion;
    setInvitacion(null);
    if (!tipo || enviando) return;
    setEnviando(true);
    try {
      const mensaje = await agregarMensajeAdminClient(consulta.id, {
        texto: INVITACIONES[tipo].texto,
      });
      setConsulta((c) => ({
        ...c,
        estatus: c.estatus === "sin_asignar" ? "en_curso" : c.estatus,
        mensajes: [...c.mensajes, mensaje],
        ultimo_mensaje_at: mensaje.created_at,
      }));
      toast.success("Invitación enviada.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No pudimos enviar la invitación.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const broker = consulta.broker;

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Datos de la consulta"
        className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-brand-navy text-lg font-bold">
            {consulta.asunto}
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refrescar}
              disabled={refrescando}
              className="text-brand-navy/70 hover:text-brand-navy flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium disabled:opacity-60"
              aria-label="Actualizar la conversación"
            >
              <RefreshCw
                className={cn("h-3 w-3", refrescando && "animate-spin")}
                aria-hidden="true"
              />
              Actualizar
            </button>
            <span
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase",
                consulta.estatus === "sin_asignar" &&
                  "bg-amber-100 text-amber-800",
                consulta.estatus === "en_curso" &&
                  "bg-emerald-100 text-emerald-800",
                cerrada && "bg-neutral-200 text-neutral-700",
              )}
            >
              {LABEL_ESTATUS[consulta.estatus]}
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              Broker
            </dt>
            <dd className="text-brand-navy">
              {broker?.nombre ?? "Desconocido"}
              {broker?.email ? (
                <>
                  <br />
                  <a
                    href={`mailto:${broker.email}`}
                    className="text-brand-navy/80 text-xs underline"
                  >
                    {broker.email}
                  </a>
                </>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              Clase de opinión
            </dt>
            <dd className="text-brand-navy">
              {LABEL_TIPO_OPINION[consulta.tipo_opinion]}
              {consulta.tipo_pregunta ? ` · ${consulta.tipo_pregunta}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              Creada
            </dt>
            <dd className="text-brand-navy">
              {new Date(consulta.created_at).toLocaleString("es-MX", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              Último mensaje
            </dt>
            <dd className="text-brand-navy">
              {consulta.ultimo_mensaje_at
                ? new Date(consulta.ultimo_mensaje_at).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-label="Conversación con el broker"
        className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <h2 className="text-brand-navy text-sm font-semibold tracking-wide uppercase">
          Conversación ({consulta.mensajes.length} mensaje
          {consulta.mensajes.length === 1 ? "" : "s"})
        </h2>
        <ol
          className="flex flex-col gap-3"
          aria-live="polite"
          aria-relevant="additions"
        >
          {consulta.mensajes.map((m) => (
            <MensajeItem key={m.id} mensaje={m} />
          ))}
        </ol>
      </section>

      {!cerrada ? (
        <section
          aria-label="Responder al broker"
          className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4"
        >
          <label
            htmlFor="respuesta-admin"
            className="text-brand-navy text-sm font-semibold"
          >
            Tu respuesta
          </label>
          <textarea
            id="respuesta-admin"
            ref={respuestaRef}
            rows={5}
            value={texto}
            maxLength={MAX_CARACTERES}
            onChange={(e) => setTexto(e.target.value)}
            disabled={enviando}
            placeholder="Escribe la respuesta al broker…"
            className="focus:ring-brand-yellow rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            aria-describedby="hint-respuesta"
          />
          <p id="hint-respuesta" className="text-xs text-neutral-500">
            {texto.length}/{MAX_CARACTERES} · El broker recibirá un correo
            cuando envíes la respuesta.
          </p>
          <AdjuntosComposer
            key={composerKey}
            disabled={enviando}
            onChange={(files, dur) => {
              setAdjuntos(files);
              setDuracionesMs(dur);
            }}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={enviarRespuesta}
              disabled={!puedeEnviar}
              className="bg-brand-navy hover:bg-brand-navy/90 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {enviando ? "Enviando…" : "Enviar respuesta"}
            </button>
          </div>
        </section>
      ) : null}

      <section
        aria-label="Acciones adicionales"
        className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <h2 className="text-brand-navy text-sm font-semibold tracking-wide uppercase">
          Acciones
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEnviarComercial(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 sm:w-auto"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Enviar cliente a comercial
          </button>
          {!cerrada
            ? INVITACIONES_ACTIVAS.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setInvitacion(tipo)}
                  disabled={enviando}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 sm:w-auto"
                >
                  {tipo === "whatsapp" ? (
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                  )}
                  {INVITACIONES[tipo].boton}
                </button>
              ))
            : null}
          {!cerrada ? (
            <button
              type="button"
              onClick={() => setConfirmarCerrar(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 sm:w-auto"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Cerrar consulta
            </button>
          ) : (
            <button
              type="button"
              onClick={onReabrir}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reabrir consulta
            </button>
          )}
          {cerrada ? (
            <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-600">
              <CheckCircle2
                className="text-state-success h-4 w-4"
                aria-hidden="true"
              />
              <span>Esta consulta está cerrada.</span>
            </div>
          ) : null}
        </div>
      </section>

      <ConfirmDialog
        open={confirmarCerrar}
        title="¿Cerrar esta consulta?"
        description="El broker no podrá seguir respondiendo. Podrás reabrirla después si es necesario."
        confirmLabel="Cerrar consulta"
        cancelLabel="Cancelar"
        destructive
        onConfirm={ejecutarCerrar}
        onCancel={() => setConfirmarCerrar(false)}
      />

      <ConfirmDialog
        open={invitacion !== null}
        title={invitacion ? INVITACIONES[invitacion].confirmTitulo : ""}
        description={
          invitacion
            ? `Se enviará este mensaje al broker: ${INVITACIONES[invitacion].texto}`
            : ""
        }
        confirmLabel="Enviar"
        cancelLabel="Cancelar"
        onConfirm={ejecutarInvitacion}
        onCancel={() => setInvitacion(null)}
      />

      <EnviarComercialModal
        open={enviarComercial}
        consulta={consulta}
        onClose={() => setEnviarComercial(false)}
      />
    </div>
  );
}

function MensajeItem({ mensaje }: { mensaje: Mensaje }) {
  const esBroker = mensaje.autor_tipo === "broker";
  const fecha = new Date(mensaje.created_at).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <li
      id={`mensaje-${mensaje.id}`}
      tabIndex={-1}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3",
        esBroker
          ? "border-brand-yellow/40 bg-amber-50"
          : "border-neutral-200 bg-neutral-50",
      )}
    >
      <p className="text-xs font-semibold text-neutral-600">
        <span className="text-brand-navy">
          {esBroker ? "Broker" : "Tú (Total Assist)"}
        </span>
        <span aria-hidden="true"> · </span>
        <time dateTime={mensaje.created_at}>{fecha}</time>
      </p>
      {mensaje.texto ? (
        <p className="text-brand-navy text-sm whitespace-pre-wrap">
          <TextoConLinks texto={mensaje.texto} />
        </p>
      ) : null}
      {mensaje.adjuntos.length > 0 ? (
        <AdjuntosMensaje adjuntos={mensaje.adjuntos} />
      ) : null}
    </li>
  );
}
