"use client";

import { cn } from "@/lib/utils";
import { formatearFechaLarga } from "@/lib/fecha";
import { EtapasCobertura } from "@/components/domain/etapas-cobertura";
import type { CasoPublico } from "@/lib/api/publico";

const ESTATUS_TONO: Record<number, string> = {
  0: "text-state-info",
  1: "text-state-error",
  3: "text-state-success",
};

export function SeguimientoCliente({ caso }: { caso: CasoPublico }) {
  const tono = ESTATUS_TONO[caso.estatus.id] ?? "text-state-info";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-brand-navy text-xl font-bold">
          {caso.folio ? `Folio ${caso.folio}` : "Seguimiento de tu caso"}
        </h1>
        <span className={cn("text-base font-semibold", tono)}>
          {caso.estatus.label}
        </span>
      </div>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 border-y border-neutral-200 py-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Dato label="Tipo de persona">
          {caso.tipo_persona === "fisica" ? "Persona física" : "Persona moral"}
        </Dato>
        <Dato label="Aseguradora">{caso.aseguradora ?? "—"}</Dato>
        <Dato label="Tipo de seguro">{caso.tipo_seguro ?? "—"}</Dato>
        <Dato label="Folio de la póliza">{caso.folio_poliza ?? "—"}</Dato>
        <Dato label="Fecha del siniestro">
          {formatearFechaLarga(caso.fecha_siniestro)}
        </Dato>
        <Dato label="Número de siniestro">
          {caso.num_siniestro_poliza ?? "—"}
        </Dato>
        <Dato label="Monto estimado (MXN)">
          {formatearMonto(caso.monto_estimado)}
        </Dato>
        <Dato label="Estado">{caso.direccion.estado ?? "—"}</Dato>
      </dl>

      {/* Etapas del proceso por cobertura (las planea el equipo de Total Claim Assist) */}
      <EtapasCobertura coberturas={caso.coberturas} />

      <section className="flex flex-col gap-3">
        <h2 className="text-brand-navy text-base font-bold">
          {caso.tipo_persona === "fisica"
            ? "Información personal"
            : "Información"}
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {caso.tipo_persona === "fisica" ? (
            <>
              <Dato label="Nombre completo">
                {caso.nombre_asegurado ?? "—"}
              </Dato>
              <Dato label="RFC">{caso.rfc ?? "—"}</Dato>
              <Dato label="Correo">{caso.correo ?? "—"}</Dato>
              <Dato label="Teléfono">{caso.telefono ?? "—"}</Dato>
              {caso.celular && <Dato label="Celular">{caso.celular}</Dato>}
            </>
          ) : (
            <>
              <Dato label="Razón social">{caso.nombre_empresa ?? "—"}</Dato>
              <Dato label="Nombre comercial">
                {caso.nombre_comercial ?? "—"}
              </Dato>
              <Dato label="RFC">{caso.rfc ?? "—"}</Dato>
              <Dato label="Representante">
                {caso.nombre_representante ?? "—"}
              </Dato>
              <Dato label="Correo">{caso.correo ?? "—"}</Dato>
              <Dato label="Teléfono">{caso.telefono ?? "—"}</Dato>
              {caso.celular && <Dato label="Celular">{caso.celular}</Dato>}
            </>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
        <h2 className="text-brand-navy text-base font-bold">Dirección</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Dato label="Domicilio">{caso.direccion.domicilio ?? "—"}</Dato>
          <Dato label="Estado">{caso.direccion.estado ?? "—"}</Dato>
          <Dato label="Ciudad">{caso.direccion.ciudad ?? "—"}</Dato>
        </div>
      </section>

      <section className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
        <h2 className="text-brand-navy text-base font-bold">
          Contactos de atención
        </h2>
        {caso.contactos_atencion.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin contactos registrados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {caso.contactos_atencion.map((c, i) => (
              <li
                key={`${c.nombre}-${i}`}
                className="rounded-md border border-neutral-200 px-4 py-2 text-sm"
              >
                <div className="text-brand-navy font-medium">{c.nombre}</div>
                <div className="text-xs text-neutral-600">
                  {[c.telefono, c.email].filter(Boolean).join(" · ") ||
                    "Sin contacto"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {caso.beneficiarios.length > 0 && (
        <section className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
          <h2 className="text-brand-navy text-base font-bold">Beneficiarios</h2>
          <ul className="flex flex-col gap-2">
            {caso.beneficiarios.map((b, i) => (
              <li
                key={`${b.nombre}-${i}`}
                className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 px-4 py-2 text-sm"
              >
                <div>
                  <div className="text-brand-navy font-medium">{b.nombre}</div>
                  {b.parentesco && (
                    <div className="text-xs text-neutral-600">
                      {b.parentesco}
                    </div>
                  )}
                </div>
                {b.porcentaje != null && (
                  <span className="text-brand-navy text-sm font-semibold">
                    {b.porcentaje}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function formatearMonto(monto: string | number | null): string {
  if (monto == null) return "—";
  const valor = typeof monto === "string" ? Number(monto) : monto;
  if (!Number.isFinite(valor)) return "—";
  return `$${valor.toLocaleString("es-MX")}`;
}

function Dato({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="text-brand-navy font-medium">{children}</dd>
    </div>
  );
}
