import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  urlWhatsappComercial,
  type TemaWhatsapp,
} from "@/lib/whatsapp-comercial";

/**
 * Botón "Solicita información" → WhatsApp de comercial con un mensaje
 * precargado según el tema. Mismo estilo que el de totalassist-site.
 */
export function BotonSolicitaInfo({
  tema,
  claro = false,
  className,
}: {
  tema: TemaWhatsapp;
  /** true = sobre fondo azul marino (solo cambia el estado deshabilitado). */
  claro?: boolean;
  className?: string;
}) {
  const url = urlWhatsappComercial(tema);
  if (!url) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          "inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold",
          claro
            ? "bg-white/20 text-white/80"
            : "bg-neutral-200 text-neutral-500",
          className,
        )}
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        WhatsApp disponible muy pronto
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Solicita información por WhatsApp (se abre en otra pestaña)"
      className={cn(
        "bg-brand-yellow hover:bg-brand-yellow-hover text-brand-navy inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-colors",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      Solicita información
    </a>
  );
}
