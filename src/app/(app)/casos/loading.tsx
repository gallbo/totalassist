import { PageCard } from "@/components/layout/page-card";

export default function Loading() {
  return (
    <PageCard>
      <div className="flex animate-pulse flex-col gap-5">
        <div className="h-6 w-32 rounded-md bg-neutral-200" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="h-12 flex-1 rounded-full bg-neutral-200" />
          <div className="h-11 w-32 rounded-full bg-neutral-200" />
          <div className="h-11 w-28 rounded-full bg-neutral-200" />
        </div>
        <div className="overflow-hidden rounded-lg">
          <div className="h-10 w-full rounded-full bg-neutral-100" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="mt-2 h-12 w-full rounded-md border border-neutral-100 bg-white"
            />
          ))}
        </div>
      </div>
    </PageCard>
  );
}
