"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import type { DocumentoPublico, GrupoDocumentos } from "@/lib/api/publico";
import { subirDocumentoAction } from "../_actions";

const TAMANO_MAX = 10 * 1024 * 1024;

export function DocumentosAsegurado({
  token,
  grupos,
}: {
  token: string;
  grupos: GrupoDocumentos[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fileInputKey, setFileInputKey] = useState(0);

  const onSubir = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const gruposConDocumentos = grupos.filter((g) => g.documentos.length > 0);

  return (
    <section className="flex flex-col gap-4 border-t border-neutral-200 pt-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-brand-navy text-base font-bold">Tus documentos</h2>
        <p className="text-sm text-neutral-600">
          Aquí ves los documentos que te corresponden y puedes enviar los que
          tengas a la mano.
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.documentos.map((d) => (
                  <DocCard key={d.id} documento={d} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          Aún no hay documentos. Cuando envíes uno aparecerá aquí.
        </p>
      )}

      <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-sm text-neutral-600 hover:bg-neutral-50">
        <Upload className="mr-2 h-5 w-5" />
        <span>
          {isPending ? "Enviando…" : "Enviar un documento (máx 10 MB)"}
        </span>
        <input
          key={fileInputKey}
          type="file"
          className="sr-only"
          disabled={isPending}
          onChange={onSubir}
        />
      </label>
    </section>
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
