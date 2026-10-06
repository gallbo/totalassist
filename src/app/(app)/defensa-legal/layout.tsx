import { requireBrokerPiloto } from "@/lib/piloto-server";

// Sección en piloto: solo para los brokers de BROKERS_PILOTO (src/lib/piloto.ts).
export default async function SeccionPilotoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireBrokerPiloto();
  return children;
}
