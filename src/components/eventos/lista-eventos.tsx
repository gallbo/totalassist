"use client";

import { useState, useTransition } from "react";
import {
  CalendarDays,
  CalendarPlus,
  ExternalLink,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  LABEL_TIPO_EVENTO,
  TIPOS_EVENTO,
  borrarEventoAdminClient,
  listarEventosAdminClient,
  listarEventosBrokerClient,
  type Evento,
  type FiltrosEventos,
  type TipoEvento,
} from "@/lib/api/eventos";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TextoConLinks } from "@/components/consultas/texto-con-links";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { EventoFormDialog } from "./evento-form-dialog";

/**
 * Lista de conferencias / cursos / talleres. La usan el broker
 * (/conferencias, solo lectura) y Manuel (/adminConsultas/conferencias,
 * con alta, edicion y borrado). Replica la vista de eventos de Connect.
 *
 * Lista inicial = de hoy en adelante (viene del server component). Al
 * cambiar tipo o mes se vuelve a pedir al proxy. Las fechas llegan en UTC
 * y se muestran en la zona del navegador.
 */
export function ListaEventos({
  modo,
  eventosIniciales,
  sinEncabezado = false,
}: {
  modo: "broker" | "admin";
  eventosIniciales: Evento[];
  /** El broker lo usa dentro de ConferenciasBroker, que pone su propio título. */
  sinEncabezado?: boolean;
}) {
  const esAdmin = modo === "admin";
  const [filtros, setFiltros] = useState<FiltrosEventos>({});
  const [eventos, setEventos] = useState<Evento[]>(eventosIniciales);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // undefined = form cerrado; null = evento nuevo.
  const [enForm, setEnForm] = useState<Evento | null | undefined>(undefined);
  const [aBorrar, setABorrar] = useState<Evento | null>(null);

  const cargar = (f: FiltrosEventos) => {
    setFiltros(f);
    setError(null);
    startTransition(async () => {
      try {
        setEventos(
          esAdmin
            ? await listarEventosAdminClient(f)
            : await listarEventosBrokerClient(f),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "No pudimos cargar.");
      }
    });
  };

  const ejecutarBorrar = async () => {
    const ev = aBorrar;
    setABorrar(null);
    if (!ev) return;
    try {
      await borrarEventoAdminClient(ev.id);
      setEventos((lista) => lista.filter((x) => x.id !== ev.id));
      toast.success("Evento borrado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos borrar.");
    }
  };

  const tabs: { valor: TipoEvento | undefined; etiqueta: string }[] = [
    { valor: undefined, etiqueta: "Todos" },
    ...TIPOS_EVENTO.map((t) => ({ valor: t, etiqueta: LABEL_TIPO_EVENTO[t] })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          sinEncabezado && "hidden",
        )}
      >
        <div>
          <h1 className="text-brand-navy text-xl font-bold">Conferencias</h1>
          <p className="text-sm text-neutral-600">
            {esAdmin
              ? "Agrega y edita las conferencias, cursos y talleres que ven los brokers."
              : "Conferencias, cursos y talleres de Total Assist. Entra al evento con el botón de cada uno."}
          </p>
        </div>
        {esAdmin ? (
          <button
            type="button"
            onClick={() => setEnForm(null)}
            className="bg-brand-navy hover:bg-brand-navy/90 flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Agregar evento
          </button>
        ) : null}
      </div>

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
              aria-pressed={filtros.tipo === t.valor}
              onClick={() => cargar({ ...filtros, tipo: t.valor })}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition",
                filtros.tipo === t.valor
                  ? "bg-brand-yellow text-brand-navy"
                  : "text-brand-navy/70 hover:text-brand-navy",
              )}
            >
              {t.etiqueta}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="filtro-mes"
            className="text-sm font-medium text-neutral-700"
          >
            Filtrar por mes
          </label>
          <input
            id="filtro-mes"
            type="month"
            value={filtros.mes ?? ""}
            onChange={(e) =>
              cargar({ ...filtros, mes: e.target.value || undefined })
            }
            className="focus:ring-brand-yellow rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
          />
          {filtros.mes ? (
            <button
              type="button"
              onClick={() => cargar({ ...filtros, mes: undefined })}
              aria-label="Quitar filtro de mes"
              className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {pending ? "Cargando eventos…" : `${eventos.length} eventos.`}
      </p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {eventos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <CalendarDays
            className="mx-auto h-8 w-8 text-neutral-300"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm text-neutral-500">
            {filtros.mes
              ? "No hay eventos en ese mes."
              : "No hay eventos próximos."}
          </p>
        </div>
      ) : (
        <div className={cn("flex flex-col gap-5", pending && "opacity-60")}>
          {agruparPorMes(eventos).map((grupo) => (
            <section key={grupo.clave} aria-label={grupo.titulo}>
              <h2
                className="text-brand-navy mb-2 text-base font-semibold"
                suppressHydrationWarning
              >
                {grupo.titulo}
              </h2>
              <ul className="flex flex-col gap-2">
                {grupo.eventos.map((ev) => (
                  <EventoItem
                    key={ev.id}
                    evento={ev}
                    esAdmin={esAdmin}
                    onEditar={() => setEnForm(ev)}
                    onBorrar={() => setABorrar(ev)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {esAdmin && enForm !== undefined ? (
        <EventoFormDialog
          evento={enForm}
          onClose={() => setEnForm(undefined)}
          onSaved={() => {
            setEnForm(undefined);
            cargar(filtros);
          }}
        />
      ) : null}

      {esAdmin ? (
        <ConfirmDialog
          open={aBorrar !== null}
          title="¿Borrar este evento?"
          description={
            aBorrar
              ? `Se quitará "${aBorrar.nombre}" de la lista de los brokers.`
              : ""
          }
          confirmLabel="Borrar evento"
          cancelLabel="Cancelar"
          destructive
          onConfirm={ejecutarBorrar}
          onCancel={() => setABorrar(null)}
        />
      ) : null}
    </div>
  );
}

function EventoItem({
  evento,
  esAdmin,
  onEditar,
  onBorrar,
}: {
  evento: Evento;
  esAdmin: boolean;
  onEditar: () => void;
  onBorrar: () => void;
}) {
  const fecha = new Date(evento.fecha).toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  });
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4">
      <article
        className="flex flex-col gap-2"
        aria-labelledby={`evento-${evento.id}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3
            id={`evento-${evento.id}`}
            className="text-brand-navy text-base font-bold"
          >
            {evento.nombre}
          </h3>
          <span className="bg-brand-navy rounded-full px-2 py-0.5 text-xs font-semibold text-white">
            {LABEL_TIPO_EVENTO[evento.tipo]}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap text-neutral-700">
          <TextoConLinks texto={evento.descripcion} />
        </p>
        <p className="text-brand-navy flex items-center gap-1.5 text-sm font-semibold">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {evento.proximamente ? (
            "Próximamente"
          ) : (
            <time dateTime={evento.fecha} suppressHydrationWarning>
              {fecha}
            </time>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {evento.url ? (
            <a
              href={evento.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ir al evento ${evento.nombre} (se abre en otra pestaña)`}
              className="bg-brand-yellow text-brand-navy flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Ir al evento
            </a>
          ) : null}
          {esAdmin ? (
            <>
              <button
                type="button"
                onClick={onEditar}
                aria-label={`Editar ${evento.nombre}`}
                className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar
              </button>
              <button
                type="button"
                onClick={onBorrar}
                aria-label={`Borrar ${evento.nombre}`}
                className="flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Borrar
              </button>
            </>
          ) : null}
        </div>
      </article>
    </li>
  );
}

/** Agrupa por mes local ("octubre de 2026") conservando el orden de la API. */
function agruparPorMes(eventos: Evento[]) {
  const grupos: { clave: string; titulo: string; eventos: Evento[] }[] = [];
  for (const ev of eventos) {
    const d = new Date(ev.fecha);
    const clave = `${d.getFullYear()}-${d.getMonth()}`;
    let g = grupos[grupos.length - 1];
    if (!g || g.clave !== clave) {
      g = {
        clave,
        titulo: mayusculaInicial(
          d.toLocaleString("es-MX", { month: "long", year: "numeric" }),
        ),
        eventos: [],
      };
      grupos.push(g);
    }
    g.eventos.push(ev);
  }
  return grupos;
}

/** "octubre de 2026" -> "Octubre de 2026" (el CSS capitalize ponía "De"). */
function mayusculaInicial(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}
