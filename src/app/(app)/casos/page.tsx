import { PageCard } from "@/components/layout/page-card";
import { casos } from "@/lib/mocks";
import { CasosTable } from "./_components/casos-table";

export default function CasosPage() {
  return (
    <PageCard>
      <CasosTable casos={casos} />
    </PageCard>
  );
}
