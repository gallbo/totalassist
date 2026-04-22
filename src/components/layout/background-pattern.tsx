import { cn } from "@/lib/utils";

type Variant = "auth" | "subtle" | "corner" | "full";

const MASKS: Record<Variant, string | null> = {
  auth: [
    "radial-gradient(ellipse 60% 55% at 100% 0%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
    "radial-gradient(ellipse 110% 45% at 55% 100%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 65%, transparent 100%)",
    "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2))",
  ].join(", "),
  subtle: "linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18))",
  corner:
    "radial-gradient(ellipse 70% 70% at 100% 0%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
  full: null,
};

type Props = {
  variant?: Variant;
  className?: string;
};

export function BackgroundPattern({ variant = "auth", className }: Props) {
  const mask = MASKS[variant];

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: "url('/brand/stars-tile.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "190px 190px",
        ...(mask
          ? {
              maskImage: mask,
              WebkitMaskImage: mask,
              maskComposite: "add",
              WebkitMaskComposite: "source-over",
            }
          : {}),
      }}
    />
  );
}
