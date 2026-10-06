import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { AdminHeaderLogout } from "../_components/AdminHeaderLogout";
import { AdminNav } from "../_components/admin-nav";

/**
 * Layout de las paginas *autenticadas* de /adminConsultas.
 *
 * Vive en un route group `(app)` para que /adminConsultas/login (que esta
 * al mismo nivel de /adminConsultas pero fuera del grupo) no herede ni el
 * chrome ni el guard de sesion. Esto evita que la pantalla de login pinte
 * el header con boton "Cerrar sesion" antes de que exista una sesion.
 *
 * AUTH: server-side redirect a /adminConsultas/login si no hay sesion o si
 * la sesion no es admin (por si un broker autenticado navega a la URL). La
 * autoridad final sigue estando en Skipper via
 * App\Support\TotalAssistAdminAccessPolicy — este check solo es UX.
 *
 * ACCESIBILIDAD (Manuel Gallardo, invidente, VoiceOver):
 * - Estructura semantica con landmarks (<header>, <main>, <footer>).
 * - Skip link visible al foco para saltar al contenido.
 * - Sin sidebar de broker: la vista de admin es plana y centrada.
 */
export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.role !== "admin") {
    redirect("/adminConsultas/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <a
        href="#contenido"
        className="focus:bg-brand-navy sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido principal
      </a>

      <header
        role="banner"
        className="bg-brand-navy text-white shadow-sm"
        aria-label="Encabezado del panel de administracion"
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/adminConsultas"
            className="flex items-center gap-2 text-base font-bold whitespace-nowrap sm:text-lg"
            aria-label="Ir al inicio del panel de consultas"
          >
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            <span>Panel de Consultas</span>
          </Link>
          <AdminHeaderLogout />
        </div>
      </header>
      <AdminNav />

      <main
        id="contenido"
        role="main"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-6"
      >
        {children}
      </main>

      <footer
        role="contentinfo"
        className="border-t border-neutral-200 bg-white py-3 text-center text-xs text-neutral-500"
      >
        <p>Total Assist · Panel administrativo · Uso exclusivo autorizado</p>
      </footer>
    </div>
  );
}
