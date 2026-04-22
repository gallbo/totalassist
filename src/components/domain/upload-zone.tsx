"use client";

import { useState } from "react";
import { CloudUpload, Link2, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Mode = "archivo" | "dropbox";

type Props = {
  label?: string;
  className?: string;
};

export function UploadZone({ label = "Agregar documento", className }: Props) {
  const [mode, setMode] = useState<Mode>("archivo");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [dragging, setDragging] = useState(false);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h3 className="text-brand-navy text-sm font-semibold">{label}</h3>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("archivo")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
            mode === "archivo"
              ? "bg-brand-navy text-white"
              : "text-brand-navy/70 bg-blue-50",
          )}
        >
          <Paperclip className="h-4 w-4" /> Archivo
        </button>
        <button
          type="button"
          onClick={() => setMode("dropbox")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
            mode === "dropbox"
              ? "bg-brand-navy text-white"
              : "text-brand-navy/70 bg-blue-50",
          )}
        >
          <Link2 className="h-4 w-4" /> Link de Dropbox
        </button>
      </div>

      {mode === "archivo" ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-white px-6 py-10 text-center transition-colors",
            dragging
              ? "border-brand-yellow bg-yellow-50/50"
              : "border-neutral-200 hover:border-neutral-300",
          )}
        >
          <CloudUpload
            className="text-brand-navy h-10 w-10"
            strokeWidth={1.5}
          />
          {file ? (
            <div className="text-brand-navy text-sm font-semibold">
              {file.name}
            </div>
          ) : (
            <>
              <div className="text-brand-navy text-sm">
                Arrastra y suelta tu archivo aquí
              </div>
              <div className="text-xs text-neutral-500">o</div>
              <div className="text-brand-navy text-sm font-semibold">
                Seleccionar archivo
              </div>
            </>
          )}
          <div className="mt-2 text-xs text-neutral-500">
            Tamaño máximo <strong>100MB</strong>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      ) : (
        <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5">
          <label className="text-xs text-neutral-600">
            Pega el link de Dropbox
          </label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://www.dropbox.com/..."
          />
        </div>
      )}
    </div>
  );
}
