import { CheckCircle2, CircleDot, ShieldCheck, XCircle } from "lucide-react";

export type EtapaCoberturaItem = {
  nombre: string | null;
  estatus: "pendiente" | "activa" | "finalizada";
};

export type ResultadoCoberturaItem = {
  tipo: "con_pago" | "sin_pago" | "interrumpida";
  descripcion: string;
  monto: number | null;
  fecha: string | null;
};

export type CoberturaConEtapas = {
  nombre: string | null;
  etapa_actual: string | null;
  ultima_actividad?: string | null;
  resultado?: ResultadoCoberturaItem | null;
  etapas: EtapaCoberturaItem[];
};

const COLOR_SEGMENTO: Record<EtapaCoberturaItem["estatus"], string> = {
  pendiente: "bg-neutral-300",
  activa: "bg-brand-yellow",
  finalizada: "bg-state-success",
};

const LABEL_ESTATUS: Record<EtapaCoberturaItem["estatus"], string> = {
  pendiente: "Pendiente",
  activa: "En proceso",
  finalizada: "Finalizada",
};

export function EtapasCobertura({
  coberturas,
}: {
  coberturas: CoberturaConEtapas[] | undefined;
}) {
  if (!coberturas || coberturas.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-brand-navy text-base font-bold">
        Avance por cobertura
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {coberturas.map((cobertura, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <ShieldCheck className="text-brand-navy mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-brand-navy text-sm font-semibold">
                  {cobertura.nombre ?? "Cobertura"}
                </p>
              </div>
              {cobertura.etapa_actual ? (
                <span className="bg-brand-navy/5 text-brand-navy max-w-full rounded-full px-3 py-1 text-xs font-medium">
                  {cobertura.etapa_actual}
                </span>
              ) : null}
            </div>

            {/* Barra segmentada: un segmento por etapa */}
            <div className="flex gap-1.5">
              {cobertura.etapas.map((etapa, etapaIdx) => (
                <div
                  key={etapaIdx}
                  className={`h-2.5 flex-1 rounded-full ${COLOR_SEGMENTO[etapa.estatus] ?? COLOR_SEGMENTO.pendiente}`}
                />
              ))}
            </div>

            <div className="flex gap-1.5">
              {cobertura.etapas.map((etapa, etapaIdx) => (
                <div key={etapaIdx} className="flex flex-1 flex-col gap-0.5">
                  <p className="text-[11px] leading-tight font-medium text-neutral-700">
                    {etapa.nombre ?? `Etapa ${etapaIdx + 1}`}
                  </p>
                  <p className="text-[11px] leading-tight text-neutral-500">
                    {LABEL_ESTATUS[etapa.estatus] ?? "Pendiente"}
                  </p>
                </div>
              ))}
            </div>

            {/* Última actividad en curso (cobertura en proceso) */}
            {cobertura.ultima_actividad ? (
              <div className="flex items-start gap-2 rounded-lg bg-neutral-50 px-3 py-2">
                <CircleDot className="text-brand-yellow mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
                    Actividad en curso
                  </p>
                  <p className="text-brand-navy text-sm">
                    {cobertura.ultima_actividad}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Resultado (cobertura terminada o interrumpida) */}
            {cobertura.resultado ? (
              <div
                className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
                  cobertura.resultado.tipo === "interrumpida"
                    ? "bg-red-50"
                    : "bg-emerald-50"
                }`}
              >
                {cobertura.resultado.tipo === "interrumpida" ? (
                  <XCircle className="text-state-danger mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="text-state-success mt-0.5 h-4 w-4 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
                    Resultado
                  </p>
                  <p className="text-brand-navy text-sm">
                    {cobertura.resultado.descripcion}
                    {cobertura.resultado.tipo === "con_pago" &&
                    cobertura.resultado.monto != null
                      ? ` · $${cobertura.resultado.monto.toLocaleString("es-MX")}`
                      : ""}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
