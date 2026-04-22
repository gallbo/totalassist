import { Handshake } from "lucide-react";
import { BrandButton } from "@/components/ui/brand-button";
import { PageCard } from "@/components/layout/page-card";
import { misPaquetes, paquetesDisponibles } from "@/lib/mocks";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default function PaquetesPage() {
  return (
    <PageCard>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h1 className="text-brand-navy text-lg font-bold">Mis paquetes</h1>

          <div className="hidden overflow-hidden rounded-lg border border-neutral-200 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50 text-left">
                  <th className="px-5 py-3 font-semibold text-neutral-600">
                    Paquete
                  </th>
                  <th className="px-5 py-3 font-semibold text-neutral-600">
                    Fecha de contratación
                  </th>
                  <th className="px-5 py-3 font-semibold text-neutral-600">
                    Fecha de expiración
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-neutral-600">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {misPaquetes.map((p, i) => (
                  <tr
                    key={p.id}
                    className={
                      i !== misPaquetes.length - 1
                        ? "border-b border-neutral-100"
                        : ""
                    }
                  >
                    <td className="text-brand-navy px-5 py-4">{p.nombre}</td>
                    <td className="px-5 py-4 text-neutral-600">
                      {p.fechaContratacion}
                    </td>
                    <td className="px-5 py-4 text-neutral-600">
                      {p.fechaExpiracion}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={
                          p.activo
                            ? "text-state-success font-semibold"
                            : "text-state-danger font-semibold"
                        }
                      >
                        {p.activo ? "Activo" : "Vencido"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {misPaquetes.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-neutral-200"
              >
                <div>
                  <div className="text-brand-navy font-semibold">
                    {p.nombre}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {p.fechaContratacion} → {p.fechaExpiracion}
                  </div>
                </div>
                <span
                  className={
                    p.activo
                      ? "text-state-success text-sm font-semibold"
                      : "text-state-danger text-sm font-semibold"
                  }
                >
                  {p.activo ? "Activo" : "Vencido"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-brand-navy text-lg font-bold">
            Contratar paquete
          </h2>

          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {paquetesDisponibles.map((p) => (
              <article key={p.id} className="relative pb-6">
                <div className="relative aspect-[3/4] rounded-2xl ring-1 ring-neutral-200">
                  <div
                    className="absolute inset-0 overflow-hidden rounded-2xl"
                    style={{ background: p.gradiente }}
                  >
                    <Handshake
                      className="absolute top-[20%] left-1/2 h-16 w-16 -translate-x-1/2 text-white/70"
                      strokeWidth={1.25}
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-2xl bg-white/60 px-5 pt-4 pb-8 backdrop-blur-[2px]">
                    <h3 className="text-brand-navy text-base font-bold">
                      {p.nombre}
                    </h3>
                    <dl className="mt-2 flex flex-col gap-0.5 text-sm text-neutral-800">
                      <div className="flex gap-2">
                        <dt>Costo:</dt>
                        <dd className="text-brand-navy font-semibold">
                          {currency.format(p.costo)}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt>Número de casos:</dt>
                        <dd className="text-brand-navy font-semibold">
                          {p.casos}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt>Duración:</dt>
                        <dd className="text-brand-navy font-semibold">
                          {p.duracionDias} días
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
                    <BrandButton className="px-8 shadow-md">
                      Contratar
                    </BrandButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PageCard>
  );
}
