"use client";

import { useEffect, useRef, useState } from "react";
import {
  LABEL_TIPO_EVENTO,
  TIPOS_EVENTO,
  guardarEventoAdminClient,
  type Evento,
  type TipoEvento,
} from "@/lib/api/eventos";
import { toast } from "@/lib/toast";

/** ISO UTC -> valor de <input type="datetime-local"> en la zona del navegador. */
function isoALocal(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Alta / edicion de un evento (solo admin).
 *
 * Se monta solo mientras esta abierto (el padre lo desmonta al cerrar), asi
 * el estado del form se inicializa desde `evento` sin efectos.
 *
 * ACCESIBILIDAD: <dialog> nativo (focus trap + Escape), labels explicitos,
 * error en region aria-live y foco inicial en el primer campo.
 */
export function EventoFormDialog({
  evento,
  onClose,
  onSaved,
}: {
  /** null = evento nuevo. */
  evento: Evento | null;
  onClose: () => void;
  onSaved: (e: Evento) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const primerCampoRef = useRef<HTMLSelectElement | null>(null);

  const [tipo, setTipo] = useState<TipoEvento>(evento?.tipo ?? "taller");
  const [nombre, setNombre] = useState(evento?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(evento?.descripcion ?? "");
  const [fecha, setFecha] = useState(evento ? isoALocal(evento.fecha) : "");
  const [proximamente, setProximamente] = useState(
    evento?.proximamente ?? false,
  );
  const [url, setUrl] = useState(evento?.url ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    primerCampoRef.current?.focus();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nombre.trim().length < 3) return setError("El nombre es obligatorio.");
    if (descripcion.trim().length < 3)
      return setError("La descripción es obligatoria.");
    if (!fecha) return setError("La fecha es obligatoria.");
    setError(null);
    setGuardando(true);
    try {
      const guardado = await guardarEventoAdminClient(
        {
          tipo,
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          fecha: new Date(fecha).toISOString(),
          proximamente,
          url: url.trim() || null,
        },
        evento?.id,
      );
      toast.success(evento ? "Evento actualizado." : "Evento creado.");
      onSaved(guardado);
    } catch (err) {
      const m = err instanceof Error ? err.message : "No pudimos guardar.";
      setError(m);
      toast.error(m);
    } finally {
      setGuardando(false);
    }
  };

  const campo =
    "focus:ring-brand-yellow rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="evento-form-title"
      className="m-auto w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/50"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
        <h2
          id="evento-form-title"
          className="text-brand-navy text-lg font-bold"
        >
          {evento ? "Editar evento" : "Agregar evento"}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Tipo de evento
            <select
              ref={primerCampoRef}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoEvento)}
              className={campo}
            >
              {TIPOS_EVENTO.map((t) => (
                <option key={t} value={t}>
                  {LABEL_TIPO_EVENTO[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Fecha y hora
            <input
              type="datetime-local"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={campo}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          Nombre del evento
          <input
            type="text"
            required
            maxLength={255}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          Descripción
          <textarea
            required
            rows={4}
            maxLength={5000}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          Enlace del evento (Zoom)
          <input
            type="url"
            maxLength={500}
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={campo}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={proximamente}
            onChange={(e) => setProximamente(e.target.checked)}
            className="h-4 w-4"
          />
          Fecha por confirmar (mostrar &quot;Próximamente&quot;)
        </label>

        <p aria-live="polite" className="text-sm text-red-700">
          {error}
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="bg-brand-navy hover:bg-brand-navy/90 rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {guardando
              ? "Guardando…"
              : evento
                ? "Guardar cambios"
                : "Crear evento"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
