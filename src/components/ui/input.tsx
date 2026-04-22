"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  inputMode,
  autoComplete = "new-password",
  onFocus,
  ...props
}: React.ComponentProps<"input">) {
  const resolvedType = type === "email" ? "text" : type;
  const resolvedInputMode =
    inputMode ?? (type === "email" ? "email" : undefined);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.currentTarget.hasAttribute("readonly")) {
      e.currentTarget.removeAttribute("readonly");
    }
    onFocus?.(e);
  };

  return (
    <InputPrimitive
      type={resolvedType}
      inputMode={resolvedInputMode}
      autoComplete={autoComplete}
      readOnly
      onFocus={handleFocus}
      data-slot="input"
      data-form-type="other"
      data-lpignore="true"
      data-1p-ignore
      className={cn(
        "text-brand-navy placeholder:text-muted-foreground focus-visible:ring-brand-navy/30 aria-invalid:ring-destructive/40 aria-invalid:border-destructive/60 focus-visible:border-brand-navy/30 h-11 w-full min-w-0 rounded-xl border border-transparent bg-neutral-200/90 px-4 py-2 text-base shadow-[inset_0_1px_2px_rgba(15,31,60,0.08),0_1px_2px_rgba(15,31,60,0.06)] transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:bg-white focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
