import type { Metadata, Viewport } from "next";
import { SCRIPT_CAPTURA_INSTALACION } from "@/components/pwa/install-app-button";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
      </head>
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
