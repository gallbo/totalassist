import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { DashboardData } from "@/lib/api/brokers";

type Counts = DashboardData["casos_counts"];

type Row = {
  label: string;
  value: number;
  color: string;
  icon: typeof Clock;
};

export function EstadoCasos({ counts }: { counts: Counts }) {
  const max = Math.max(
    counts.en_proceso,
    counts.interrumpido,
    counts.finalizado,
    1,
  );

  const rows: Row[] = [
    {
      label: "En proceso",
      value: counts.en_proceso,
      color: "text-state-info",
      icon: Clock,
    },
    {
      label: "Interrumpido",
      value: counts.interrumpido,
      color: "text-state-danger",
      icon: XCircle,
    },
    {
      label: "Finalizado",
      value: counts.finalizado,
      color: "text-state-success",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {rows.map(({ label, value, color, icon: Icon }) => {
        const pct = value > 0 ? (value / max) * 100 : 0;
        const numeroDentro = value > 0;
        return (
          <div key={label} className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="relative h-8 overflow-hidden rounded-md bg-blue-50">
                <div
                  className="bg-brand-navy flex h-full items-center justify-end transition-[width]"
                  style={{ width: `${pct}%` }}
                >
                  {numeroDentro && (
                    <span className="px-3 text-xs font-semibold text-white tabular-nums">
                      {value}
                    </span>
                  )}
                </div>
                {!numeroDentro && (
                  <span className="text-brand-navy absolute inset-y-0 right-3 flex items-center text-xs font-semibold tabular-nums">
                    {value}
                  </span>
                )}
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
