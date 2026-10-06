import "server-only";

import { redirect } from "next/navigation";
import { brokerApi } from "@/lib/api/brokers";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { esBrokerPiloto } from "@/lib/piloto";

/**
 * Para los layout.tsx de las secciones en piloto: si el broker no está en
 * BROKERS_PILOTO (o no se puede saber quién es), lo manda al dashboard.
 * Así no basta con escribir la URL para entrar.
 */
export async function requireBrokerPiloto(): Promise<void> {
  let permitido = false;
  const token = await getServerAccessToken();
  if (token) {
    try {
      const broker = await brokerApi.getMe(token);
      permitido = esBrokerPiloto(broker?.id);
    } catch {
      permitido = false;
    }
  }
  if (!permitido) {
    redirect("/dashboard");
  }
}
