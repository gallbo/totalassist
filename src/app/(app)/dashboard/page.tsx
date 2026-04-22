import Link from "next/link";
import { ArrowUp, ChevronRight, Star } from "lucide-react";
import { BrandButton } from "@/components/ui/brand-button";
import { StarRating } from "@/components/domain/star-rating";
import { broker, dashboardCounts, favoritos, registroCasos } from "@/lib/mocks";
import { CounterCard } from "./_components/counter-card";
import { EstadoCasos } from "./_components/estado-casos";
import { RegistroCasosChart } from "./_components/registro-casos-chart";

export default function DashboardPage() {
  const nombre = broker.nombre.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <h1 className="text-brand-navy text-2xl font-bold lg:text-3xl">
          ¡Bienvenido, {nombre}!
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <CounterCard
            value={dashboardCounts.enProceso}
            label={"Casos\nen proceso"}
          />
          <CounterCard
            value={dashboardCounts.restantes}
            label={"Casos\nrestantes"}
          />
          <CounterCard
            value={dashboardCounts.interrumpidos}
            label={"Casos\ninterrumpidos"}
          />
          <BrandButton render={<Link href="/paquetes" />} className="h-11 px-6">
            Comprar
          </BrandButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[5fr_7fr]">
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
            <header className="flex items-center justify-between">
              <h2 className="text-brand-navy text-base font-bold">
                Feedback de clientes
              </h2>
              <Link
                href="/dashboard/comentarios"
                className="text-brand-navy/70 hover:text-brand-navy inline-flex items-center gap-0.5 text-sm"
              >
                Ver comentarios <ChevronRight className="h-4 w-4" />
              </Link>
            </header>
            <StarRating value={broker.rating} size="lg" />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
            <header className="flex items-start justify-between">
              <div>
                <h2 className="text-brand-navy text-base font-bold">
                  Registro de casos
                </h2>
                <p className="text-state-success mt-1 inline-flex items-center gap-1 text-sm font-semibold">
                  <ArrowUp className="h-4 w-4" strokeWidth={3} />
                  {registroCasos.delta}%
                </p>
              </div>
              <div className="text-right">
                <div className="text-brand-navy text-3xl font-bold tabular-nums">
                  {registroCasos.total}
                </div>
                <div className="text-xs text-neutral-500">Total</div>
              </div>
            </header>
            <RegistroCasosChart />
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
            <h2 className="text-brand-navy text-base font-bold">
              Estado de los casos
            </h2>
            <EstadoCasos />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
            <header className="flex items-center gap-2">
              <Star className="fill-brand-yellow text-brand-yellow h-5 w-5" />
              <h2 className="text-brand-navy text-base font-bold">
                Tus favoritos
              </h2>
            </header>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-brand-navy text-xl font-bold">
                  {favoritos.aseguradora}
                </div>
                <div className="text-sm text-neutral-500">Aseguradora</div>
              </div>
              <div>
                <div className="text-brand-navy text-xl font-bold">
                  {favoritos.tipoSeguro}
                </div>
                <div className="text-sm text-neutral-500">Tipo de seguro</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
