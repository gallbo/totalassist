import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-brand-navy text-sm font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-state-danger text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
