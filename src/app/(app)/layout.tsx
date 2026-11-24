import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { brokerApi, type BrokerMe } from "@/lib/api/brokers";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { TutorialPortal } from "@/components/tutorial-portal";
import { GuardiaPerfil } from "@/components/guardia-perfil";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const token = await getServerAccessToken();
  let broker: BrokerMe | null = null;
  if (token) {
    try {
      broker = await brokerApi.getMe(token);
    } catch {
      // El header degrada al email de la sesion si falla.
    }
  }

  // Registro en dos pasos (Skipper, migración 144): sin domicilio y RFC no
  // puede usar nada del portal; todo lo manda a completar su perfil.
  const perfilIncompleto = !!broker && broker.perfil_completo === false;
  const ruta = (await headers()).get("x-pathname") ?? "";
  if (perfilIncompleto && !ruta.startsWith("/completar-perfil")) {
    redirect("/completar-perfil");
  }

  // NOTA: el patrón de estrellas de fondo (<BackgroundPattern variant="subtle" />)
  // se retiró por pedido del cliente (Alicia, jul-2026) porque le restaba
  // limpieza a la vista privada del broker. Sigue disponible para (auth) y
  // (public); si algún día se quiere reintegrar aquí, basta con volver a
  // importar y renderizar el componente.
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <main className="relative flex-1 overflow-hidden">
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
          <Header session={session} broker={broker} />
          <GuardiaPerfil incompleto={perfilIncompleto}>
            {children}
          </GuardiaPerfil>
          {/* Recorrido guiado: se abre solo una vez al día (perfil completo) hasta
              que lo termina o elige «No volver a mostrar». */}
          <TutorialPortal
            autoIniciar={
              !!broker &&
              broker.perfil_completo !== false &&
              broker.tutorial_visto === false &&
              broker.tutorial_mostrado_hoy !== true
            }
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
