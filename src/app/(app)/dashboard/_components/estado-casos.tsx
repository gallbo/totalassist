import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { estadoCasosTotales } from "@/lib/mocks";

type Row = {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: typeof Clock;
};

const rows: Row[] = [
  {
    label: "En proceso",
    value: estadoCasosTotales.enProceso,
    max: 10,
    color: "text-state-info",
    icon: Clock,
  },
  {
    label: "Interrumpido",
    value: estadoCasosTotales.interrumpido,
    max: 10,
    color: "text-state-danger",
    icon: XCircle,
  },
  {
    label: "Indemnizado",
    value: estadoCasosTotales.indemnizado,
    max: 10,
    color: "text-state-success",
    icon: CheckCircle2,
  },
  {
    label: "Finalizado",
    value: estadoCasosTotales.finalizado,
    max: 10,
    color: "text-state-success",
    icon: CheckCircle2,
  },
];

export function EstadoCasos() {
  return (
    <div className="flex flex-col gap-3">
      {rows.map(({ label, value, max, color, icon: Icon }) => {
        const pct = Math.min(100, (value / max) * 100);
        return (
          <div key={label} className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="bg-brand-navy relative h-8 overflow-hidden rounded-md">
                <div
                  className="bg-brand-navy h-full"
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-white tabular-nums">
                  {value}
                </span>
              </div>
            </div>
            <span
              className={`flex min-w-[120px] items-center gap-1.5 text-sm font-medium ${color}`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
