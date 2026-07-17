import { cn } from "@/lib/utils";

// Marca visual de obligatorio (amarillo) / opcional (azul) usada en los headers
// del acordeón de registro de caso, su leyenda y cada pregunta del cuestionario.
export function IndicadorRequerido({
  obligatorio,
  size = "md",
  className,
}: {
  obligatorio: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={obligatorio ? "Obligatorio" : "Opcional"}
      title={obligatorio ? "Obligatorio" : "Opcional"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full leading-none font-bold",
        size === "sm" ? "h-4 w-4 text-[10px]" : "h-5 w-5 text-xs",
        obligatorio
          ? "bg-brand-yellow text-brand-navy"
          : "bg-state-info text-white",
        className,
      )}
    >
      !
    </span>
  );
}

// Leyenda "Obligatorio / Opcional" que encabeza el formulario de registro.
export function LeyendaRequerido({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-5 text-sm text-neutral-600",
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        <IndicadorRequerido obligatorio />
        Obligatorio
      </span>
      <span className="flex items-center gap-1.5">
        <IndicadorRequerido obligatorio={false} />
        Opcional
      </span>
    </div>
  );
}
