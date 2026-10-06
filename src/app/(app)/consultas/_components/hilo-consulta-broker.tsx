"use client";

import { useEffect, useState } from "react";
import { TextoConLinks } from "@/components/consultas/texto-con-links";
import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import {
  LABEL_ESTATUS,
  LABEL_TIPO_OPINION,
  agregarMensajeBrokerClient,
  cerrarConsultaBrokerClient,
  marcarLeidosBrokerClient,
  obtenerConsultaBrokerClient,
  type ConsultaDetalle,
  type Mensaje,
} from "@/lib/api/consultas";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { AdjuntosComposer } from "@/components/consultas/adjuntos-composer";
import { AdjuntosMensaje } from "@/components/consultas/adjuntos-mensaje";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const MAX_CARACTERES = 250;

/**
 * Hilo de conversación de una consulta desde la perspectiva del broker.
 *
 * Al montar marca los mensajes del admin como leídos (fire-and-forget).
 * Cada respuesta hace POST /mensajes y agrega el resultado al hilo.
 */
export function HiloConsultaBroker({
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

  const cerrada = consulta.estatus === "cerrada";

  const ejecutarCerrar = async () => {
    setConfirmarCerrar(false);
    try {
      const actualizada = await cerrarConsultaBrokerClient(consulta.id);
      setConsulta(actualizada);
      toast.success("Consulta cerrada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos cerrar.");
    }
  };

  const refrescar = async () => {
    if (refrescando) return;
    setRefrescando(true);
    try {
      const fresh = await obtenerConsultaBrokerClient(consulta.id);
      setConsulta(fresh);
      if (fresh.sin_leer > 0) {
        marcarLeidosBrokerClient(consulta.id).catch(() => {});
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos actualizar.");
    } finally {
      setRefrescando(false);
    }
  };

  useEffect(() => {
    if (consulta.sin_leer > 0) {
      marcarLeidosBrokerClient(consulta.id).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consulta.id]);

  const puedeEnviar =
    (texto.trim().length >= 3 || adjuntos.length > 0) && !enviando && !cerrada;

  const enviar = async () => {
    if (!puedeEnviar) return;
    setEnviando(true);
    try {
      const mensaje = await agregarMensajeBrokerClient(consulta.id, {
        texto: texto.trim() || undefined,
        adjuntos,
        duraciones_ms: duracionesMs,
      });
      setConsulta((c) => ({
        ...c,
        mensajes: [...c.mensajes, mensaje],
        ultimo_mensaje_at: mensaje.created_at,
      }));
      setTexto("");
      setAdjuntos([]);
      setDuracionesMs([]);
      setComposerKey((k) => k + 1);
      toast.success("Mensaje enviado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos enviar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4">
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
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
          <span>
            Tipo: <strong>{LABEL_TIPO_OPINION[consulta.tipo_opinion]}</strong>
            {consulta.tipo_pregunta ? ` · ${consulta.tipo_pregunta}` : ""}
          </span>
          <span>
            Creada:{" "}
            {new Date(consulta.created_at).toLocaleString("es-MX", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </header>

      <section
        aria-label="Conversación"
        className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
      >
        {consulta.mensajes.map((m) => (
          <Burbuja key={m.id} mensaje={m} />
        ))}
      </section>

      {cerrada ? (
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          <CheckCircle2 className="text-state-success h-5 w-5 shrink-0" />
          Esta consulta está cerrada. Si tienes una nueva duda relacionada, crea
          una nueva consulta.
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4">
          <label
            htmlFor="mensaje-broker"
            className="text-brand-navy text-sm font-semibold"
          >
            Responder
          </label>
          <textarea
            id="mensaje-broker"
            rows={3}
            value={texto}
            maxLength={MAX_CARACTERES}
            onChange={(e) => setTexto(e.target.value)}
            disabled={enviando}
            placeholder="Escribe un mensaje…"
            className="focus:ring-brand-yellow rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
          <p className="text-xs text-neutral-500">
            {texto.length}/{MAX_CARACTERES} caracteres
          </p>
          <AdjuntosComposer
            key={composerKey}
            disabled={enviando}
            onChange={(files, dur) => {
              setAdjuntos(files);
              setDuracionesMs(dur);
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setConfirmarCerrar(true)}
              className="flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Cerrar consulta
            </button>
            <button
              type="button"
              onClick={enviar}
              disabled={!puedeEnviar}
              className="bg-brand-navy hover:bg-brand-navy/90 rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmarCerrar}
        title="¿Cerrar esta consulta?"
        description="Ya no podrás enviar más mensajes en este hilo. Si más adelante tienes una duda relacionada, tendrás que crear una nueva consulta."
        confirmLabel="Cerrar consulta"
        cancelLabel="Cancelar"
        destructive
        onConfirm={ejecutarCerrar}
        onCancel={() => setConfirmarCerrar(false)}
      />
    </article>
  );
}

function Burbuja({ mensaje }: { mensaje: Mensaje }) {
  const esBroker = mensaje.autor_tipo === "broker";
  return (
    <div
      className={cn("flex gap-2", esBroker ? "flex-row-reverse" : "flex-row")}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          esBroker ? "bg-brand-yellow" : "bg-brand-navy",
        )}
        aria-hidden
      >
        {esBroker ? (
          <User className="text-brand-navy h-4 w-4" />
        ) : (
          <ShieldCheck className="h-4 w-4 text-white" />
        )}
      </span>
      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1 rounded-2xl px-4 py-3 text-sm",
          esBroker
            ? "bg-brand-yellow/20 text-brand-navy rounded-tr-none"
            : "text-brand-navy rounded-tl-none border border-neutral-200 bg-white",
        )}
      >
        <p className="text-xs font-semibold">
          {esBroker ? "Tú" : "Total Assist"}
        </p>
        {mensaje.texto ? (
          <p className="whitespace-pre-wrap">
            <TextoConLinks texto={mensaje.texto} />
          </p>
        ) : null}
        {mensaje.adjuntos.length > 0 ? (
          <AdjuntosMensaje adjuntos={mensaje.adjuntos} />
        ) : null}
        <p className="text-[10px] text-neutral-500">
          {new Date(mensaje.created_at).toLocaleString("es-MX", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
    </div>
  );
}
