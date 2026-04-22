"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { BrandButton } from "@/components/ui/brand-button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function EvaluacionSection() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");

  const guardar = () => {
    if (rating === 0) {
      toast.error("Selecciona una calificación");
      return;
    }
    toast.success("Evaluación guardada");
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-brand-navy text-base font-bold">Evaluación</h2>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-neutral-600">
          Califica tu experiencia
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const n = i + 1;
            const active = (hover || rating) >= n;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="p-1"
                aria-label={`${n} estrellas`}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    active
                      ? "fill-brand-yellow text-brand-yellow"
                      : "text-brand-yellow",
                  )}
                  strokeWidth={1.75}
                />
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-neutral-600">
          Comentarios y sugerencias
        </span>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          className="text-brand-navy border-brand-navy/30 focus-visible:ring-brand-navy/30 min-h-24 w-full rounded-xl border bg-transparent px-4 py-2 text-sm outline-none focus-visible:ring-3"
        />
      </label>

      <div className="flex justify-end">
        <BrandButton type="button" onClick={guardar}>
          Guardar
        </BrandButton>
      </div>
    </section>
  );
}
