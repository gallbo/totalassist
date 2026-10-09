"use client";

import { useState, useTransition } from "react";
import { Pencil, Star } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Estrellas } from "@/components/domain/estrellas";
import { cn } from "@/lib/utils";
import type { EvaluacionPublica } from "@/lib/api/publico";
import { editarEvaluacionAction, enviarEvaluacionAction } from "../_actions";

const PREGUNTA_PLATAFORMA =
  "En una escala del 1 al 5, ¿qué tan fácil y rápido fue utilizar la plataforma de Total Assist para registrar su solicitud?";
const PREGUNTA_ATENCION =
  "¿Cómo califica la atención, empatía y claridad de la información brindada por el asesor/analista que atendió su caso?";
const PREGUNTA_COMENTARIOS =
  "Por favor, compártanos brevemente el motivo de su calificación o cualquier comentario sobre el desempeño del analista/asesor.";

type Props = {
  token: string;
  evaluacionInicial: EvaluacionPublica | null;
};

export function Evaluacion({ token, evaluacionInicial }: Props) {
  const [evaluacion, setEvaluacion] = useState(evaluacionInicial);
  const [editando, setEditando] = useState(false);

  if (evaluacion && !editando) {
    return (
      <EvaluacionMostrada
        evaluacion={evaluacion}
        onEditar={() => setEditando(true)}
      />
    );
  }

  return (
    <EvaluacionForm
      token={token}
      inicial={evaluacion}
      onGuardada={(data) => {
        setEvaluacion(data);
        setEditando(false);
      }}
      onCancelar={evaluacion ? () => setEditando(false) : undefined}
    />
  );
}

function EvaluacionForm({
  token,
  inicial,
  onGuardada,
  onCancelar,
}: {
  token: string;
  inicial: EvaluacionPublica | null;
  onGuardada: (data: EvaluacionPublica) => void;
  onCancelar?: () => void;
}) {
  const [plataforma, setPlataforma] = useState(
    inicial?.calificacion_plataforma ?? 0,
  );
  const [atencion, setAtencion] = useState(inicial?.calificacion_atencion ?? 0);
  const [comentarios, setComentarios] = useState(inicial?.comentarios ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const esEdicion = inicial !== null;

  const onGuardar = () => {
    const texto = comentarios.trim();
    if (plataforma === 0 && atencion === 0 && texto === "") {
      setError("Responde al menos una pregunta para guardar tu evaluación.");
      return;
    }
    setError(null);

    const input = {
      calificacion_plataforma: plataforma || null,
      calificacion_atencion: atencion || null,
      comentarios: texto || null,
    };

    startTransition(async () => {
      const result = esEdicion
        ? await editarEvaluacionAction(token, input)
        : await enviarEvaluacionAction(token, input);
      if (result.ok) {
        onGuardada(result.data);
        toast.success(
          esEdicion
            ? "Actualizamos tu evaluación."
            : "¡Gracias por tu evaluación!",
        );
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <section className="flex flex-col gap-6 border-t border-neutral-200 pt-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-brand-navy text-base font-bold">
          {esEdicion ? "Editar evaluación" : "Evaluación"}
        </h2>
        <p className="text-xs text-neutral-500">
          Todas las preguntas son opcionales. Contesta las que quieras.
        </p>
      </div>

      <SelectorEstrellas
        id="calificacion-plataforma"
        pregunta={PREGUNTA_PLATAFORMA}
        valor={plataforma}
        onChange={(n) => {
          setPlataforma(n);
          setError(null);
        }}
        disabled={isPending}
      />

      <SelectorEstrellas
        id="calificacion-atencion"
        pregunta={PREGUNTA_ATENCION}
        valor={atencion}
        onChange={(n) => {
          setAtencion(n);
          setError(null);
        }}
        disabled={isPending}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="comentarios" className="text-sm text-neutral-700">
          {PREGUNTA_COMENTARIOS}
        </label>
        <textarea
          id="comentarios"
          value={comentarios}
          onChange={(e) => {
            setComentarios(e.target.value.slice(0, 1000));
            setError(null);
          }}
          rows={4}
          maxLength={1000}
          placeholder="Escribe aquí tus comentarios"
          className="resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-200 focus:outline-none"
          disabled={isPending}
        />
        <span className="text-xs text-neutral-500">
          {comentarios.length} / 1000
        </span>
      </div>

      {error ? <p className="text-state-error text-sm">{error}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancelar ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelar}
            disabled={isPending}
            className="border-brand-navy text-brand-navy h-11 w-full rounded-full bg-transparent px-6 font-semibold sm:w-auto"
          >
            Cancelar
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={onGuardar}
          disabled={isPending}
          className="bg-brand-yellow hover:bg-brand-yellow-hover text-brand-navy h-11 w-full rounded-full px-6 font-semibold sm:w-auto"
        >
          {isPending ? "Guardando…" : esEdicion ? "Guardar cambios" : "Guardar"}
        </Button>
      </div>
    </section>
  );
}

function SelectorEstrellas({
  id,
  pregunta,
  valor,
  onChange,
  disabled,
}: {
  id: string;
  pregunta: string;
  valor: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-sm text-neutral-700">
        {pregunta}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-labelledby={id}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const activa = n <= (hover || valor);
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={valor === n}
                aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                onClick={() => onChange(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                disabled={disabled}
                className="rounded-full p-1 transition-colors hover:bg-amber-50"
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    activa
                      ? "fill-brand-yellow text-brand-yellow"
                      : "text-neutral-300",
                  )}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>
        {valor > 0 ? (
          <button
            type="button"
            onClick={() => onChange(0)}
            disabled={disabled}
            className="text-xs text-neutral-500 underline-offset-2 hover:underline"
          >
            Quitar calificación
          </button>
        ) : null}
      </div>
    </div>
  );
}

function EvaluacionMostrada({
  evaluacion,
  onEditar,
}: {
  evaluacion: EvaluacionPublica;
  onEditar: () => void;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-neutral-200 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-brand-navy text-base font-bold">
          Evaluación enviada
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={onEditar}
          className="border-brand-navy text-brand-navy h-9 rounded-full bg-transparent px-4 text-sm font-semibold"
        >
          <Pencil className="h-4 w-4" />
          Editar evaluación
        </Button>
      </div>
      <p className="text-sm text-neutral-600">
        Gracias por tomarte el tiempo de evaluar a tu broker. Recibimos tu
        respuesta:
      </p>

      {evaluacion.calificacion_plataforma !== null ? (
        <RespuestaEstrellas
          pregunta={PREGUNTA_PLATAFORMA}
          valor={evaluacion.calificacion_plataforma}
        />
      ) : null}
      {evaluacion.calificacion_atencion !== null ? (
        <RespuestaEstrellas
          pregunta={PREGUNTA_ATENCION}
          valor={evaluacion.calificacion_atencion}
        />
      ) : null}
      {evaluacion.calificacion_plataforma === null &&
      evaluacion.calificacion_atencion === null &&
      evaluacion.calificacion !== null ? (
        <Estrellas valor={evaluacion.calificacion} className="h-6 w-6" />
      ) : null}

      {evaluacion.comentarios ? (
        <blockquote className="border-l-4 border-amber-200 pl-3 text-sm text-neutral-700 italic">
          {evaluacion.comentarios}
        </blockquote>
      ) : null}
    </section>
  );
}

function RespuestaEstrellas({
  pregunta,
  valor,
}: {
  pregunta: string;
  valor: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-neutral-700">{pregunta}</span>
      <Estrellas valor={valor} className="h-6 w-6" />
    </div>
  );
}
