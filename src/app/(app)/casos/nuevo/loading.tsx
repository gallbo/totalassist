import { PageCard } from "@/components/layout/page-card";

export default function Loading() {
  return (
    <PageCard>
      <div className="flex animate-pulse flex-col gap-6">
        <div className="h-7 w-56 rounded-md bg-neutral-200" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 rounded-full bg-neutral-200" />
          <div className="h-12 rounded-full bg-neutral-100" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-3 w-20 rounded-md bg-neutral-100" />
              <div className="h-11 w-full rounded-md bg-neutral-100" />
            </div>
          ))}
        </div>
        <div className="h-12 w-full rounded-md bg-neutral-100" />
        <div className="h-32 w-full rounded-md bg-neutral-100" />
      </div>
    </PageCard>
  );
}
