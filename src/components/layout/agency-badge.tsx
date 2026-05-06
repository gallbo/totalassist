import Image from "next/image";
import { cn } from "@/lib/utils";

type AgencyBadgeProps = {
  name?: string;
  logoUrl?: string | null;
  className?: string;
};

export function AgencyBadge({
  name = "Broker",
  logoUrl,
  className,
}: AgencyBadgeProps) {
  if (logoUrl) {
    return (
      <div
        className={cn(
          "relative h-10 w-10 overflow-hidden rounded-full border border-neutral-200 bg-white",
          className,
        )}
        aria-label={name}
        title={name}
      >
        <Image
          src={logoUrl}
          alt={name}
          fill
          unoptimized
          className="object-cover"
          sizes="40px"
        />
      </div>
    );
  }

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
