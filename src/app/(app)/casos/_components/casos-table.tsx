"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import { CasoEstatusBadge } from "@/components/domain/caso-estatus-badge";
import { cn } from "@/lib/utils";
import type { Caso, CasoEstatus } from "@/lib/mocks";

const PAGE_SIZE = 8;

const ESTATUS_OPTIONS: Array<{ value: CasoEstatus | "todos"; label: string }> =
  [
    { value: "todos", label: "Todos" },
    { value: "en-proceso", label: "En proceso" },
    { value: "interrumpido", label: "Interrumpido" },
    { value: "indemnizado", label: "Indemnizado" },
    { value: "finalizado", label: "Finalizado" },
  ];

type Props = { casos: Caso[] };

export function CasosTable({ casos }: Props) {
  const [query, setQuery] = useState("");
  const [estatusFiltro, setEstatusFiltro] = useState<CasoEstatus | "todos">(
    "todos",
  );
  const [estatusOpen, setEstatusOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return casos.filter((c) => {
      const matchesQuery =
        !q ||
        c.folio.toLowerCase().includes(q) ||
        c.asegurado.toLowerCase().includes(q) ||
        c.poliza.toLowerCase().includes(q) ||
        c.aseguradora.toLowerCase().includes(q);
      const matchesEstatus =
        estatusFiltro === "todos" || c.estatus === estatusFiltro;
      return matchesQuery && matchesEstatus;
    });
  }, [casos, query, estatusFiltro]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-brand-navy text-lg font-bold">
        {filtered.length} casos
      </h1>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar por folio, asegurado, póliza o aseguradora"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="h-12 rounded-full bg-neutral-200 pl-11"
          />
        </div>

        <div className="flex gap-3">
          <BrandButton
            render={<Link href="/casos/nuevo" />}
            className="h-11 px-6"
          >
            <Plus className="mr-1 h-4 w-4" /> Nuevo caso
          </BrandButton>

          <div className="relative">
            <BrandButton
              tone="secondary"
              className="h-11 px-6"
              onClick={() => setEstatusOpen((o) => !o)}
            >
              Estatus
            </BrandButton>
            {estatusOpen && (
              <div className="absolute top-full right-0 z-20 mt-2 w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                {ESTATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setEstatusFiltro(opt.value);
                      setEstatusOpen(false);
                      setPage(1);
                    }}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-sm hover:bg-neutral-50",
                      estatusFiltro === opt.value &&
                        "text-brand-navy font-semibold",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
                Póliza
              </th>
              <th className="px-4 py-3 font-semibold text-neutral-600">
                Aseguradora
              </th>
              <th className="px-4 py-3 font-semibold text-neutral-600">Tipo</th>
              <th className="px-4 py-3 font-semibold text-neutral-600">
                Tiempo
              </th>
              <th className="px-4 py-3 font-semibold text-neutral-600">
                Etapa
              </th>
              <th className="rounded-r-full px-4 py-3 font-semibold text-neutral-600">
                Estatus
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c, i) => (
              <tr
                key={c.id}
                className="border-b border-neutral-100 transition-colors hover:bg-neutral-50"
              >
                <td className="px-4 py-4 text-center text-neutral-600">
                  {(currentPage - 1) * PAGE_SIZE + i + 1}
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/casos/${c.id}`}
                    className="text-brand-navy hover:underline"
                  >
                    {c.folio}
                  </Link>
                </td>
                <td className="px-4 py-4">{c.asegurado}</td>
                <td className="px-4 py-4 text-neutral-600">{c.poliza}</td>
                <td className="px-4 py-4">{c.aseguradora}</td>
                <td className="px-4 py-4">{c.tipo}</td>
                <td className="px-4 py-4 text-neutral-600">
                  {c.tiempoDias} días
                </td>
                <td className="px-4 py-4 text-neutral-600">{c.etapaLabel}</td>
                <td className="px-4 py-4">
                  <CasoEstatusBadge estatus={c.estatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {paginated.map((c) => (
          <Link
            key={c.id}
            href={`/casos/${c.id}`}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-neutral-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-brand-navy font-semibold">{c.folio}</span>
              <ChevronRight className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm">{c.asegurado}</span>
              <CasoEstatusBadge estatus={c.estatus} />
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
              <span>{c.aseguradora}</span>
              <span>·</span>
              <span>{c.tipo}</span>
              <span>·</span>
              <span>{c.tiempoDias} días</span>
            </div>
          </Link>
        ))}
      </div>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onChange={setPage}
      />
    </div>
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
