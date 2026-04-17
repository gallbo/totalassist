import { cn } from "@/lib/utils";

type AgencyBadgeProps = {
  name?: string;
  className?: string;
};

export function AgencyBadge({
  name = "Espinosa de los Monteros",
  className,
}: AgencyBadgeProps) {
  return (
    <div
      className={cn(
        "text-brand-navy flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-[9px] leading-tight font-semibold",
        className,
      )}
      aria-label={name}
      title={name}
    >
      {name
        .split(" ")
        .slice(0, 3)
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase()}
    </div>
  );
}
