"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, MessageSquarePlus, Circle } from "lucide-react";
import {
  LABEL_ESTATUS,
  LABEL_TIPO_OPINION,
  type ConsultaResumen,
} from "@/lib/api/consultas";
import { cn } from "@/lib/utils";

type Filtro = "todas" | "abiertas" | "cerradas";

/**
 * Lista de consultas del broker actual.
 *
 * Recibe la lista inicial desde el server component; el filtro se hace
 * client-side sobre esa lista. Cuando el broker crea una nueva consulta
 * el server component se refresca en la vuelta al listado.
 */
export function ListaConsultasBroker({
  consultasIniciales,
}: {
  consultasIniciales: ConsultaResumen[];
}) {
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const visibles = useMemo(() => {
    if (filtro === "abiertas") {
      return consultasIniciales.filter((c) => c.estatus !== "cerrada");
    }
    if (filtro === "cerradas") {
      return consultasIniciales.filter((c) => c.estatus === "cerrada");
    }
    return consultasIniciales;
  }, [consultasIniciales, filtro]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-brand-navy text-xl font-bold">Consultas</h1>
          <p className="text-sm text-neutral-600">
            Pregunta al equipo técnico y jurídico sobre pólizas, siniestros o
            criterios de aseguradoras.
          </p>
        </div>
        <Link
          href="/consultas/nueva"
          className="bg-brand-navy hover:bg-brand-navy/90 flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Nueva consulta
        </Link>
      </div>

      <div className="flex gap-1 self-start rounded-full bg-white/70 p-1">
        {(
          [
            { valor: "todas", etiqueta: "Todas" },
            { valor: "abiertas", etiqueta: "Abiertas" },
            { valor: "cerradas", etiqueta: "Cerradas" },
          ] as { valor: Filtro; etiqueta: string }[]
        ).map((op) => (
          <button
            key={op.valor}
            type="button"
            onClick={() => setFiltro(op.valor)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition",
              filtro === op.valor
                ? "bg-brand-yellow text-brand-navy"
                : "text-brand-navy/70 hover:text-brand-navy",
            )}
          >
            {op.etiqueta}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-neutral-300" />
          <p className="mt-2 text-sm text-neutral-500">
            {filtro === "cerradas"
              ? "Aún no tienes consultas cerradas."
              : "No tienes consultas todavía. Crea una para empezar."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibles.map((c) => (
            <ConsultaCard key={c.id} consulta={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ConsultaCard({ consulta }: { consulta: ConsultaResumen }) {
  const fechaBase = consulta.ultimo_mensaje_at ?? consulta.updated_at;
  const fecha = new Date(fechaBase).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const hayNuevos = consulta.sin_leer > 0;
  return (
    <li>
      <Link
        href={`/consultas/${consulta.id}`}
        className="hover:border-brand-yellow flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 transition"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {hayNuevos ? (
              <Circle
                className="text-brand-yellow h-2.5 w-2.5 shrink-0 fill-current"
                aria-label={`${consulta.sin_leer} mensaje(s) sin leer`}
              />
            ) : null}
            <p className="text-brand-navy text-sm font-semibold">
              {consulta.asunto}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
              consulta.estatus === "sin_asignar" &&
                "bg-amber-100 text-amber-800",
              consulta.estatus === "en_curso" &&
                "bg-emerald-100 text-emerald-800",
              consulta.estatus === "cerrada" &&
                "bg-neutral-200 text-neutral-700",
            )}
          >
            {LABEL_ESTATUS[consulta.estatus]}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-neutral-600">
          <span>
            Tipo: <strong>{LABEL_TIPO_OPINION[consulta.tipo_opinion]}</strong>
            {consulta.tipo_pregunta ? ` · ${consulta.tipo_pregunta}` : ""}
          </span>
          <span>Último mensaje: {fecha}</span>
        </div>
      </Link>
    </li>
  );
}
