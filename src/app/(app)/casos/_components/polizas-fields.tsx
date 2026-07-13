"use client";

import {
  useFormState,
  type Control,
  type UseFormRegister,
  type FieldArrayWithId,
} from "react-hook-form";
import { Plus, Trash2, Upload, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import type { NuevoCasoSchema } from "../nuevo/_schema";

type Ctl = Control<NuevoCasoSchema>;
type Reg = UseFormRegister<NuevoCasoSchema>;

export function polizaVacia() {
  return {
    numero_poliza: "",
    moneda: "Moneda Nacional",
    fecha_expedicion: "",
    vigencia_inicio: "",
    vigencia_fin: "",
  };
}

type Props = {
  control: Ctl;
  register: Reg;
  // El field array lo administra el padre para poder correlacionar cada archivo
  // con la póliza creada al guardar. Usa keyName "_key" porque la póliza ya tiene
  // un campo `id` propio (el de Skipper) que no debe pisarse.
  fields: FieldArrayWithId<NuevoCasoSchema, "polizas", "_key">[];
  onAppend: () => void;
  onRemove: (index: number) => void;
  // Archivo seleccionado por póliza, indexado por el id estable del field array.
  files: Record<string, File | null>;
  onFileChange: (fieldId: string, file: File | null) => void;
  // En edición: nombre del archivo ya cargado en Skipper, indexado por el id de
  // la póliza (campo `id` de la fila). Se muestra cuando no hay archivo nuevo.
  archivoActualPorId?: Record<
    number,
    { archivo_nombre: string | null; tiene_archivo: boolean }
  >;
};

const TAMANO_MAX = 10 * 1024 * 1024;

export function PolizasFields({
  control,
  register,
  fields,
  onAppend,
  onRemove,
  files,
  onFileChange,
  archivoActualPorId,
}: Props) {
  const { errors } = useFormState({ control, name: "polizas" });
  const polizasErrors = errors.polizas;

  return (
    <div className="flex flex-col gap-4">
      {fields.map((f, i) => {
        const err = Array.isArray(polizasErrors) ? polizasErrors[i] : undefined;
        const archivoNuevo = files[f._key] ?? null;
        const polizaId = (f as { id?: number }).id;
        const actual =
          polizaId && archivoActualPorId ? archivoActualPorId[polizaId] : null;

        return (
          <div
            key={f._key}
            className="rounded-xl border border-neutral-200 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-brand-navy text-sm font-semibold">
                Póliza {i + 1}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-neutral-500 hover:text-red-600"
                  aria-label={`Eliminar póliza ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Número de póliza *"
                error={err?.numero_poliza?.message}
              >
                <Input {...register(`polizas.${i}.numero_poliza`)} />
              </Field>
              <Field label="Moneda">
                <Input {...register(`polizas.${i}.moneda`)} />
              </Field>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Fecha de expedición">
                <Input
                  type="date"
                  {...register(`polizas.${i}.fecha_expedicion`)}
                />
              </Field>
              <Field label="Inicio de vigencia">
                <Input
                  type="date"
                  {...register(`polizas.${i}.vigencia_inicio`)}
                />
              </Field>
              <Field label="Fin de vigencia" error={err?.vigencia_fin?.message}>
                <Input type="date" {...register(`polizas.${i}.vigencia_fin`)} />
              </Field>
            </div>

            <div className="mt-4">
              <span className="mb-1 block text-xs text-neutral-600">
                Archivo de la póliza
              </span>
              {archivoNuevo ? (
                <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-sm">
                  <span className="truncate">{archivoNuevo.name}</span>
                  <button
                    type="button"
                    onClick={() => onFileChange(f._key, null)}
                    className="text-neutral-500 hover:text-red-600"
                    aria-label="Quitar archivo de la póliza"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  {actual?.tiene_archivo && (
                    <div className="mb-2 flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                      <FileText className="h-4 w-4 text-neutral-500" />
                      <span className="truncate">
                        {actual.archivo_nombre ?? "Archivo cargado"}
                      </span>
                    </div>
                  )}
                  <label className="flex h-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-sm text-neutral-600 hover:bg-neutral-50">
                    <Upload className="mr-2 h-5 w-5" />
                    <span>
                      {actual?.tiene_archivo
                        ? "Reemplazar archivo (máx 10 MB)"
                        : "Sube el archivo de la póliza (máx 10 MB)"}
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (file && file.size > TAMANO_MAX) {
                          e.target.value = "";
                          return;
                        }
                        onFileChange(f._key, file);
                      }}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        );
      })}

      <BrandButton
        type="button"
        tone="secondary"
        className="w-full sm:w-auto sm:self-start"
        onClick={onAppend}
      >
        <Plus className="mr-1 h-4 w-4" />
        Agregar póliza
      </BrandButton>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-neutral-600">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
