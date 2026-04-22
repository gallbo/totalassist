import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function PageCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white px-4 py-6 shadow-sm ring-1 ring-neutral-200 sm:px-6 sm:py-8 lg:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
