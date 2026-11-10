import { Check, Circle } from "lucide-react";
import { REQUISITOS_PASSWORD } from "@/lib/schemas/auth";
import { cn } from "@/lib/utils";

export function RequisitosPassword({
  valor,
  className,
}: {
  valor: string;
  className?: string;
}) {
  return (
    <ul className={cn("mt-1 space-y-1 text-xs", className)} aria-live="polite">
      {REQUISITOS_PASSWORD.map(({ texto, cumple }) => {
        const ok = cumple(valor);
        return (
          <li
            key={texto}
            className={cn(
              "flex items-center gap-1.5",
              ok ? "text-state-success" : "text-neutral-500",
            )}
          >
            {ok ? (
              <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>
              {texto}
              <span className="sr-only">
                {ok ? " (cumplido)" : " (pendiente)"}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
