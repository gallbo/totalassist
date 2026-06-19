import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.dropbox.com" },
      { protocol: "https", hostname: "*.dropboxusercontent.com" },
    ],
  },
  // En navegaciones a páginas que dependen de cookies, App Router por default
  // muestra brevemente la vista anterior antes de pintar el loading.tsx.
  // Bajando dynamic a 0 forzamos que el skeleton aparezca al instante en cada
  // navegación, eliminando la sensación de "trabado" mientras Skipper responde.
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
    // Las subidas de archivos (caso y póliza) viajan como FormData a través de
    // server actions. El default de 1 MB rechazaba PDFs reales; el backend
    // permite hasta 10 MB, así que se deja margen para el overhead del encoding.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
