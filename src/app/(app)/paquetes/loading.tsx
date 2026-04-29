import { PageCard } from "@/components/layout/page-card";

export default function Loading() {
  return (
    <PageCard>
      <div className="flex animate-pulse flex-col gap-8">
        <section className="flex flex-col gap-4">
          <div className="h-6 w-40 rounded-md bg-neutral-200" />
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <div className="h-10 w-full bg-blue-50" />
            <div className="h-12 w-full border-t border-neutral-100 bg-white" />
            <div className="h-12 w-full border-t border-neutral-100 bg-white" />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="h-6 w-44 rounded-md bg-neutral-200" />
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-neutral-100 ring-1 ring-neutral-200"
              />
            ))}
          </div>
        </section>
      </div>
    </PageCard>
  );
}
