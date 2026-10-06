"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal de confirmacion accesible basado en `<dialog>` HTML5.
 *
 * Ventajas vs `window.confirm()`:
 *   - Diseño consistente (los alerts nativos varian por navegador).
 *   - Podemos poner foco inicial en el boton "Cancelar" — asi si Manuel
 *     presiona Enter por accidente no ejecuta la accion destructiva.
 *   - `<dialog>.showModal()` maneja focus trap y Escape para cerrar de
 *     forma nativa (implementado por el navegador; VoiceOver lo trata
 *     como dialog nativo con landmark aria).
 *   - aria-labelledby + aria-describedby dan contexto claro al lector.
 *
 * Uso: setea `open=true` y provee `onConfirm` y `onCancel`. El dialog
 * cierra automatico al confirmar/cancelar.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // Enfocar el boton de cancelar por seguridad — Enter no dispara
      // la accion destructiva por accidente.
      cancelBtnRef.current?.focus();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      onCancel={onCancel}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      // Reset del estilo default de <dialog> (que Firefox/Safari pintan
      // con marco propio) y aplicamos el look de la app.
      className="m-auto w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          {destructive ? (
            <div
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100"
            >
              <AlertTriangle className="h-4 w-4 text-red-700" />
            </div>
          ) : null}
          <div className="flex flex-col gap-1">
            <h2
              id="confirm-title"
              className="text-brand-navy text-base font-bold"
            >
              {title}
            </h2>
            <p id="confirm-desc" className="text-sm text-neutral-600">
              {description}
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold text-white",
              destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-brand-navy hover:bg-brand-navy/90",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
