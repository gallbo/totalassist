import Image from "next/image";

import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "full" | "compact" | "shield";
  className?: string;
  priority?: boolean;
};

export function Logo({ variant = "full", className, priority }: LogoProps) {
  if (variant === "shield") {
    return (
      <Image
        src="/brand/totalassist-shield.png"
        alt="Total Assist"
        width={128}
        height={144}
        priority={priority}
        className={cn("h-10 w-auto", className)}
      />
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Image
          src="/brand/totalassist-shield.png"
          alt="Total Assist"
          width={64}
          height={72}
          priority={priority}
          className="h-7 w-auto"
        />
        <span className="text-brand-navy text-sm font-bold tracking-tight">
          TOTAL ASSIST
        </span>
      </div>
    );
  }

  return (
    <Image
      src="/brand/totalassist-full.png"
      alt="Total Assist — Insurance Claim"
      width={904}
      height={360}
      priority={priority}
      className={cn("h-16 w-auto", className)}
    />
  );
}
