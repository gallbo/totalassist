import { PageCard } from "@/components/layout/page-card";

export default function Loading() {
  return (
    <PageCard>
      <div className="flex animate-pulse flex-col gap-6">
        <div className="flex justify-between">
          <div className="h-7 w-48 rounded-md bg-neutral-200" />
          <div className="h-6 w-28 rounded-md bg-neutral-100" />
        </div>
        <div className="grid grid-cols-1 gap-3 border-y border-neutral-200 py-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-3 w-20 rounded-md bg-neutral-100" />
              <div className="h-5 w-32 rounded-md bg-neutral-200" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-3 w-20 rounded-md bg-neutral-100" />
              <div className="h-5 w-40 rounded-md bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    </PageCard>
  );
}
