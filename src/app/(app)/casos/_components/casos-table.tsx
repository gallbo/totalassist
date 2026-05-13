"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import { cn } from "@/lib/utils";
import { formatearFechaLarga } from "@/lib/fecha";
import type { CasoResumen, ListaCasos } from "@/lib/api/brokers";

const ESTATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "0", label: "En proceso" },
  { value: "1", label: "Interrumpido" },
  { value: "3", label: "Finalizado" },
];

type Props = {
  initial: ListaCasos;
  initialQuery: string;
  initialEstatus: string;
};

export function CasosTable({ initial, initialQuery, initialEstatus }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [estatus, setEstatus] = useState(initialEstatus);
  const [estatusOpen, setEstatusOpen] = useState(false);

  const aplicarFiltros = (nextQuery: string, nextEstatus: string) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextEstatus !== "todos") params.set("estatus_caso", nextEstatus);
    router.push(`/casos${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const onSubmitBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    aplicarFiltros(query, estatus);
  };

  const irAPagina = (p: number) => {
    const params = new URLSearchParams();
    if (initialQuery.trim()) params.set("q", initialQuery.trim());
    if (initialEstatus !== "todos") params.set("estatus_caso", initialEstatus);
    if (p > 1) params.set("page", String(p));
    router.push(`/casos${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-brand-navy text-lg font-bold">
        {initial.total} {initial.total === 1 ? "caso" : "casos"}
      </h1>

      <form
        onSubmit={onSubmitBusqueda}
        className="flex flex-col gap-3 md:flex-row md:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar por folio o asegurado"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 rounded-full bg-neutral-200 pl-11"
          />
        </div>

        <div className="flex gap-3">
          <BrandButton
            type="button"
            render={<Link href="/casos/nuevo" />}
            className="h-11 px-6"
          >
            <Plus className="mr-1 h-4 w-4" /> Nuevo caso
          </BrandButton>

          <div className="relative">
            <BrandButton
              type="button"
              tone="secondary"
              className="h-11 px-6"
              onClick={() => setEstatusOpen((o) => !o)}
            >
              {ESTATUS_OPTIONS.find((o) => o.value === estatus)?.label ??
                "Estatus"}
            </BrandButton>
            {estatusOpen && (
              <div className="absolute top-full right-0 z-20 mt-2 w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                {ESTATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setEstatus(opt.value);
                      setEstatusOpen(false);
                      aplicarFiltros(query, opt.value);
                    }}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-sm hover:bg-neutral-50",
                      estatus === opt.value && "text-brand-navy font-semibold",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="hidden">
            Buscar
          </button>
        </div>
      </form>

      {initial.data.length === 0 ? (
        <p className="rounded-lg bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">
          {initialQuery || initialEstatus !== "todos"
            ? "No encontramos casos con esos filtros."
            : "Aún no has registrado ningún caso. Crea el primero arriba."}
        </p>
      ) : (
        <>
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-100 text-center">
                  <th className="rounded-l-full px-4 py-3 text-center font-semibold text-neutral-600">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">
                    Folio
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">
                    Asegurado
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">
                    Aseguradora
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">
                    Tipo de seguro
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">
                    Fecha del siniestro
                  </th>
                  <th className="rounded-r-full px-4 py-3 font-semibold text-neutral-600">
                    Estatus
                  </th>
                </tr>
              </thead>
              <tbody>
                {initial.data.map((c, i) => (
                  <Fila
                    key={c.id}
                    caso={c}
                    index={(initial.page - 1) * initial.per_page + i + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {initial.data.map((c) => (
              <Link
                key={c.id}
                href={`/casos/${c.id}`}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-neutral-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-brand-navy font-semibold">
                    {c.folio ?? `Caso #${c.id}`}
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm">{c.nombre ?? "—"}</span>
                  <EstatusBadge estatus={c.estatus_caso} />
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                  <span>{c.aseguradora ?? "Sin aseguradora"}</span>
                  {c.tipo_seguro && (
                    <>
                      <span>·</span>
                      <span>{c.tipo_seguro}</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            page={initial.page}
            totalPages={initial.total_pages}
            onChange={irAPagina}
          />
        </>
      )}
    </div>
  );
}

function Fila({ caso, index }: { caso: CasoResumen; index: number }) {
  return (
    <tr className="border-b border-neutral-100 transition-colors hover:bg-neutral-50">
      <td className="px-4 py-4 text-center text-neutral-600">{index}</td>
      <td className="px-4 py-4">
        <Link
          href={`/casos/${caso.id}`}
          className="text-brand-navy hover:underline"
        >
          {caso.folio ?? `#${caso.id}`}
        </Link>
      </td>
      <td className="px-4 py-4">{caso.nombre ?? "—"}</td>
      <td className="px-4 py-4 text-neutral-600">{caso.aseguradora ?? "—"}</td>
      <td className="px-4 py-4 text-neutral-600">{caso.tipo_seguro ?? "—"}</td>
      <td className="px-4 py-4 text-neutral-600">
        {formatearFechaLarga(caso.fecha_siniestro)}
      </td>
      <td className="px-4 py-4">
        <EstatusBadge estatus={caso.estatus_caso} />
      </td>
    </tr>
  );
}

function EstatusBadge({ estatus }: { estatus: number }) {
  const config: Record<
    number,
    { label: string; tone: "info" | "success" | "danger" }
  > = {
    0: { label: "En proceso", tone: "info" },
    1: { label: "Interrumpido", tone: "danger" },
    3: { label: "Finalizado", tone: "success" },
  };
  const c = config[estatus] ?? {
    label: `Estatus ${estatus}`,
    tone: "info" as const,
  };
  const colorClass =
    c.tone === "success"
      ? "text-state-success"
      : c.tone === "danger"
        ? "text-state-danger"
        : "text-state-info";
  return (
    <span className={cn("text-sm font-semibold", colorClass)}>{c.label}</span>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "flex h-9 min-w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
            p === page
              ? "bg-brand-navy text-white"
              : "text-brand-navy hover:bg-neutral-200",
          )}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-9 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 disabled:opacity-40"
        aria-label="Siguiente página"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
