"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectInputOption = {
  value: string | number;
  label: string;
};

type SelectInputProps = {
  options: SelectInputOption[];
  placeholder?: string;
  value?: string | number | null;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
};

function SelectInput({
  options,
  placeholder = "Selecciona…",
  value,
  onValueChange,
  onBlur,
  invalid,
  disabled,
  name,
  className,
}: SelectInputProps) {
  const normalizedValue = value == null || value === "" ? null : String(value);

  const items = React.useMemo(
    () => options.map((o) => ({ value: String(o.value), label: o.label })),
    [options],
  );

  return (
    <BaseSelect.Root
      name={name}
      value={normalizedValue}
      onValueChange={(v) => onValueChange?.(v == null ? "" : String(v))}
      onOpenChange={(open) => {
        if (!open) onBlur?.();
      }}
      disabled={disabled}
      items={items}
    >
      <BaseSelect.Trigger
        aria-invalid={invalid || undefined}
        data-slot="select-input"
        className={cn(
          "text-brand-navy focus-visible:ring-brand-navy/30 aria-invalid:ring-destructive/40 aria-invalid:border-destructive/60 focus-visible:border-brand-navy/30 data-[popup-open]:ring-brand-navy/30 flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-transparent bg-neutral-200/90 px-4 py-2 text-left text-base shadow-[inset_0_1px_2px_rgba(15,31,60,0.08),0_1px_2px_rgba(15,31,60,0.06)] transition-colors outline-none focus-visible:bg-white focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 data-[popup-open]:bg-white data-[popup-open]:ring-3 md:text-sm",
          className,
        )}
      >
        <BaseSelect.Value
          placeholder={
            <span className="text-muted-foreground">{placeholder}</span>
          }
          className="min-w-0 flex-1 truncate"
        />
        <BaseSelect.Icon className="text-brand-navy/60 shrink-0 transition-transform duration-150 data-[popup-open]:rotate-180">
          <ChevronDown className="size-4" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          align="start"
          sideOffset={6}
          className="z-50 outline-none"
        >
          <BaseSelect.Popup
            className={cn(
              "max-h-72 min-w-[var(--anchor-width)] overflow-hidden rounded-2xl bg-white py-1 shadow-[0_20px_40px_-12px_rgba(15,31,60,0.18),0_4px_12px_rgba(15,31,60,0.08)] ring-1 ring-neutral-200/80 outline-none",
              "origin-[var(--transform-origin)] transition-[opacity,transform] duration-150",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
          >
            <BaseSelect.List className="max-h-72 overflow-y-auto py-1">
              {items.map((o) => (
                <BaseSelect.Item
                  key={o.value}
                  value={o.value}
                  className={cn(
                    "text-brand-navy/80 flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors outline-none",
                    "data-[highlighted]:bg-brand-navy/5 data-[highlighted]:text-brand-navy",
                    "data-[selected]:bg-brand-navy/[0.06] data-[selected]:text-brand-navy data-[selected]:font-semibold",
                    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
                  )}
                >
                  <span className="text-brand-navy flex size-4 shrink-0 items-center justify-center">
                    <BaseSelect.ItemIndicator>
                      <Check className="size-4" />
                    </BaseSelect.ItemIndicator>
                  </span>
                  <BaseSelect.ItemText className="truncate">
                    {o.label}
                  </BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

export { SelectInput };
