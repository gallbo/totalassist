"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

type TooltipProps = {
  children: React.ReactElement;
  label: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
};

function Tooltip({
  children,
  label,
  side = "top",
  sideOffset = 6,
  className,
}: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          side={side}
          sideOffset={sideOffset}
          className="z-[60] outline-none"
        >
          <BaseTooltip.Popup
            className={cn(
              "bg-brand-navy rounded-md px-2.5 py-1.5 text-xs font-medium text-white shadow-md",
              "origin-[var(--transform-origin)] transition-[opacity,transform] duration-150",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
              className,
            )}
          >
            {label}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

export { Tooltip };
