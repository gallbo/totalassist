import Link from "next/link";
import { MessageSquareHeart, Star } from "lucide-react";
import type { FeedbackComentario, FeedbackLista } from "@/lib/api/brokers";
import { cn } from "@/lib/utils";

type Props = {
  lista: FeedbackLista;
  pageActual: number;
};

export function ComentariosLista({ lista, pageActual }: Props) {
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
          Cuando tus clientes evalúen los casos compartidos, sus comentarios
          aparecerán aquí.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-neutral-200">
        {lista.data.map((c) => (
          <ComentarioItem key={c.id} comentario={c} />
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

function ComentarioItem({ comentario }: { comentario: FeedbackComentario }) {
  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-brand-navy text-sm font-semibold">
          {comentario.caso.nombre_asegurado_abreviado ?? "Cliente"}
        </span>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={cn(
                "h-4 w-4",
                n <= comentario.calificacion
                  ? "fill-brand-yellow text-brand-yellow"
                  : "text-neutral-300",
              )}
              strokeWidth={1.5}
            />
          ))}
        </div>
        {comentario.caso.folio ? (
          <span className="text-xs text-neutral-500">
            · {comentario.caso.folio}
          </span>
        ) : null}
      </div>
      {comentario.comentarios ? (
        <p className="text-sm text-neutral-600 italic">
          &ldquo;{comentario.comentarios}&rdquo;
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
        {total} {total === 1 ? "comentario" : "comentarios"} en total
      </span>
      <div className="flex items-center gap-2">
        {pageActual > 1 ? (
          <Link
            href={`/comentarios?page=${pageActual - 1}`}
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
            href={`/comentarios?page=${pageActual + 1}`}
            className="text-brand-navy rounded-md px-3 py-1 ring-1 ring-neutral-200 hover:bg-neutral-50"
          >
            Siguiente
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
