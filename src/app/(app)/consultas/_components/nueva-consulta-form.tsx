"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  crearConsultaClient,
  type TipoOpinion,
  type TipoPregunta,
} from "@/lib/api/consultas";
import { toast } from "@/lib/toast";
import { AdjuntosComposer } from "@/components/consultas/adjuntos-composer";

const MAX_CARACTERES = 250;

/**
 * Formulario para crear una nueva consulta.
 *
 * Contract con backend (POST /api/brokers/consultas):
 *   - tipo_opinion: "tecnica" | "juridica" (required)
 *   - tipo_pregunta_id: id del catalogo consultas_tipos_pregunta
 *   - texto: hasta 250 chars (matching el limite del Connect original)
 *   - adjuntos[]: imagenes y audios (opcional)
 *   - duraciones_ms[]: para audios (ms)
 *
 * El backend autogenera el `asunto` a partir del texto si no viene, asi
 * que aqui no lo pedimos (el UI de Connect tampoco lo tenia).
 */
export function NuevaConsultaForm({
  tiposPregunta,
}: {
  tiposPregunta: TipoPregunta[];
}) {
  const router = useRouter();
  const [tipoOpinion, setTipoOpinion] = useState<TipoOpinion>("tecnica");
  const [tipoPreguntaId, setTipoPreguntaId] = useState<number | "">("");
  const [texto, setTexto] = useState("");
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [duracionesMs, setDuracionesMs] = useState<(number | null)[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [composerKey, setComposerKey] = useState(0);

  const puedeEnviar = useMemo(() => {
    const t = texto.trim();
    return (
      !!tipoOpinion &&
      (tiposPregunta.length === 0 || tipoPreguntaId !== "") &&
      (t.length >= 3 || adjuntos.length > 0)
    );
  }, [texto, adjuntos, tipoOpinion, tipoPreguntaId, tiposPregunta.length]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!puedeEnviar || pending) return;

    startTransition(async () => {
      try {
        const c = await crearConsultaClient({
          tipo_opinion: tipoOpinion,
          tipo_pregunta_id:
            typeof tipoPreguntaId === "number" ? tipoPreguntaId : null,
          texto: texto.trim() || undefined,
          adjuntos,
          duraciones_ms: duracionesMs,
        });
        toast.success("Consulta enviada.");
        // Reset defensivo — router.push despues, por si el push falla el
        // usuario no queda con datos "colgados".
        setTexto("");
        setAdjuntos([]);
        setDuracionesMs([]);
        setComposerKey((k) => k + 1);
        router.push(`/consultas/${c.id}`);
        router.refresh();
      } catch (err) {
        const mensaje =
          err instanceof Error
            ? err.message
            : "No pudimos enviar tu consulta. Intenta de nuevo.";
        setError(mensaje);
        toast.error(mensaje);
      }
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5"
      noValidate
    >
      {tiposPregunta.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tipo_pregunta"
            className="text-brand-navy text-sm font-semibold"
          >
            Clase de consulta
          </label>
          <select
            id="tipo_pregunta"
            value={tipoPreguntaId === "" ? "" : String(tipoPreguntaId)}
            onChange={(e) =>
              setTipoPreguntaId(e.target.value ? Number(e.target.value) : "")
            }
            disabled={pending}
            required
            className="focus:ring-brand-yellow rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          >
            <option value="">Selecciona una opción…</option>
            {tiposPregunta.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-brand-navy text-sm font-semibold">
          Clase de opinión
        </legend>
        <div className="flex gap-2">
          {(
            [
              { valor: "tecnica", etiqueta: "Técnica" },
              { valor: "juridica", etiqueta: "Jurídica" },
            ] as { valor: TipoOpinion; etiqueta: string }[]
          ).map((op) => (
            <label
              key={op.valor}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                tipoOpinion === op.valor
                  ? "border-brand-yellow bg-brand-yellow/10 text-brand-navy"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <input
                type="radio"
                name="tipo_opinion"
                value={op.valor}
                checked={tipoOpinion === op.valor}
                onChange={() => setTipoOpinion(op.valor)}
                disabled={pending}
                className="sr-only"
              />
              {op.etiqueta}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="texto"
          className="text-brand-navy text-sm font-semibold"
        >
          ¿Cuál es tu duda?
        </label>
        <textarea
          id="texto"
          value={texto}
          maxLength={MAX_CARACTERES}
          rows={5}
          onChange={(e) => setTexto(e.target.value)}
          disabled={pending}
          placeholder="Describe brevemente el caso: aseguradora, tipo de póliza, hechos y qué necesitas resolver."
          className="focus:ring-brand-yellow rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
        <p className="text-xs text-neutral-500">
          {texto.length}/{MAX_CARACTERES} caracteres
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-brand-navy text-sm font-semibold">
          Adjuntos (opcional)
        </span>
        <AdjuntosComposer
          key={composerKey}
          disabled={pending}
          onChange={(files, dur) => {
            setAdjuntos(files);
            setDuracionesMs(dur);
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={!puedeEnviar || pending}
          className="bg-brand-navy hover:bg-brand-navy/90 rounded-full px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Enviar consulta"}
        </button>
      </div>
    </form>
  );
}
