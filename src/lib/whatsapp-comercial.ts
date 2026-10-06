/**
 * WhatsApp de comercial para los botones "Solicita información" del portal
 * del broker (Defensa Legal, Conferencias, rechazo previo en Nuevo caso).
 * Juan, oct-2026.
 *
 * Número en formato internacional sin "+" ni espacios. Es el mismo del botón
 * "Solicita información" de la sección #servicios de totalassist-site
 * (siteConfig.whatsappUrl). Si se deja vacío, los botones se muestran
 * deshabilitados como "disponible muy pronto".
 */
export const WHATSAPP_COMERCIAL = "525561455557";

/** Mensajes precargados según la sección desde la que escribe el broker. */
export const MENSAJES_WHATSAPP = {
  defensaLegal:
    "Hola, soy agente de seguros y me interesa la defensa legal de Total Assist.",
  conferencias:
    "Hola, soy agente de seguros y me interesa información sobre las conferencias y capacitaciones de Total Assist.",
  rechazoPrevio:
    "Hola, soy agente de seguros. Mi cliente ya tiene un rechazo de la aseguradora y me interesa conocer los servicios de Segunda Opinión y Reclamación Judicial de GALLBO.",
} as const;

export type TemaWhatsapp = keyof typeof MENSAJES_WHATSAPP;

/** URL de WhatsApp con mensaje precargado, o null si aún no hay número. */
export function urlWhatsappComercial(tema: TemaWhatsapp): string | null {
  if (!WHATSAPP_COMERCIAL) return null;
  return `https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent(MENSAJES_WHATSAPP[tema])}`;
}
