import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type BrandButtonProps = ComponentProps<typeof Button> & {
  tone?: "primary" | "secondary";
};

export function BrandButton({
  tone = "primary",
  className,
  ...props
}: BrandButtonProps) {
  return (
    <Button
      {...props}
      className={cn(
        "h-11 rounded-full px-8 text-sm font-semibold shadow-sm transition-colors",
        tone === "primary" &&
          "bg-brand-yellow text-brand-navy hover:bg-brand-yellow-hover",
        tone === "secondary" &&
          "bg-brand-navy hover:bg-brand-navy-hover text-white",
        className,
      )}
    />
  );
}
