import { cn } from "@/lib/utils";

// Marca visual de obligatorio — asterisco rojo. Los opcionales no muestran
// nada. Alicia (jul-2026): "se retiran también todos los signos amarillos
// y azules y a la sección se agrega un *". Antes eran círculos amarillos
// (obligatorio) / azules (opcional) con "!"; ahora se simplifica al patrón
// clásico y universalmente entendido.
//
// El componente sigue aceptando `obligatorio={false}` para que los llamadores
// no tengan que envolver en un condicional — simplemente no renderiza nada.
export function IndicadorRequerido({
  obligatorio,
  size = "md",
  className,
}: {
  obligatorio: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!obligatorio) return null;
  return (
    <span
      aria-label="Obligatorio"
      title="Obligatorio"
      className={cn(
        "inline-flex shrink-0 items-center leading-none font-bold text-red-600",
        size === "sm" ? "text-sm" : "text-base",
        className,
      )}
    >
      *
    </span>
  );
}

// Leyenda "Obligatorio / Opcional" — obsoleta con el patrón de asterisco.
// Se mantiene exportada para compatibilidad pero renderiza nada; los
// callers deben ir removiendo su uso.
export function LeyendaRequerido(_: { className?: string }) {
  return null;
}
