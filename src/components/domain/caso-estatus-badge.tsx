import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CasoEstatus } from "@/lib/mocks";

const CONFIG: Record<
  CasoEstatus,
  { label: string; color: string; Icon: typeof Clock }
> = {
  "en-proceso": {
    label: "En proceso",
    color: "text-state-info",
    Icon: Clock,
  },
  interrumpido: {
    label: "Interrumpido",
    color: "text-state-danger",
    Icon: XCircle,
  },
  indemnizado: {
    label: "Indemnizado",
    color: "text-state-success",
    Icon: CheckCircle2,
  },
  finalizado: {
    label: "Finalizado",
    color: "text-state-success",
    Icon: CheckCircle2,
  },
};

type Props = {
  estatus: CasoEstatus;
  className?: string;
};

export function CasoEstatusBadge({ estatus, className }: Props) {
  const { label, color, Icon } = CONFIG[estatus];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium",
        color,
        className,
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
      {label}
    </span>
  );
}
