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
        "flex w-full items-center justify-between gap-3 rounded-full bg-blue-50 px-5 py-3 shadow-sm ring-1 ring-neutral-200 lg:w-auto lg:min-w-[160px]",
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
