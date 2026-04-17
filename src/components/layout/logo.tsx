import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "full" | "compact" | "shield";
  className?: string;
};

function Shield({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M32 2 L60 12 V38 C60 52 48 64 32 70 C16 64 4 52 4 38 V12 Z"
        fill="#0f1f3c"
      />
      <path d="M32 2 L60 12 V38 C60 52 48 64 32 70 Z" fill="#f5c800" />
      <path d="M22 30 L32 22 L42 30 L38 38 L32 34 L26 38 Z" fill="#ffffff" />
    </svg>
  );
}

export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "shield") {
    return <Shield className={cn("h-10 w-auto", className)} />;
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Shield className="h-7 w-auto" />
        <span className="text-brand-navy text-sm font-bold tracking-tight">
          TOTAL ASSIST
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Shield className="h-9 w-auto shrink-0" />
      <div className="flex flex-col leading-none">
        <span className="text-brand-navy text-lg font-bold tracking-tight">
          TOTAL ASSIST
        </span>
        <span className="text-brand-navy/70 mt-0.5 text-[9px] font-medium tracking-[0.15em]">
          INSURANCE CLAIM BY SKIPPER
        </span>
      </div>
    </div>
  );
}
