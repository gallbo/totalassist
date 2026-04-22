import { cn } from "@/lib/utils";

type Props = {
  current: number;
  total?: number;
  className?: string;
};

export function CasoStepper({ current, total = 8, className }: Props) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i + 1 <= current;
        return (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              active ? "bg-brand-navy" : "bg-neutral-200",
            )}
          />
        );
      })}
    </div>
  );
}
