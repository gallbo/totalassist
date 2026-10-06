"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, RefreshCw } from "lucide-react";
import {
  LABEL_TIPO_OPINION,
  type BandejaAdmin,
  type ConsultaResumen,
} from "@/lib/api/consultas";
import { cn } from "@/lib/utils";

/**
 * Tabs de la vista admin.
 *
 * La bandeja inicial se pinta con datos del server component. Cuando el
 * usuario cambia de bandeja, hacemos fetch al proxy — es un GET simple
 * y ahi es donde vive la logica de filtrado (ver
 * Api\TotalAssistAdmin\ConsultaController::listar).
 *
 * Estructura ARIA:
 *   <nav role="tablist" aria-label="Filtrar consultas">
 *     <button role="tab" aria-selected="..." aria-controls="...">
 *   <section role="tabpanel" id="...">
 */

const BUCKETS: { valor: BandejaAdmin; etiqueta: string }[] = [
  { valor: "sin_responder", etiqueta: "Sin responder" },
  { valor: "nuevos_mensajes", etiqueta: "Nuevos mensajes" },
  { valor: "respondidas", etiqueta: "Respondidas" },
  { valor: "cerradas", etiqueta: "Cerradas" },
];

export function TabsAdmin({
  bandejaInicial,
  consultasIniciales,
}: {
  bandejaInicial: BandejaAdmin;
  consultasIniciales: ConsultaResumen[];
}) {
  const [activa, setActiva] = useState<BandejaAdmin>(bandejaInicial);
  const [consultas, setConsultas] =
    useState<ConsultaResumen[]>(consultasIniciales);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const cargarBandeja = (b: BandejaAdmin) => {
    setActiva(b);
    setError(null);
    startTransition(async () => {
      try {
        const q = new URLSearchParams({ bandeja: b }).toString();
        const res = await fetch(
          `/api/proxy/skipper/api/totalassist/admin/consultas?${q}`,
        );
        if (!res.ok) throw new Error("No pude cargar la bandeja.");
        const j = (await res.json()) as { data: ConsultaResumen[] };
        setConsultas(j.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error inesperado.");
      }
    });
  };

  // Refrescar la bandeja activa al volver de un detalle (que pudo cerrar
  // o responder). router.refresh() del detalle solo revalida el detalle,
  // no esta pagina, asi que pegamos un pull manual cuando el foco vuelve.
  useEffect(() => {
    const onFocus = () => cargarBandeja(activa);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [activa]);

  // Navegacion con flechas — patron ARIA estandar para tablists.
  const onKeyDownTab = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = BUCKETS.findIndex((b) => b.valor === activa);
    const siguiente =
      e.key === "ArrowRight"
        ? (i + 1) % BUCKETS.length
        : (i - 1 + BUCKETS.length) % BUCKETS.length;
    cargarBandeja(BUCKETS[siguiente].valor);
    const nextBtn = document.getElementById(`tab-${BUCKETS[siguiente].valor}`);
    nextBtn?.focus();
  };

  return (
    <div className="flex flex-col gap-4">
      <nav
        role="tablist"
        aria-label="Filtrar consultas por estado"
        className="grid grid-cols-2 gap-1 rounded-2xl border border-neutral-200 bg-white p-1 sm:flex sm:self-start sm:rounded-full"
      >
        {BUCKETS.map((b) => (
          <button
            key={b.valor}
            id={`tab-${b.valor}`}
            role="tab"
            aria-selected={activa === b.valor}
            aria-controls={`panel-${b.valor}`}
            tabIndex={activa === b.valor ? 0 : -1}
            onClick={() => cargarBandeja(b.valor)}
            onKeyDown={onKeyDownTab}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              activa === b.valor
                ? "bg-brand-navy text-white"
                : "text-brand-navy/70 hover:text-brand-navy",
            )}
          >
            {b.etiqueta}
          </button>
        ))}
      </nav>

      <section
        id={`panel-${activa}`}
        role="tabpanel"
        aria-labelledby={`tab-${activa}`}
        aria-busy={pending}
        aria-live="polite"
        className="flex flex-col gap-2"
      >
        {pending ? (
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            Cargando…
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {!pending && consultas.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500">
            No hay consultas en esta bandeja.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {consultas.map((c) => (
              <ConsultaCardAdmin key={c.id} consulta={c} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ConsultaCardAdmin({ consulta }: { consulta: ConsultaResumen }) {
  const fechaBase = consulta.ultimo_mensaje_at ?? consulta.updated_at;
  const fecha = new Date(fechaBase).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const hayNuevos = consulta.sin_leer > 0;
  const brokerNombre = consulta.broker?.nombre ?? "Broker";
  return (
    <li>
      <Link
        href={`/adminConsultas/${consulta.id}`}
        className="hover:border-brand-yellow flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition"
        aria-label={`Abrir consulta de ${brokerNombre}: ${consulta.asunto}${hayNuevos ? ", tiene mensajes sin leer" : ""}`}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-brand-navy text-sm font-semibold">
            {consulta.asunto}
          </p>
          <p className="text-xs text-neutral-600">
            <span>
              Broker: <strong>{brokerNombre}</strong>
            </span>
            <span aria-hidden="true"> · </span>
            <span>Tipo: {LABEL_TIPO_OPINION[consulta.tipo_opinion]}</span>
            {consulta.tipo_pregunta ? (
              <>
                <span aria-hidden="true"> · </span>
                <span>{consulta.tipo_pregunta}</span>
              </>
            ) : null}
            <span aria-hidden="true"> · </span>
            <span>Último: {fecha}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hayNuevos ? (
            <span
              className="bg-brand-yellow text-brand-navy rounded-full px-2 py-0.5 text-[10px] font-bold"
              aria-label={`${consulta.sin_leer} mensajes nuevos`}
            >
              {consulta.sin_leer} nuevo{consulta.sin_leer > 1 ? "s" : ""}
            </span>
          ) : null}
          <ChevronRight
            className="text-brand-navy/50 h-4 w-4"
            aria-hidden="true"
          />
        </div>
      </Link>
    </li>
  );
}
