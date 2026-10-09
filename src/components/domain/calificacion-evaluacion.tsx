import { Estrellas } from "@/components/domain/estrellas";

type Evaluacion = {
  calificacion: number | null;
  calificacion_plataforma: number | null;
  calificacion_atencion: number | null;
};

export function formatearCalificacion(valor: number) {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

export function CalificacionGeneral({
  valor,
  className = "h-4 w-4",
}: {
  valor: number | null;
  className?: string;
}) {
  if (valor === null) {
    return <span className="text-xs text-neutral-500">Sin calificación</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <Estrellas valor={valor} className={className} />
      <span className="text-brand-navy text-xs font-semibold tabular-nums">
        {formatearCalificacion(valor)}
      </span>
    </div>
  );
}

export function DesgloseEvaluacion({ evaluacion }: { evaluacion: Evaluacion }) {
  const partes = [
    { etiqueta: "Plataforma", valor: evaluacion.calificacion_plataforma },
    { etiqueta: "Atención", valor: evaluacion.calificacion_atencion },
  ].filter((p): p is { etiqueta: string; valor: number } => p.valor !== null);

  if (partes.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
      {partes.map((p) => (
        <span key={p.etiqueta} className="inline-flex items-center gap-1.5">
          {p.etiqueta}
          <Estrellas valor={p.valor} className="h-3.5 w-3.5" />
        </span>
      ))}
    </div>
  );
}
