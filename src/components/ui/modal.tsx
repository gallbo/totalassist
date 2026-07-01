"use client";

import * as React from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl bg-white text-neutral-900 shadow-2xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-5">
          <h2 className="text-brand-navy text-lg font-bold">{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="hover:text-brand-navy -mr-1 shrink-0 text-neutral-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 text-sm leading-relaxed text-neutral-600">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-neutral-200 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
