"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props<T extends string> = {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  className?: string;
};

export function DropdownPill<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bg-brand-yellow text-brand-navy hover:bg-brand-yellow-hover inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold"
      >
        {value ?? label}
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-20 mt-2 min-w-[200px] rounded-xl bg-blue-50 py-2 shadow-lg ring-1 ring-neutral-200">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-5 py-2 text-left text-sm",
                value === opt
                  ? "text-brand-navy font-semibold"
                  : "text-brand-navy/80 hover:text-brand-navy",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
