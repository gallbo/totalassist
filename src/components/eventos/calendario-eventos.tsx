"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  LABEL_TIPO_EVENTO,
  TIPOS_EVENTO,
  listarEventosBrokerClient,
  type Evento,
  type TipoEvento,
} from "@/lib/api/eventos";
import { TextoConLinks } from "@/components/consultas/texto-con-links";
import { cn } from "@/lib/utils";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Color por tipo: chip del calendario y punto en móvil. */
const COLOR_TIPO: Record<TipoEvento, string> = {
  conferencia: "bg-brand-navy text-white",
  curso: "bg-emerald-600 text-white",
  taller: "bg-brand-yellow text-brand-navy",
};

function mesClave(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function sumarMeses(mes: string, n: number): string {
  const [a, m] = mes.split("-").map(Number);
  return mesClave(new Date(a, m - 1 + n, 1));
}

function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Vista de calendario mensual de conferencias para el broker (vista por
 * defecto en /conferencias). Cada mes se pide a Skipper con `mes=YYYY-MM`.
 * Clic en un evento abre su detalle con el botón "Ir al evento".
 *
 * En pantallas chicas los eventos del día se ven como puntos y abajo del
 * calendario sale la lista del mes, para no amontonar texto en celdas
 * angostas.
 */
export function CalendarioEventos({
  mesInicial,
  eventosIniciales,
}: {
  /** YYYY-MM */
  mesInicial: string;
  eventosIniciales: Evento[];
}) {
  const [mes, setMes] = useState(mesInicial);
  const [tipo, setTipo] = useState<TipoEvento | undefined>(undefined);
  const [eventos, setEventos] = useState<Evento[]>(eventosIniciales);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [seleccionado, setSeleccionado] = useState<Evento | null>(null);

  const cargar = (nuevoMes: string, nuevoTipo: TipoEvento | undefined) => {
    setMes(nuevoMes);
    setTipo(nuevoTipo);
    setError(null);
    startTransition(async () => {
      try {
        setEventos(
          await listarEventosBrokerClient({ mes: nuevoMes, tipo: nuevoTipo }),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "No pudimos cargar.");
      }
    });
  };

  const [anio, numMes] = mes.split("-").map(Number);
  const primerDia = new Date(anio, numMes - 1, 1);
  const diasEnMes = new Date(anio, numMes, 0).getDate();
  // Semana empieza en lunes.
  const offset = (primerDia.getDay() + 6) % 7;
  const celdas: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];
  while (celdas.length % 7 !== 0) celdas.push(null);

  const porDia = new Map<number, Evento[]>();
  for (const ev of eventos) {
    const d = new Date(ev.fecha);
    if (d.getFullYear() !== anio || d.getMonth() !== numMes - 1) continue;
    const lista = porDia.get(d.getDate()) ?? [];
    lista.push(ev);
    porDia.set(d.getDate(), lista);
  }

  const hoy = new Date();
  const esHoy = (dia: number) =>
    hoy.getFullYear() === anio &&
    hoy.getMonth() === numMes - 1 &&
    hoy.getDate() === dia;

  const tituloMesRaw = primerDia.toLocaleString("es-MX", {
    month: "long",
    year: "numeric",
  });
  const tituloMes =
    tituloMesRaw.charAt(0).toUpperCase() + tituloMesRaw.slice(1);

  const tabs: { valor: TipoEvento | undefined; etiqueta: string }[] = [
    { valor: undefined, etiqueta: "Todos" },
    ...TIPOS_EVENTO.map((t) => ({ valor: t, etiqueta: LABEL_TIPO_EVENTO[t] })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Filtrar por tipo"
          className="flex flex-wrap gap-1 self-start rounded-full bg-white/70 p-1"
        >
          {tabs.map((t) => (
            <button
              key={t.etiqueta}
              type="button"
              aria-pressed={tipo === t.valor}
              onClick={() => cargar(mes, t.valor)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition",
                tipo === t.valor
                  ? "bg-brand-yellow text-brand-navy"
                  : "text-brand-navy/70 hover:text-brand-navy",
              )}
            >
              {t.etiqueta}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => cargar(sumarMeses(mes, -1), tipo)}
            aria-label="Mes anterior"
            className="text-brand-navy rounded-full border border-neutral-200 bg-white p-1.5 hover:bg-neutral-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <h2
            className="text-brand-navy min-w-[10rem] text-center text-base font-bold"
            aria-live="polite"
          >
            {tituloMes}
          </h2>
          <button
            type="button"
            onClick={() => cargar(sumarMeses(mes, 1), tipo)}
            aria-label="Mes siguiente"
            className="text-brand-navy rounded-full border border-neutral-200 bg-white p-1.5 hover:bg-neutral-50"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => cargar(mesClave(new Date()), tipo)}
            className="text-brand-navy rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium hover:bg-neutral-50"
          >
            Hoy
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div
        className={cn(
          "overflow-hidden rounded-xl border border-neutral-200 bg-white",
          pending && "opacity-60",
        )}
      >
        <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
          {DIAS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-neutral-600"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {celdas.map((dia, i) => {
            const delDia = dia ? (porDia.get(dia) ?? []) : [];
            return (
              <div
                key={i}
                className={cn(
                  "min-h-16 border-r border-b border-neutral-100 p-1 sm:min-h-24 sm:p-1.5",
                  (i + 1) % 7 === 0 && "border-r-0",
                  !dia && "bg-neutral-50/60",
                )}
              >
                {dia ? (
                  <>
                    <span
                      suppressHydrationWarning
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                        esHoy(dia)
                          ? "bg-brand-navy font-bold text-white"
                          : "text-neutral-600",
                      )}
                    >
                      {dia}
                    </span>
                    <ul className="mt-1 flex flex-col gap-1">
                      {delDia.map((ev) => (
                        <li key={ev.id}>
                          <button
                            type="button"
                            onClick={() => setSeleccionado(ev)}
                            title={ev.nombre}
                            aria-label={`${LABEL_TIPO_EVENTO[ev.tipo]}: ${ev.nombre}`}
                            className={cn(
                              "w-full rounded-md text-left text-[11px] leading-tight font-semibold hover:opacity-90",
                              "h-2 sm:h-auto sm:px-1.5 sm:py-1",
                              COLOR_TIPO[ev.tipo],
                            )}
                          >
                            <span
                              className="hidden sm:line-clamp-2"
                              suppressHydrationWarning
                            >
                              {ev.proximamente
                                ? "Por confirmar"
                                : horaCorta(ev.fecha)}{" "}
                              · {ev.nombre}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
        {TIPOS_EVENTO.map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn("h-3 w-3 rounded-full", COLOR_TIPO[t])}
            />
            {LABEL_TIPO_EVENTO[t]}
          </span>
        ))}
      </div>

      {/* En móvil, las celdas solo muestran puntos: lista del mes debajo. */}
      <ul className="flex flex-col gap-2 sm:hidden">
        {eventos.length === 0 ? (
          <li className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500">
            No hay eventos este mes.
          </li>
        ) : (
          eventos.map((ev) => (
            <li key={ev.id}>
              <button
                type="button"
                onClick={() => setSeleccionado(ev)}
                className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-3 w-3 shrink-0 rounded-full",
                    COLOR_TIPO[ev.tipo],
                  )}
                />
                <span className="flex flex-col">
                  <span className="text-brand-navy text-sm font-semibold">
                    {ev.nombre}
                  </span>
                  <span
                    className="text-xs text-neutral-500"
                    suppressHydrationWarning
                  >
                    {ev.proximamente
                      ? "Fecha por confirmar"
                      : new Date(ev.fecha).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                  </span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>

      {seleccionado ? (
        <EventoDetalleDialog
          evento={seleccionado}
          onClose={() => setSeleccionado(null)}
        />
      ) : null}
    </div>
  );
}

/** Detalle de un evento del calendario. Se monta solo mientras está abierto. */
function EventoDetalleDialog({
  evento,
  onClose,
}: {
  evento: Evento;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        // Clic en el fondo cierra.
        if (e.target === dialogRef.current) onClose();
      }}
      aria-labelledby="evento-detalle-titulo"
      className="m-auto w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id="evento-detalle-titulo"
            className="text-brand-navy text-lg font-bold"
          >
            {evento.nombre}
          </h2>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              COLOR_TIPO[evento.tipo],
            )}
          >
            {LABEL_TIPO_EVENTO[evento.tipo]}
          </span>
        </div>
        <p className="text-brand-navy flex items-center gap-1.5 text-sm font-semibold">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {evento.proximamente
            ? "Próximamente"
            : new Date(evento.fecha).toLocaleString("es-MX", {
                dateStyle: "long",
                timeStyle: "short",
              })}
        </p>
        <p className="text-sm whitespace-pre-wrap text-neutral-700">
          <TextoConLinks texto={evento.descripcion} />
        </p>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cerrar
          </button>
          {evento.url ? (
            <a
              href={evento.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-yellow text-brand-navy flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Ir al evento
            </a>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
