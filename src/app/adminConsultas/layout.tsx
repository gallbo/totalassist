import type { Metadata } from "next";

/**
 * Layout raiz de /adminConsultas.
 *
 * Passthrough para el contenido — el chrome (header/footer) y el guard
 * de sesion viven en `(app)/layout.tsx`, y el login en `login/layout.tsx`.
 *
 * Aqui aprovechamos para sobreescribir el manifest PWA: cuando Manuel
 * instala la app desde el splash de /adminConsultas queremos que abra
 * directo en el panel, no en `/` (que redirige al login del broker).
 * `manifest.webmanifest` en esta ruta es un route handler que devuelve
 * un manifest con start_url = /adminConsultas.
 */
export const metadata: Metadata = {
  manifest: "/adminConsultas/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TA Connect",
    statusBarStyle: "default",
  },
};

export default function AdminConsultasRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
