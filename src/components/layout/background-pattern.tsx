import { cn } from "@/lib/utils";

export function BackgroundPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 opacity-[0.08]",
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><g fill='none' stroke='%230f1f3c' stroke-width='1.5' stroke-linecap='round'><path d='M20 14 v12'/><path d='M14 20 h12'/></g></svg>")`,
        backgroundRepeat: "repeat",
        backgroundSize: "40px 40px",
      }}
    />
  );
}
