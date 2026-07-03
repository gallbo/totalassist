import {
  Check,
  CheckCircle2,
  CircleDot,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export type EtapaCoberturaItem = {
  nombre: string | null;
  estatus: "pendiente" | "activa" | "finalizada";
  porcentaje?: number;
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
  avance?: number;
  resultado?: ResultadoCoberturaItem | null;
  etapas: EtapaCoberturaItem[];
};

const LABEL_ESTATUS: Record<EtapaCoberturaItem["estatus"], string> = {
  pendiente: "Pendiente",
  activa: "En proceso",
  finalizada: "Finalizada",
};

const COLOR_ESTATUS: Record<EtapaCoberturaItem["estatus"], string> = {
  pendiente: "text-neutral-400",
  activa: "font-semibold text-amber-600",
  finalizada: "font-medium text-state-success",
};

function NodoEtapa({ estatus }: { estatus: EtapaCoberturaItem["estatus"] }) {
  if (estatus === "finalizada") {
    return (
      <span className="bg-state-success flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  if (estatus === "activa") {
    return (
      <span className="bg-brand-yellow ring-brand-yellow/25 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4">
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 bg-white">
      <span className="h-2 w-2 rounded-full bg-neutral-300" />
    </span>
  );
}

function Stepper({ etapas }: { etapas: EtapaCoberturaItem[] }) {
  return (
    <div className="flex items-start pt-1">
      {etapas.map((etapa, i) => {
        const esPrimera = i === 0;
        const esUltima = i === etapas.length - 1;
        const conectorIzq =
          !esPrimera && etapas[i - 1].estatus === "finalizada"
            ? "bg-state-success"
            : "bg-neutral-200";
        const conectorDer =
          etapa.estatus === "finalizada"
            ? "bg-state-success"
            : "bg-neutral-200";

        return (
          <div
            key={i}
            className="flex flex-1 flex-col items-center text-center"
          >
            <div className="flex w-full items-center">
              <div
                className={`h-0.5 flex-1 ${esPrimera ? "bg-transparent" : conectorIzq}`}
              />
              <NodoEtapa estatus={etapa.estatus} />
              <div
                className={`h-0.5 flex-1 ${esUltima ? "bg-transparent" : conectorDer}`}
              />
            </div>
            <p className="text-brand-navy mt-1.5 px-1 text-[11px] leading-tight font-medium">
              {etapa.nombre ?? `Etapa ${i + 1}`}
            </p>
            <p
              className={`text-[11px] leading-tight ${COLOR_ESTATUS[etapa.estatus]}`}
            >
              {LABEL_ESTATUS[etapa.estatus]}
              {etapa.estatus === "activa" &&
              typeof etapa.porcentaje === "number"
                ? ` · ${Math.round(etapa.porcentaje)}%`
                : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}

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
            className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <ShieldCheck className="text-brand-navy mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-brand-navy text-sm font-semibold">
                  {cobertura.nombre ?? "Cobertura"}
                </p>
              </div>
              {typeof cobertura.avance === "number" ? (
                <span className="text-brand-navy text-sm font-bold">
                  {Math.round(cobertura.avance)}%
                </span>
              ) : null}
            </div>

            {/* Etapas del proceso como pasos (no como barra, para no confundir con el avance) */}
            <Stepper etapas={cobertura.etapas} />

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
