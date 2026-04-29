import { PageCard } from "@/components/layout/page-card";

export default function Loading() {
  return (
    <PageCard>
      <div className="flex animate-pulse flex-col gap-6">
        <div className="h-6 w-48 rounded-md bg-neutral-200" />
        <div className="flex flex-col gap-3">
          <div className="h-12 w-full rounded-full bg-neutral-100" />
          <div className="h-12 w-full rounded-full bg-neutral-100" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-10 w-full rounded-md bg-neutral-100" />
          <div className="h-10 w-full rounded-md bg-neutral-100" />
          <div className="h-10 w-full rounded-md bg-neutral-100" />
          <div className="h-10 w-full rounded-md bg-neutral-100" />
          <div className="h-10 w-full rounded-md bg-neutral-100" />
        </div>
      </div>
    </PageCard>
  );
}
