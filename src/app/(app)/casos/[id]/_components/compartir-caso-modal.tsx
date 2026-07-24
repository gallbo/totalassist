"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Mail, RefreshCw, Share2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip } from "@/components/ui/tooltip";
import { formatearFechaLarga } from "@/lib/fecha";
import { compartirCasoAction } from "../_actions";

type Props = {
  casoId: number;
  correoCliente: string | null;
  /**
   * Trigger opcional. Cuando se pasa se usa ese elemento como el botón
   * que abre el sheet; si no, se muestra el botón "compartir" por default
   * (icono redondo con Share2) que ya usaba la vista de detalle del caso.
   * Útil para reusar el modal desde el dashboard con un botón custom.
   */
  trigger?: React.ReactElement;
};

export function CompartirCasoModal({ casoId, correoCliente, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copiado, setCopiado] = useState(false);

  const generar = (regenerar: boolean) => {
    startTransition(async () => {
      const result = await compartirCasoAction(casoId, { regenerar });
      if (result.ok) {
        setUrl(result.data.url);
        setExpiresAt(result.data.expires_at);
        if (regenerar) {
          toast.success(
            "Generamos un enlace nuevo. El anterior ya no funciona.",
          );
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  const enviarCorreo = () => {
    if (!correoCliente) return;
    startTransition(async () => {
      const result = await compartirCasoAction(casoId, { enviar_correo: true });
      if (result.ok) {
        setUrl(result.data.url);
        setExpiresAt(result.data.expires_at);
        if (result.data.correo_enviado) {
          toast.success(`Enviamos el enlace a ${correoCliente}.`);
        } else {
          toast.error(
            "No pudimos enviar el correo. Copia el enlace y compártelo manualmente.",
          );
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && !url) {
      generar(false);
    }
    if (!next) {
      setCopiado(false);
    }
  };

  const copiar = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      toast.success("Enlace copiado.");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error(
        "No pudimos copiar el enlace. Selecciónalo y cópialo manualmente.",
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        // Trigger custom (ej. desde "Más recientes" del dashboard) —
        // se muestra tal cual sin envolverlo en Tooltip para que el
        // caller controle su estilo/aria por completo.
        <SheetTrigger render={trigger} />
      ) : (
        <Tooltip label="Compartir con cliente">
          <SheetTrigger
            render={
              <Button
                variant="outline"
                aria-label="Compartir con cliente"
                className="text-brand-navy inline-flex size-9 items-center justify-center rounded-full bg-white p-0 ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            }
          />
        </Tooltip>
      )}
      <SheetContent side="right" className="w-[380px] sm:w-[440px]">
        <SheetHeader className="border-b border-neutral-200 text-left">
          <SheetTitle className="text-brand-navy text-base font-bold">
            Compartir con cliente
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 px-4 py-5">
          <p className="text-sm text-neutral-600">
            Comparte esta liga con tu cliente para que pueda consultar el avance
            del caso. La liga es de solo lectura: tu cliente no podrá modificar
            nada.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-500" htmlFor="url-publica">
              Enlace
            </label>
            <div className="flex gap-2">
              <Input
                id="url-publica"
                value={url ?? ""}
                readOnly
                placeholder={isPending ? "Generando…" : ""}
                onFocus={(e) => e.currentTarget.select()}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                onClick={copiar}
                disabled={!url || isPending}
                aria-label="Copiar enlace"
                className="shrink-0"
              >
                {copiado ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {expiresAt ? (
              <p className="text-xs text-neutral-500">
                Disponible hasta el {formatearFechaLarga(expiresAt)}.
              </p>
            ) : url ? (
              <p className="text-xs text-neutral-500">
                Este enlace seguirá disponible mientras el caso esté abierto.
              </p>
            ) : null}
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <Button
              type="button"
              onClick={enviarCorreo}
              disabled={!correoCliente || !url || isPending}
              title={
                !correoCliente
                  ? "Este caso no tiene correo cargado. Edítalo para poder enviar el enlace."
                  : undefined
              }
              className="bg-brand-yellow hover:bg-brand-yellow-hover text-brand-navy w-full font-semibold"
            >
              <Mail className="mr-2 h-4 w-4" />
              Enviar al cliente
            </Button>
            {correoCliente ? (
              <p className="mt-2 text-xs text-neutral-500">
                Lo enviaremos a {correoCliente}.
              </p>
            ) : (
              <p className="mt-2 text-xs text-neutral-500">
                Este caso no tiene correo cargado. Edítalo si quieres enviarlo
                desde aquí, o copia el enlace y compártelo por WhatsApp.
              </p>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (
                  confirm(
                    "Esto invalida el enlace anterior. ¿Quieres generar uno nuevo?",
                  )
                ) {
                  generar(true);
                }
              }}
              disabled={isPending}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar enlace
            </Button>
            <p className="mt-2 text-xs text-neutral-500">
              Úsalo si compartiste el enlace por error con la persona
              equivocada.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
