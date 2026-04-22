"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import type { ArchivoAdjunto } from "@/lib/mocks";

type Props = {
  initial: ArchivoAdjunto[];
};

export function ArchivosTable({ initial }: Props) {
  const [rows, setRows] = useState<ArchivoAdjunto[]>(initial);

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-brand-navy text-sm font-semibold">
        Archivos adjuntos
      </h3>

      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <div className="grid grid-cols-[60px_1fr_1fr_auto] bg-blue-50 px-4 py-2.5 text-xs font-semibold text-neutral-600">
          <div>#</div>
          <div>Nombre del archivo</div>
          <div>Fecha de creación</div>
          <div className="w-24" />
        </div>
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={`grid grid-cols-[60px_1fr_1fr_auto] items-center px-4 py-3 text-sm ${
              i !== rows.length - 1 ? "border-b border-neutral-100" : ""
            }`}
          >
            <div className="text-neutral-600">{i + 1}</div>
            <div className="text-brand-navy">{row.nombre}</div>
            <div className="text-neutral-600">{row.fechaCreacion}</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="bg-brand-navy hover:bg-brand-navy-hover flex h-8 w-8 items-center justify-center rounded-full text-white"
                aria-label="Editar"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))}
                className="bg-brand-navy hover:bg-brand-navy-hover flex h-8 w-8 items-center justify-center rounded-full text-white"
                aria-label="Eliminar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
