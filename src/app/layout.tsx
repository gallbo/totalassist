import type { Metadata, Viewport } from "next";
import { SCRIPT_CAPTURA_INSTALACION } from "@/components/pwa/install-app-button";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const GTM_ID = "GTM-TTTBMGKW";

export const metadata: Metadata = {
  title: {
    default: "Total Assist — Portal de brokers",
    template: "%s | Total Assist",
  },
  description: "Portal de gestión de casos para brokers de seguros.",
  applicationName: "Total Assist",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  // Nombre que propone iOS al "Agregar a pantalla de inicio" (Safari no toma
  // el del manifest). Corto para que iOS no lo recorte; /adminConsultas usa "TA Connect".
  appleWebApp: {
    capable: true,
    title: "TA Broker",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F1F3C",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={cn("h-full antialiased", inter.variable, "font-sans")}
    >
      <head>
        {/* Captura beforeinstallprompt antes de que monte React; lo usa
            el botón "Instalar app" de los logins. */}
        <script
          dangerouslySetInnerHTML={{ __html: SCRIPT_CAPTURA_INSTALACION }}
        />
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body className="flex min-h-full flex-col">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
