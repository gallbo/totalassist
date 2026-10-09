import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  valor: number;
  className?: string;
};

export function Estrellas({ valor, className = "h-5 w-5" }: Props) {
  const redondeado = Math.round(valor * 2) / 2;

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${redondeado} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const relleno = redondeado >= n ? 1 : redondeado >= n - 0.5 ? 0.5 : 0;
        return (
          <span key={n} className="relative inline-flex">
            <Star
              className={cn(className, "text-neutral-300")}
              strokeWidth={1.5}
            />
            {relleno > 0 ? (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${relleno * 100}%` }}
              >
                <Star
                  className={cn(
                    className,
                    "fill-brand-yellow text-brand-yellow",
                  )}
                  strokeWidth={1.5}
                />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
