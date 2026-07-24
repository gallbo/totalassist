"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvaluacionPublica } from "@/lib/api/publico";
import { enviarEvaluacionAction } from "../_actions";

type Props = {
  token: string;
  evaluacionInicial: EvaluacionPublica | null;
};

export function Evaluacion({ token, evaluacionInicial }: Props) {
  const [evaluacion, setEvaluacion] = useState(evaluacionInicial);
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentarios, setComentarios] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (evaluacion) {
    return <EvaluacionMostrada evaluacion={evaluacion} />;
  }

  const onGuardar = () => {
    if (calificacion < 1 || calificacion > 5) {
      setError("Selecciona entre 1 y 5 estrellas para enviar tu evaluación.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await enviarEvaluacionAction(token, {
        calificacion,
        comentarios: comentarios.trim() || undefined,
      });
      if (result.ok) {
        setEvaluacion(result.data);
        toast.success("¡Gracias por tu evaluación!");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <section className="flex flex-col gap-4 border-t border-neutral-200 pt-6">
      <h2 className="text-brand-navy text-base font-bold">Evaluación</h2>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-neutral-700">
          Califica tu experiencia
        </span>
        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label="Calificación"
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const activa = n <= (hover || calificacion);
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={calificacion === n}
                aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                onClick={() => setCalificacion(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
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
        {error ? <p className="text-state-error text-xs">{error}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="comentarios" className="text-sm text-neutral-700">
          Comentarios y sugerencias
        </label>
        <textarea
          id="comentarios"
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value.slice(0, 1000))}
          rows={4}
          maxLength={1000}
          placeholder="Cuéntanos cómo fue tu experiencia (opcional)"
          className="resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-amber-200 focus:outline-none"
          disabled={isPending}
        />
        <span className="text-xs text-neutral-500">
          {comentarios.length} / 1000
        </span>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onGuardar}
          disabled={isPending}
          className="bg-brand-yellow hover:bg-brand-yellow-hover text-brand-navy h-11 rounded-full px-6 font-semibold"
        >
          {isPending ? "Enviando…" : "Guardar"}
        </Button>
      </div>
    </section>
  );
}

function EvaluacionMostrada({ evaluacion }: { evaluacion: EvaluacionPublica }) {
  return (
    <section className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
      <h2 className="text-brand-navy text-base font-bold">
        Evaluación enviada
      </h2>
      <p className="text-sm text-neutral-600">
        Gracias por tomarte el tiempo de evaluar a tu broker. Recibimos tu
        respuesta:
      </p>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              "h-6 w-6",
              n <= evaluacion.calificacion
                ? "fill-brand-yellow text-brand-yellow"
                : "text-neutral-300",
            )}
            strokeWidth={1.5}
          />
        ))}
      </div>

      {evaluacion.comentarios ? (
        <blockquote className="border-l-4 border-amber-200 pl-3 text-sm text-neutral-700 italic">
          {evaluacion.comentarios}
        </blockquote>
      ) : null}
    </section>
  );
}
