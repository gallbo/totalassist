import Link from "next/link";
import { ChevronRight, MessageSquareHeart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  promedio: number;
  total: number;
};

export function FeedbackClientesCard({ promedio, total }: Props) {
  const promedioRedondeado = Math.round(promedio);

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
      <h2 className="text-brand-navy text-base font-bold">Comentarios</h2>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-blue-50/50 px-4 py-6 text-center">
          <MessageSquareHeart
            className="text-brand-navy/40 h-8 w-8"
            strokeWidth={1.5}
          />
          <div className="text-brand-navy text-sm font-semibold">
            Aún no recibes evaluaciones
          </div>
          <div className="max-w-xs text-xs text-neutral-600">
            Cuando tus clientes evalúen los casos compartidos, verás aquí su
            calificación promedio.
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={cn(
                  "h-7 w-7",
                  n <= promedioRedondeado
                    ? "fill-brand-yellow text-brand-yellow"
                    : "text-neutral-300",
                )}
                strokeWidth={1.5}
              />
            ))}
            <span className="text-brand-navy ml-3 text-sm font-semibold tabular-nums">
              {promedio.toFixed(1)}
            </span>
            <span className="text-xs text-neutral-500">
              ({total} {total === 1 ? "comentario" : "comentarios"})
            </span>
          </div>
          <Link
            href="/comentarios"
            className="text-brand-navy inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            Ver comentarios
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
