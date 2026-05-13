import { AgencyBadge } from "@/components/layout/agency-badge";
import { Logo } from "@/components/layout/logo";
import type { BrokerPublicoCompartido } from "@/lib/api/publico";

type Props = {
  broker: BrokerPublicoCompartido | null;
};

export function SeguimientoHeader({ broker }: Props) {
  return (
    <header className="flex w-full items-center justify-between gap-4 py-2">
      <div className="flex items-center">
        <Logo variant="compact" className="lg:hidden" />
        <Logo variant="full" className="hidden lg:flex" />
      </div>

      {broker ? (
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end text-right leading-tight">
            <span className="text-xs text-neutral-500">Presentado por</span>
            <span className="text-brand-navy text-sm font-semibold">
              {broker.nombre}
            </span>
          </div>
          <AgencyBadge name={broker.nombre} logoUrl={broker.logo_url} />
        </div>
      ) : null}
    </header>
  );
}
