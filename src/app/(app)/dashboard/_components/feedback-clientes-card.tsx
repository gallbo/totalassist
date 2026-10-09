import Link from "next/link";
import { ChevronRight, MessageSquareHeart } from "lucide-react";
import { Estrellas } from "@/components/domain/estrellas";

type Props = {
  promedio: number;
  total: number;
};

export function FeedbackClientesCard({ promedio, total }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
      <h2 className="text-brand-navy text-base font-bold">Evaluaciones</h2>

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
            <Estrellas valor={promedio} className="h-7 w-7" />
            <span className="text-brand-navy ml-3 text-sm font-semibold tabular-nums">
              {promedio.toFixed(1)}
            </span>
            <span className="text-xs text-neutral-500">
              ({total} {total === 1 ? "evaluación" : "evaluaciones"})
            </span>
          </div>
          <Link
            href="/evaluaciones"
            className="text-brand-navy inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            Ver evaluaciones
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
