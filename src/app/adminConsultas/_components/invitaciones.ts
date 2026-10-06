/**
 * Mensajes predefinidos que Manuel puede mandar al hilo desde "Acciones".
 * Portados del submenu de Connect (MensajeController@sendInvitationMsg);
 * "calificar app" ahora apunta a la pagina de TotalAssist en Facebook.
 */
export type TipoInvitacion = "whatsapp" | "facebook" | "google";

/**
 * Invitaciones que se muestran como boton. Google queda oculta mientras el
 * cliente define el enlace de reseñas; para activarla, agregarla a esta lista.
 */
export const INVITACIONES_ACTIVAS: TipoInvitacion[] = ["whatsapp", "facebook"];

export const INVITACIONES: Record<
  TipoInvitacion,
  { boton: string; confirmTitulo: string; texto: string }
> = {
  whatsapp: {
    boton: "Enviar grupo de WhatsApp",
    confirmTitulo: "¿Enviar invitación al grupo de WhatsApp?",
    texto:
      "¡Únete a nuestro grupo de WhatsApp!\n" +
      "Recibe notificaciones sobre las próximas conferencias.\n" +
      "Haz clic en el siguiente enlace: https://chat.whatsapp.com/DPvnV47seFgJwaCR5Jn5Jj",
  },
  facebook: {
    boton: "Invitar a calificar TotalAssist",
    confirmTitulo: "¿Enviar invitación a calificar TotalAssist en Facebook?",
    texto:
      "¡Tu opinión es importante para nosotros!\n" +
      "Cuéntale a otros clientes sobre tu experiencia con Total Assist.\n" +
      "Deja tu comentario en el siguiente enlace: https://www.facebook.com/profile.php?id=61588669220194&sk=reviews",
  },
  google: {
    boton: "Enviar invitación a calificar a Gallbo en Google",
    confirmTitulo: "¿Enviar invitación a calificar a Gallbo en Google?",
    texto:
      "¡Tu opinión es importante para nosotros!\n" +
      "Cuéntale a otros clientes sobre tu experiencia con Gallbo.\n" +
      "Deja tu comentario en el siguiente enlace: https://bit.ly/3goZ5ru",
  },
};
