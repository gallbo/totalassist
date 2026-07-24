"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CasoPublico, DocumentosResponse } from "@/lib/api/publico";
import { SeguimientoCliente } from "./seguimiento-cliente";
import { DocumentosAsegurado } from "./documentos-asegurado";
import { Evaluacion } from "./evaluacion";

type Props = {
  caso: CasoPublico;
  token: string;
  documentos: DocumentosResponse;
  evaluacion: React.ComponentProps<typeof Evaluacion>["evaluacionInicial"];
  muestraEvaluacion: boolean;
};

type Ceja = "estatus" | "documentos";

export function SeguimientoTabs({
  caso,
  token,
  documentos,
  evaluacion,
  muestraEvaluacion,
}: Props) {
  const [ceja, setCeja] = useState<Ceja>("estatus");

  const pendientes = documentos.grupos.reduce(
    (acc, g) =>
      acc + g.documentos.filter((d) => d.estado === "pendiente").length,
    0,
  );

  // Caso cerrado (interrumpido o finalizado): el asegurado ya no sube documentos.
  const casoCerrado = [1, 3].includes(caso.estatus.id);

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="flex gap-2 border-b border-neutral-200">
        <CejaBtn activo={ceja === "estatus"} onClick={() => setCeja("estatus")}>
          Estatus de la reclamación
        </CejaBtn>
        <CejaBtn
          activo={ceja === "documentos"}
          onClick={() => setCeja("documentos")}
        >
          Documentos
          {pendientes > 0 && (
            <span className="bg-brand-yellow text-brand-navy ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold">
              {pendientes}
            </span>
          )}
        </CejaBtn>
      </div>

      {ceja === "estatus" ? (
        <SeguimientoCliente
          caso={caso}
          slotEvaluacion={
            muestraEvaluacion ? (
              <Evaluacion token={token} evaluacionInicial={evaluacion} />
            ) : null
          }
        />
      ) : (
        <DocumentosAsegurado
          token={token}
          documentos={documentos}
          casoCerrado={casoCerrado}
        />
      )}
    </div>
  );
}

function CejaBtn({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activo}
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold transition sm:px-4",
        activo
          ? "border-brand-yellow text-brand-navy"
          : "border-transparent text-neutral-500 hover:text-neutral-700",
      )}
    >
      {children}
    </button>
  );
}
