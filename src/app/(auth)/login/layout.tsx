import type { Metadata } from "next";
import { GoogleTagManager } from "@/components/analitica/google-tag-manager";

// El portal no se indexa (robots del layout raíz); el login sí, para que los
// brokers registrados lo encuentren en Google.
export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Inicia sesión en el portal de brokers de Total Assist para dar seguimiento a tus casos y consultas.",
  alternates: { canonical: "https://totalclaimassist.app/login" },
  robots: {
    index: true,
    follow: false,
    googleBot: { index: true, follow: false },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <GoogleTagManager />
    </>
  );
}
