"use client";

import { useState } from "react";
import {
  Download,
  ExternalLink,
  File as FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatearFechaLarga } from "@/lib/fecha";
import { EtapasCobertura } from "@/components/domain/etapas-cobertura";
import type { CasoPublico } from "@/lib/api/publico";

const ESTATUS_TONO: Record<number, string> = {
  0: "text-state-info",
  1: "text-state-error",
  3: "text-state-success",
};

type ArchivoPublico = CasoPublico["archivos"][number];

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

      <section className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
        <h2 className="text-brand-navy text-base font-bold">Archivos</h2>
        {caso.archivos.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin archivos cargados.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {caso.archivos.map((a, i) => (
              <ArchivoCard key={`${a.nombre_original}-${i}`} archivo={a} />
            ))}
          </div>
        )}
      </section>
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

function ArchivoCard({ archivo }: { archivo: ArchivoPublico }) {
  const [openVisor, setOpenVisor] = useState(false);
  const tipo = clasificarArchivo(archivo);
  const tamano = archivo.tamano
    ? archivo.tamano > 1024 * 1024
      ? `${(archivo.tamano / 1024 / 1024).toFixed(1)} MB`
      : `${(archivo.tamano / 1024).toFixed(0)} KB`
    : null;

  const sePuedeVisualizar = tipo === "imagen";
  const labelDescarga = tipo === "pdf" ? "Abrir" : "Descargar";

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="relative flex h-32 items-center justify-center bg-neutral-50">
          {tipo === "imagen" && archivo.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={archivo.url}
              alt={archivo.nombre_original}
              className="h-full w-full cursor-zoom-in object-cover"
              onClick={() => setOpenVisor(true)}
            />
          ) : (
            <IconoTipo tipo={tipo} />
          )}
        </div>
        <div className="flex flex-col gap-2 p-3">
          <div className="text-brand-navy truncate text-sm font-medium">
            {archivo.nombre_original}
          </div>
          <div className="text-xs text-neutral-500">
            {labelTipo(tipo)}
            {tamano ? ` · ${tamano}` : ""}
          </div>
          <div className="mt-1 flex items-center gap-2">
            {sePuedeVisualizar && archivo.url && (
              <button
                type="button"
                onClick={() => setOpenVisor(true)}
                className="text-brand-navy inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-neutral-100"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver
              </button>
            )}
            {archivo.url && (
              <a
                href={archivo.url}
                target="_blank"
                rel="noreferrer"
                className="text-brand-navy inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-neutral-100"
                aria-label={labelDescarga}
              >
                <Download className="h-3.5 w-3.5" />
                {labelDescarga}
              </a>
            )}
          </div>
        </div>
      </div>

      {openVisor && archivo.url && tipo === "imagen" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpenVisor(false)}
        >
          <button
            type="button"
            onClick={() => setOpenVisor(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={archivo.url}
              alt={archivo.nombre_original}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

type TipoArchivo =
  | "imagen"
  | "pdf"
  | "documento"
  | "hoja-calculo"
  | "texto"
  | "otro";

function clasificarArchivo(a: {
  mime_type: string | null;
  nombre_original: string;
}): TipoArchivo {
  const mime = (a.mime_type ?? "").toLowerCase();
  const ext = a.nombre_original.split(".").pop()?.toLowerCase() ?? "";

  if (
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext)
  ) {
    return "imagen";
  }
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    ["xls", "xlsx", "csv"].includes(ext)
  ) {
    return "hoja-calculo";
  }
  if (
    mime.includes("word") ||
    mime.includes("document") ||
    ["doc", "docx", "odt"].includes(ext)
  ) {
    return "documento";
  }
  if (mime.startsWith("text/") || ["txt", "md"].includes(ext)) return "texto";
  return "otro";
}

function labelTipo(tipo: TipoArchivo): string {
  switch (tipo) {
    case "imagen":
      return "Imagen";
    case "pdf":
      return "PDF";
    case "hoja-calculo":
      return "Hoja de cálculo";
    case "documento":
      return "Documento";
    case "texto":
      return "Texto";
    default:
      return "Archivo";
  }
}

function IconoTipo({ tipo }: { tipo: TipoArchivo }) {
  const Icon =
    tipo === "imagen"
      ? FileImage
      : tipo === "pdf" || tipo === "texto" || tipo === "documento"
        ? FileText
        : tipo === "hoja-calculo"
          ? FileSpreadsheet
          : FileIcon;

  const colorClass =
    tipo === "imagen"
      ? "text-emerald-500"
      : tipo === "pdf"
        ? "text-red-500"
        : tipo === "hoja-calculo"
          ? "text-green-600"
          : tipo === "documento"
            ? "text-blue-500"
            : "text-neutral-400";

  return <Icon className={cn("h-12 w-12", colorClass)} strokeWidth={1.25} />;
}
