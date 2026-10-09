import Link from "next/link";
import { MessageSquareHeart } from "lucide-react";
import {
  CalificacionGeneral,
  DesgloseEvaluacion,
} from "@/components/domain/calificacion-evaluacion";
import type { FeedbackComentario, FeedbackLista } from "@/lib/api/brokers";

type Props = {
  lista: FeedbackLista;
  pageActual: number;
};

export function EvaluacionesLista({ lista, pageActual }: Props) {
  if (lista.total === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl bg-blue-50/50 px-4 py-12 text-center">
        <MessageSquareHeart
          className="text-brand-navy/40 h-10 w-10"
          strokeWidth={1.5}
        />
        <div className="text-brand-navy text-sm font-semibold">
          Aún no recibes evaluaciones
        </div>
        <div className="max-w-sm text-xs text-neutral-600">
          Cuando tus clientes evalúen los casos compartidos, sus evaluaciones
          aparecerán aquí.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-neutral-200">
        {lista.data.map((c) => (
          <EvaluacionItem key={c.id} evaluacion={c} />
        ))}
      </ul>

      {lista.total_pages > 1 ? (
        <Paginacion
          pageActual={pageActual}
          totalPages={lista.total_pages}
          total={lista.total}
        />
      ) : null}
    </div>
  );
}

function EvaluacionItem({ evaluacion }: { evaluacion: FeedbackComentario }) {
  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-brand-navy text-sm font-semibold">
          {evaluacion.caso.nombre_asegurado_abreviado ?? "Cliente"}
        </span>
        <CalificacionGeneral valor={evaluacion.calificacion} />
        {evaluacion.caso.folio ? (
          <Link
            href={`/casos/${evaluacion.caso.id}`}
            className="text-xs text-neutral-500 hover:underline"
          >
            · {evaluacion.caso.folio}
          </Link>
        ) : null}
      </div>
      <DesgloseEvaluacion evaluacion={evaluacion} />
      {evaluacion.comentarios ? (
        <p className="text-sm text-neutral-600 italic">
          &ldquo;{evaluacion.comentarios}&rdquo;
        </p>
      ) : (
        <p className="text-xs text-neutral-400">Sin comentario adicional.</p>
      )}
    </li>
  );
}

function Paginacion({
  pageActual,
  totalPages,
  total,
}: {
  pageActual: number;
  totalPages: number;
  total: number;
}) {
  return (
    <nav className="flex items-center justify-between border-t border-neutral-200 pt-4 text-sm">
      <span className="text-xs text-neutral-500">
        {total} {total === 1 ? "evaluación" : "evaluaciones"} en total
      </span>
      <div className="flex items-center gap-2">
        {pageActual > 1 ? (
          <Link
            href={`/evaluaciones?page=${pageActual - 1}`}
            className="text-brand-navy rounded-md px-3 py-1 ring-1 ring-neutral-200 hover:bg-neutral-50"
          >
            Anterior
          </Link>
        ) : null}
        <span className="text-xs text-neutral-500">
          Página {pageActual} de {totalPages}
        </span>
        {pageActual < totalPages ? (
          <Link
            href={`/evaluaciones?page=${pageActual + 1}`}
            className="text-brand-navy rounded-md px-3 py-1 ring-1 ring-neutral-200 hover:bg-neutral-50"
          >
            Siguiente
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
