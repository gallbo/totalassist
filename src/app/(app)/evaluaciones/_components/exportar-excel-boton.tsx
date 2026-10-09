"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { BrandButton } from "@/components/ui/brand-button";

const URL_EXPORTAR = "/api/proxy/skipper/api/brokers/feedback/exportar";

export function ExportarExcelBoton() {
  const [descargando, setDescargando] = useState(false);

  const onExportar = async () => {
    setDescargando(true);
    try {
      const res = await fetch(URL_EXPORTAR, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));

      const archivo = await res.blob();
      const url = URL.createObjectURL(archivo);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `evaluaciones-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(
        "No pudimos generar el archivo de Excel. Intenta de nuevo en unos segundos.",
      );
    } finally {
      setDescargando(false);
    }
  };

  return (
    <BrandButton
      type="button"
      tone="secondary"
      onClick={onExportar}
      disabled={descargando}
      className="w-full gap-2 px-5 sm:w-auto"
    >
      {descargando ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-4 w-4" />
      )}
      {descargando ? "Generando…" : "Exportar a Excel"}
    </BrandButton>
  );
}
