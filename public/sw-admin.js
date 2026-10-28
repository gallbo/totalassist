/*
 * Service worker de la app de Consultas del admin (scope /adminConsultas/).
 *
 * Solo recibe notificaciones push que manda Skipper (consulta nueva o mensaje
 * del broker) y, al tocarlas, abre la consulta en la app instalada. No hace
 * cache ni intercepta peticiones: la app funciona igual que sin él.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { cuerpo: event.data ? event.data.text() : "" };
  }

  const titulo = datos.titulo || "TotalAssist";
  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: datos.cuerpo || "Tienes una novedad en Consultas.",
      tag: datos.tag || undefined,
      renotify: Boolean(datos.tag),
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: datos.url || "/adminConsultas" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = new URL(
    (event.notification.data && event.notification.data.url) || "/adminConsultas",
    self.location.origin,
  ).href;

  event.waitUntil(
    (async () => {
      const ventanas = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const ventana of ventanas) {
        if ("focus" in ventana) {
          if ("navigate" in ventana && ventana.url !== destino) {
            await ventana.navigate(destino);
          }
          return ventana.focus();
        }
      }
      return self.clients.openWindow(destino);
    })(),
  );
});
