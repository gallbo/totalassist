"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MoneyInputProps = {
  value: number | string | null | undefined;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  placeholder?: string;
};

function MoneyInput({
  value,
  onChange,
  onBlur,
  name,
  disabled,
  invalid,
  className,
  placeholder = "0",
}: MoneyInputProps) {
  const [display, setDisplay] = React.useState(() => formatDisplay(value));
  const lastEmitted = React.useRef<number | null>(parseNumber(value));

  React.useEffect(() => {
    const numeric = parseNumber(value);
    if (numeric !== lastEmitted.current) {
      lastEmitted.current = numeric;
      setDisplay(formatDisplay(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    const integer = parts[0] ?? "";
    const decimal =
      parts.length > 1 ? parts.slice(1).join("").slice(0, 2) : null;
    const numericString = decimal !== null ? `${integer}.${decimal}` : integer;

    const integerFormatted =
      integer === "" ? "" : Number(integer).toLocaleString("es-MX");
    const formatted =
      decimal !== null ? `${integerFormatted}.${decimal}` : integerFormatted;

    setDisplay(formatted);

    if (numericString === "" || numericString === ".") {
      lastEmitted.current = null;
      onChange(null);
      return;
    }
    const numeric = Number(numericString);
    if (Number.isFinite(numeric)) {
      lastEmitted.current = numeric;
      onChange(numeric);
    }
  };

  return (
    <div className="relative w-full">
      <span
        className="text-brand-navy/60 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base md:text-sm"
        aria-hidden
      >
        $
      </span>
      <Input
        type="text"
        inputMode="decimal"
        name={name}
        value={display}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        placeholder={placeholder}
        className={cn("pl-7", className)}
      />
    </div>
  );
}

function parseNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : null;
}

function formatDisplay(value: number | string | null | undefined): string {
  const n = parseNumber(value);
  if (n == null) return "";
  return n.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

export { MoneyInput };
