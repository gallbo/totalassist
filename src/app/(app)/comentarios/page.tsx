import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { brokerApi, type FeedbackLista } from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { ComentariosLista } from "./_components/comentarios-lista";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ComentariosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const token = await getServerAccessToken();
  if (!token) {
    redirect("/login");
  }

  let lista: FeedbackLista | null = null;
  try {
    lista = await brokerApi.getFeedbackLista(token, { page, per_page: 20 });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
  }

  return (
    <PageCard>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-brand-navy inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-neutral-200 hover:bg-neutral-50"
            aria-label="Volver al dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-brand-navy text-xl font-bold">
            Feedback de clientes
          </h1>
        </div>

        {!lista ? (
          <p className="text-sm text-neutral-600">
            No pudimos cargar los comentarios. Intenta de nuevo en unos
            segundos.
          </p>
        ) : (
          <ComentariosLista lista={lista} pageActual={page} />
        )}
      </div>
    </PageCard>
  );
}
