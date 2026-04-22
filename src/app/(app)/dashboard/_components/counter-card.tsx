import { cn } from "@/lib/utils";

type Props = {
  value: number;
  label: string;
  className?: string;
};

export function CounterCard({ value, label, className }: Props) {
  return (
    <div
      className={cn(
        "flex min-w-[160px] items-center justify-between gap-3 rounded-full bg-blue-50 px-5 py-3",
        className,
      )}
    >
      <span className="text-brand-navy/80 text-sm leading-tight font-medium whitespace-pre-line">
        {label}
      </span>
      <span className="text-brand-navy text-3xl font-bold tabular-nums">
        {value}
      </span>
    </div>
  );
}
