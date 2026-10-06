import { NextResponse } from "next/server";

/**
 * Manifest PWA especifico para /adminConsultas — al instalar la app desde
 * el splash del admin (Manuel), la PWA abre en `/adminConsultas` en vez
 * de la raiz `/` (que redirige al login del broker).
 *
 * El manifest raiz (/manifest.webmanifest) sigue existiendo para el
 * portal broker; este solo lo sobreescribe cuando la pagina esta bajo
 * `/adminConsultas` (via <link rel="manifest"> en su layout).
 */
export function GET() {
  const body = {
    name: "Total Assist — Panel de Consultas",
    short_name: "Consultas",
    description: "Panel de consultas de Total Assist.",
    start_url: "/adminConsultas",
    scope: "/adminConsultas",
    display: "standalone",
    background_color: "#0F1F3C",
    theme_color: "#0F1F3C",
    lang: "es-MX",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
  return NextResponse.json(body, {
    headers: {
      "Content-Type": "application/manifest+json",
      // Los manifests casi no cambian; cachea 1 hora en cliente.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
