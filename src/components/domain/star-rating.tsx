import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({ value, max = 5, size = "md", className }: Props) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label={`${value} de ${max} estrellas`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        return (
          <Star
            key={i}
            className={cn(
              SIZES[size],
              filled
                ? "fill-brand-yellow text-brand-yellow"
                : "text-brand-yellow",
            )}
            strokeWidth={1.75}
          />
        );
      })}
    </div>
  );
}
