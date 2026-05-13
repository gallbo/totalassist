"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  ExternalLink,
  File as FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatearFechaLarga } from "@/lib/fecha";
import type { CasoArchivo, CasoDetalle } from "@/lib/api/brokers";
import { borrarArchivoCasoAction, subirArchivoCasoAction } from "../_actions";
import { CompartirCasoModal } from "./compartir-caso-modal";

const TAMANO_MAX = 10 * 1024 * 1024;

const ESTATUS_LABELS: Record<number, string> = {
  0: "En proceso",
  1: "Interrumpido",
  3: "Finalizado",
};

export function CasoDetalleVista({ caso }: { caso: CasoDetalle }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [borrandoId, setBorrandoId] = useState<number | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const onSubirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > TAMANO_MAX) {
      toast.error("El archivo supera el límite de 10 MB.");
      setFileInputKey((k) => k + 1);
      return;
    }
    const fd = new FormData();
    fd.append("archivo", f);
    startTransition(async () => {
      const result = await subirArchivoCasoAction(caso.id, fd);
      setFileInputKey((k) => k + 1);
      if (result.ok) {
        toast.success("Archivo subido.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const onBorrarArchivo = (archivoId: number) => {
    setBorrandoId(archivoId);
    startTransition(async () => {
      const result = await borrarArchivoCasoAction(caso.id, archivoId);
      setBorrandoId(null);
      if (result.ok) {
        toast.success("Archivo eliminado.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-brand-navy text-xl font-bold">
          {caso.folio ? `Folio ${caso.folio}` : `Caso #${caso.id}`}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-state-info text-base font-semibold">
            {ESTATUS_LABELS[caso.estatus_caso] ??
              `Estatus ${caso.estatus_caso}`}
          </span>
          <Tooltip label="Editar">
            <Button
              variant="outline"
              aria-label="Editar"
              className="text-brand-navy inline-flex size-9 items-center justify-center rounded-full bg-white p-0 ring-1 ring-neutral-200 hover:bg-neutral-50"
              render={<Link href={`/casos/${caso.id}/editar`} />}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </Tooltip>
          <CompartirCasoModal casoId={caso.id} correoCliente={caso.correo} />
        </div>
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
        <Dato label="Monto estimado">
          {caso.monto_estimado != null
            ? `$${Number(caso.monto_estimado).toLocaleString("es-MX")}`
            : "—"}
        </Dato>
        <Dato label="Estado">{caso.estado ?? "—"}</Dato>
        <Dato label="Paquete">{caso.paquete?.descripcion ?? "—"}</Dato>
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="text-brand-navy text-base font-bold">
          Información general
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {caso.tipo_persona === "fisica" ? (
            <Dato label="Nombre">{caso.nombre ?? "—"}</Dato>
          ) : (
            <>
              <Dato label="Razón social">
                {caso.nombre_empresa ?? caso.nombre ?? "—"}
              </Dato>
              <Dato label="Nombre comercial">
                {caso.nombre_comercial ?? "—"}
              </Dato>
              <Dato label="Representante">
                {caso.nombre_representante ?? "—"}
              </Dato>
            </>
          )}
          <Dato label="RFC">{caso.rfc ?? "—"}</Dato>
          <Dato label="Correo">{caso.correo ?? "—"}</Dato>
          <Dato label="Teléfono">{caso.telefono ?? "—"}</Dato>
        </div>
      </section>

      <section className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
        <h2 className="text-brand-navy text-base font-bold">Dirección</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Dato label="Domicilio">{caso.domicilio ?? "—"}</Dato>
          <Dato label="Estado">{caso.estado ?? "—"}</Dato>
          <Dato label="Ciudad">{caso.ciudad ?? "—"}</Dato>
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
            {caso.contactos_atencion.map((c) => (
              <li
                key={c.id ?? c.nombre}
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
            {caso.beneficiarios.map((b) => (
              <li
                key={b.id ?? b.nombre}
                className="rounded-md border border-neutral-200 px-4 py-2 text-sm"
              >
                <div className="text-brand-navy font-medium">{b.nombre}</div>
                <div className="text-xs text-neutral-600">
                  {[
                    b.parentesco,
                    b.porcentaje != null ? `${b.porcentaje}%` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Sin detalles"}
                </div>
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
            {caso.archivos.map((a) => (
              <ArchivoCard
                key={a.id}
                archivo={a}
                onBorrar={() => onBorrarArchivo(a.id)}
                borrando={borrandoId === a.id && isPending}
              />
            ))}
          </div>
        )}

        <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-sm text-neutral-600 hover:bg-neutral-50">
          <Upload className="mr-2 h-5 w-5" />
          <span>{isPending ? "Procesando…" : "Subir archivo (máx 10 MB)"}</span>
          <input
            key={fileInputKey}
            type="file"
            className="sr-only"
            disabled={isPending}
            onChange={onSubirArchivo}
          />
        </label>
      </section>

      <div className="flex justify-end border-t border-neutral-200 pt-6">
        <Button
          variant="outline"
          className="bg-brand-navy hover:bg-brand-navy-hover h-11 rounded-full px-6 text-white hover:text-white"
          render={<Link href="/casos" />}
        >
          Volver a casos
        </Button>
      </div>
    </div>
  );
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

type ArchivoCardProps = {
  archivo: CasoArchivo;
  onBorrar: () => void;
  borrando: boolean;
};

function ArchivoCard({ archivo, onBorrar, borrando }: ArchivoCardProps) {
  const [openVisor, setOpenVisor] = useState(false);
  const tipo = clasificarArchivo(archivo);
  const tamano = archivo.tamano
    ? archivo.tamano > 1024 * 1024
      ? `${(archivo.tamano / 1024 / 1024).toFixed(1)} MB`
      : `${(archivo.tamano / 1024).toFixed(0)} KB`
    : null;

  // Solo imagenes admiten lightbox interno. Dropbox bloquea iframe-embedding
  // de PDFs (X-Frame-Options) y los visores nativos del browser ya abren el
  // PDF en una pestaña nueva al usar el botón "Abrir".
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
            <button
              type="button"
              onClick={onBorrar}
              disabled={borrando}
              className={cn(
                "ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50",
                borrando && "opacity-60",
              )}
              aria-label="Borrar"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {borrando ? "…" : "Borrar"}
            </button>
          </div>
        </div>
      </div>

      {openVisor && archivo.url && (
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
            {tipo === "imagen" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={archivo.url}
                alt={archivo.nombre_original}
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
              />
            ) : tipo === "pdf" ? (
              <iframe
                src={archivo.url}
                title={archivo.nombre_original}
                className="h-[85vh] w-[90vw] max-w-5xl rounded-lg bg-white"
              />
            ) : null}
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
