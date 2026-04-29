import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDown, ArrowUp, FileText, Star } from "lucide-react";
import { BrandButton } from "@/components/ui/brand-button";
import { brokerApi, type DashboardData } from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { CounterCard } from "./_components/counter-card";
import { EstadoCasos } from "./_components/estado-casos";
import { RegistroCasosChart } from "./_components/registro-casos-chart";

export default async function DashboardPage() {
  const token = await getServerAccessToken();
  if (!token) {
    redirect("/login");
  }

  let data: DashboardData | null = null;
  try {
    data = await brokerApi.getDashboard(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-neutral-200">
        <p className="text-sm text-neutral-600">
          No pudimos cargar el dashboard. Intenta de nuevo en unos segundos.
        </p>
      </div>
    );
  }

  const nombre =
    data.broker.nombre?.trim() ||
    data.broker.apellido_paterno?.trim() ||
    "Broker";

  const tieneCasos = data.casos_counts.total > 0;
  const casosRestantes = data.paquete_activo?.casos_restantes ?? 0;
  const delta = data.registro_casos.delta_porcentaje;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <h1 className="text-brand-navy text-2xl font-bold lg:text-3xl">
          ¡Bienvenido, {nombre}!
        </h1>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-nowrap lg:items-center">
          <CounterCard
            value={data.casos_counts.en_proceso}
            label={"Casos\nen proceso"}
          />
          <CounterCard value={casosRestantes} label={"Casos\nrestantes"} />
          <CounterCard
            value={data.casos_counts.interrumpido}
            label={"Casos\ninterrumpidos"}
          />
          <BrandButton
            render={<Link href="/paquetes" />}
            className="h-12 w-full px-6 lg:h-11 lg:w-auto"
          >
            Comprar
          </BrandButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[5fr_7fr]">
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
            <header className="flex items-start justify-between">
              <div>
                <h2 className="text-brand-navy text-base font-bold">
                  Registro de casos
                </h2>
                {tieneCasos ? (
                  <p
                    className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${
                      delta >= 0 ? "text-state-success" : "text-state-danger"
                    }`}
                  >
                    {delta >= 0 ? (
                      <ArrowUp className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      <ArrowDown className="h-4 w-4" strokeWidth={3} />
                    )}
                    {Math.abs(delta)}%
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-neutral-500">
                    Últimos 12 meses
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-brand-navy text-3xl font-bold tabular-nums">
                  {data.registro_casos.total}
                </div>
                <div className="text-xs text-neutral-500">Total</div>
              </div>
            </header>

            {tieneCasos ? (
              <RegistroCasosChart serie={data.registro_casos.serie} />
            ) : (
              <Vacio
                titulo="Aún no hay casos registrados"
                texto="Cuando empieces a cargar casos, aquí verás tu actividad mensual."
              />
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
            <h2 className="text-brand-navy text-base font-bold">
              Estado de los casos
            </h2>
            {tieneCasos ? (
              <EstadoCasos counts={data.casos_counts} />
            ) : (
              <Vacio
                titulo="Sin casos aún"
                texto="Las métricas por estatus aparecerán aquí cuando registres tu primer caso."
              />
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
            <header className="flex items-center gap-2">
              <Star className="fill-brand-yellow text-brand-yellow h-5 w-5" />
              <h2 className="text-brand-navy text-base font-bold">
                Tus favoritos
              </h2>
            </header>
            {data.favoritos.aseguradora || data.favoritos.tipo_seguro ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-brand-navy text-xl font-bold">
                    {data.favoritos.aseguradora ?? "—"}
                  </div>
                  <div className="text-sm text-neutral-500">Aseguradora</div>
                </div>
                <div>
                  <div className="text-brand-navy text-xl font-bold">
                    {data.favoritos.tipo_seguro ?? "—"}
                  </div>
                  <div className="text-sm text-neutral-500">Tipo de seguro</div>
                </div>
              </div>
            ) : (
              <Vacio
                titulo="Aún sin favoritos"
                texto="Calcularemos tu aseguradora y tipo de seguro favoritos a partir de los casos que registres."
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Vacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-blue-50/50 px-4 py-8 text-center">
      <FileText className="text-brand-navy/40 h-8 w-8" strokeWidth={1.5} />
      <div className="text-brand-navy text-sm font-semibold">{titulo}</div>
      <div className="max-w-xs text-xs text-neutral-600">{texto}</div>
    </div>
  );
}
