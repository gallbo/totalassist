import { PageCard } from "@/components/layout/page-card";

export default function Loading() {
  return (
    <PageCard>
      <div className="flex animate-pulse flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-28 rounded-md bg-neutral-100" />
          <div className="h-7 w-64 rounded-md bg-neutral-200" />
          <div className="h-4 w-40 rounded-md bg-neutral-100" />
        </div>
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-3/4 rounded-md bg-neutral-100" />
              <div className="h-11 w-full rounded-xl bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    </PageCard>
  );
}
