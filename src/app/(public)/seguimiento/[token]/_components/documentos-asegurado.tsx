"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type {
  DocumentoChecklist,
  DocumentoPublico,
  DocumentosResponse,
} from "@/lib/api/publico";
import { formatearFechaLarga } from "@/lib/fecha";
import { subirDocumentoAction } from "../_actions";

const TAMANO_MAX = 10 * 1024 * 1024;

export function DocumentosAsegurado({
  token,
  documentos,
  casoCerrado = false,
}: {
  token: string;
  documentos: DocumentosResponse;
  casoCerrado?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fileInputKey, setFileInputKey] = useState(0);

  const subir = (file: File, documentoCasoId?: number) => {
    if (casoCerrado) return;
    if (file.size > TAMANO_MAX) {
      toast.error("El archivo supera el límite de 10 MB.");
      setFileInputKey((k) => k + 1);
      return;
    }
    const fd = new FormData();
    fd.append("archivo", file);
    if (documentoCasoId) {
      fd.append("documento_caso_id", String(documentoCasoId));
    }
    startTransition(async () => {
      const result = await subirDocumentoAction(token, fd);
      setFileInputKey((k) => k + 1);
      if (result.ok) {
        toast.success("Documento enviado.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const gruposConDocumentos = documentos.grupos.filter(
    (g) => g.documentos.length > 0,
  );
  const pendientes = gruposConDocumentos.reduce(
    (acc, g) =>
      acc + g.documentos.filter((d) => d.estado === "pendiente").length,
    0,
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-brand-navy text-base font-bold">Tus documentos</h2>
        <p className="text-sm text-neutral-600">
          {pendientes > 0
            ? `Tienes ${pendientes} documento${pendientes === 1 ? "" : "s"} pendiente${pendientes === 1 ? "" : "s"} de enviar para avanzar con tu reclamación.`
            : "Aquí ves los documentos de tu reclamación y puedes enviar los que tengas a la mano."}
        </p>
      </div>

      {gruposConDocumentos.length > 0 ? (
        <div className="flex flex-col gap-5">
          {gruposConDocumentos.map((g) => (
            <div
              key={g.cobertura_id ?? "general"}
              className="flex flex-col gap-2"
            >
              <h3 className="text-brand-navy/70 text-xs font-semibold tracking-wide uppercase">
                {g.cobertura}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {g.documentos.map((d) => (
                  <ChecklistCard
                    key={d.id}
                    documento={d}
                    disabled={isPending}
                    bloqueado={casoCerrado}
                    fileInputKey={fileInputKey}
                    onSubir={(file) => subir(file, d.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          Por ahora no tienes documentos asignados. Tu broker te avisará cuando
          haga falta algo.
        </p>
      )}

      {documentos.otros.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-brand-navy/70 text-xs font-semibold tracking-wide uppercase">
            Otros documentos que enviaste
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documentos.otros.map((d) => (
              <DocCard key={d.id} documento={d} />
            ))}
          </div>
        </div>
      ) : null}

      {casoCerrado ? (
        <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          Tu caso ya está cerrado. Estos documentos quedan como constancia y ya
          no es posible enviar nuevos.
        </p>
      ) : (
        <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-sm text-neutral-600 hover:bg-neutral-50">
          <Upload className="mr-2 h-5 w-5" />
          <span>
            {isPending ? "Enviando…" : "Enviar otro documento (máx 10 MB)"}
          </span>
          <input
            key={fileInputKey}
            type="file"
            className="sr-only"
            disabled={isPending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) subir(f);
            }}
          />
        </label>
      )}
    </section>
  );
}

function ChecklistCard({
  documento,
  disabled,
  bloqueado,
  fileInputKey,
  onSubir,
}: {
  documento: DocumentoChecklist;
  disabled: boolean;
  bloqueado: boolean;
  fileInputKey: number;
  onSubir: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const entregado = documento.estado === "entregado";

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border bg-white p-3 ${
        entregado ? "border-green-200" : "border-neutral-200"
      }`}
    >
      <div className="flex items-start gap-2">
        {entregado ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        ) : (
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-brand-navy text-sm font-medium">
            {documento.nombre}
          </div>
          <div className="mt-0.5 text-xs text-neutral-500">
            {entregado
              ? `Entregado${documento.fecha_entrega ? ` el ${formatearFechaLarga(documento.fecha_entrega)}` : ""}`
              : documento.fecha_compromiso
                ? `Entrégalo antes del ${formatearFechaLarga(documento.fecha_compromiso)}`
                : "Pendiente de enviar"}
          </div>
          {documento.observaciones ? (
            <div className="mt-1 text-xs text-neutral-600 italic">
              {documento.observaciones}
            </div>
          ) : null}
        </div>
      </div>

      {entregado && documento.archivo?.url ? (
        <a
          href={documento.archivo.url}
          target="_blank"
          rel="noreferrer"
          className="text-brand-navy inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-neutral-100"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Ver lo que enviaste
        </a>
      ) : null}

      {!entregado && !bloqueado ? (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="bg-brand-navy inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {disabled ? "Enviando…" : "Subir este documento"}
          </button>
          <input
            key={fileInputKey}
            ref={inputRef}
            type="file"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onSubir(f);
            }}
          />
        </>
      ) : null}
    </div>
  );
}

function DocCard({ documento }: { documento: DocumentoPublico }) {
  const ext = documento.nombre_original.split(".").pop()?.toLowerCase() ?? "";
  const mime = (documento.mime_type ?? "").toLowerCase();
  const esImagen =
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  const esPdf = mime === "application/pdf" || ext === "pdf";
  const tamano = documento.tamano
    ? documento.tamano > 1024 * 1024
      ? `${(documento.tamano / 1024 / 1024).toFixed(1)} MB`
      : `${(documento.tamano / 1024).toFixed(0)} KB`
    : null;
  const label = esImagen ? "Ver" : esPdf ? "Abrir" : "Descargar";
  const Icono = esImagen || esPdf ? ExternalLink : Download;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3">
      <div className="flex items-start gap-2">
        <FileText className="text-brand-navy/50 mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <div className="text-brand-navy truncate text-sm font-medium">
            {documento.nombre_original}
          </div>
          <div className="text-xs text-neutral-500">
            {documento.tipo_documento ?? "Documento"}
            {tamano ? ` · ${tamano}` : ""}
          </div>
        </div>
      </div>
      {documento.url && (
        <a
          href={documento.url}
          target="_blank"
          rel="noreferrer"
          className="text-brand-navy inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-neutral-100"
        >
          <Icono className="h-3.5 w-3.5" />
          {label}
        </a>
      )}
    </div>
  );
}
