"use client";

import { useState, useTransition } from "react";
import { Handshake } from "lucide-react";
import { toast } from "@/lib/toast";
import { BrandButton } from "@/components/ui/brand-button";
import { cn } from "@/lib/utils";
import { formatearFechaLarga } from "@/lib/fecha";
import type { PaqueteCatalogo, PaqueteContratado } from "@/lib/api/brokers";
import { contratarPaqueteAction } from "../_actions";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const GRADIENTES = [
  "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #f5c800 100%)",
  "linear-gradient(135deg, #0f172a 0%, #64748b 50%, #f5c800 100%)",
  "linear-gradient(135deg, #1e293b 0%, #6366f1 50%, #f5c800 100%)",
];

type Props = {
  paquetes: PaqueteContratado[];
  catalogo: PaqueteCatalogo[];
};

export function PaquetesCliente({ paquetes, catalogo }: Props) {
  const [pending, startTransition] = useTransition();
  const [contratandoId, setContratandoId] = useState<number | null>(null);

  const vigente = paquetes.find((p) => p.vigente) ?? null;
  const vigenteHasta = vigente?.fecha_expiracion
    ? formatearFechaLarga(vigente.fecha_expiracion)
    : null;

  const onContratar = (paqueteId: number) => {
    setContratandoId(paqueteId);
    startTransition(async () => {
      const result = await contratarPaqueteAction(paqueteId);
      setContratandoId(null);
      if (result.ok) {
        toast.success("Paquete contratado.");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="text-brand-navy text-lg font-bold">Mis paquetes</h1>

        {paquetes.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Aún no has contratado ningún paquete. Elige uno abajo para empezar.
          </p>
        ) : (
          <>
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
                    <th className="px-5 py-3 font-semibold text-neutral-600">
                      Casos restantes
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-neutral-600">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paquetes.map((p, i) => (
                    <tr
                      key={p.id}
                      className={
                        i !== paquetes.length - 1
                          ? "border-b border-neutral-100"
                          : ""
                      }
                    >
                      <td className="text-brand-navy px-5 py-4">
                        {p.descripcion ?? "Paquete"}
                      </td>
                      <td className="px-5 py-4 text-neutral-600">
                        {formatearFechaLarga(p.fecha_contratacion)}
                      </td>
                      <td className="px-5 py-4 text-neutral-600">
                        {formatearFechaLarga(p.fecha_expiracion)}
                      </td>
                      <td className="px-5 py-4 text-neutral-600">
                        {p.casos_restantes} / {p.numero_casos}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <EstadoPaquete paquete={p} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {paquetes.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-1 rounded-xl bg-white p-4 ring-1 ring-neutral-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-brand-navy font-semibold">
                      {p.descripcion ?? "Paquete"}
                    </div>
                    <EstadoPaquete paquete={p} />
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatearFechaLarga(p.fecha_contratacion) +
                      " → " +
                      formatearFechaLarga(p.fecha_expiracion)}
                  </div>
                  <div className="text-xs text-neutral-600">
                    Casos restantes: {p.casos_restantes} / {p.numero_casos}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-brand-navy text-lg font-bold">Contratar paquete</h2>

        {vigente && (
          <p className="text-sm text-neutral-600">
            Tienes un paquete vigente
            {vigenteHasta ? ` hasta el ${vigenteHasta}` : ""}. Podrás contratar
            otro cuando caduque.
          </p>
        )}

        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {catalogo.map((p, i) => {
            const disabled = !!vigente || pending;
            const cargando = contratandoId === p.id && pending;
            return (
              <article key={p.id} className="relative pb-6">
                <div className="relative aspect-[3/4] rounded-2xl ring-1 ring-neutral-200">
                  <div
                    className="absolute inset-0 overflow-hidden rounded-2xl"
                    style={{
                      background: GRADIENTES[i % GRADIENTES.length],
                    }}
                  >
                    <Handshake
                      className="absolute top-[20%] left-1/2 h-16 w-16 -translate-x-1/2 text-white/70"
                      strokeWidth={1.25}
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-2xl bg-white/60 px-5 pt-4 pb-8 backdrop-blur-[2px]">
                    <h3 className="text-brand-navy text-base font-bold">
                      {p.descripcion}
                    </h3>
                    <dl className="mt-2 flex flex-col gap-0.5 text-sm text-neutral-800">
                      <div className="flex gap-2">
                        <dt>Costo:</dt>
                        <dd className="text-brand-navy font-semibold">
                          {Number(p.precio) === 0
                            ? "Gratis"
                            : currency.format(Number(p.precio))}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt>Número de casos:</dt>
                        <dd className="text-brand-navy font-semibold">
                          {p.numero_casos}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt>{p.fecha_fin ? "Vigencia:" : "Duración:"}</dt>
                        <dd className="text-brand-navy font-semibold">
                          {p.fecha_fin
                            ? `Hasta el ${formatearFechaLarga(p.fecha_fin)}`
                            : `${p.vigencia_dias} días`}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
                    <BrandButton
                      className={cn("px-8 shadow-md", disabled && "opacity-60")}
                      disabled={disabled}
                      onClick={() => onContratar(p.id)}
                    >
                      {cargando ? "Contratando…" : "Contratar"}
                    </BrandButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function EstadoPaquete({ paquete }: { paquete: PaqueteContratado }) {
  if (paquete.activo) {
    return <span className="text-state-success font-semibold">Activo</span>;
  }
  if (paquete.vigente) {
    return <span className="text-state-info font-semibold">Sin cupos</span>;
  }
  return <span className="text-state-danger font-semibold">Vencido</span>;
}
