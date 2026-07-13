"use client";

import { useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";

export type PromotoriaRow = {
  id: string;
  nombre_promotor: string;
  nombre_promotoria: string;
  correo_promotor: string;
  telefono_promotor: string;
};

type Props = {
  title: string;
  value?: PromotoriaRow[];
  onChange?: (rows: PromotoriaRow[]) => void;
  disabled?: boolean;
};

const VACIO: PromotoriaRow = {
  id: "",
  nombre_promotor: "",
  nombre_promotoria: "",
  correo_promotor: "",
  telefono_promotor: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PromotoriasTable({
  title,
  value,
  onChange,
  disabled = false,
}: Props) {
  const [internal, setInternal] = useState<PromotoriaRow[]>([]);
  const [draft, setDraft] = useState<PromotoriaRow>({ ...VACIO });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errores, setErrores] = useState<{
    nombre_promotor?: string;
    nombre_promotoria?: string;
    correo_promotor?: string;
  }>({});

  const rows = value ?? internal;

  const updateRows = (next: PromotoriaRow[]) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const addOrUpdate = () => {
    const next: typeof errores = {};
    if (!draft.nombre_promotor.trim()) {
      next.nombre_promotor = "Captura el nombre del promotor.";
    }
    if (!draft.nombre_promotoria.trim()) {
      next.nombre_promotoria = "Captura el nombre de la promotoría.";
    }
    const correo = draft.correo_promotor.trim();
    if (correo && !EMAIL_RE.test(correo)) {
      next.correo_promotor = "El correo no tiene un formato válido.";
    }
    setErrores(next);
    if (Object.keys(next).length > 0) {
      return;
    }

    const limpio: PromotoriaRow = {
      ...draft,
      nombre_promotor: draft.nombre_promotor.trim(),
      nombre_promotoria: draft.nombre_promotoria.trim(),
      correo_promotor: correo,
      telefono_promotor: draft.telefono_promotor.trim(),
    };

    if (editingId) {
      updateRows(
        rows.map((row) =>
          row.id === editingId ? { ...limpio, id: editingId } : row,
        ),
      );
      setEditingId(null);
    } else {
      updateRows([...rows, { ...limpio, id: `row-${Date.now()}` }]);
    }
    setDraft({ ...VACIO });
  };

  const edit = (row: PromotoriaRow) => {
    setEditingId(row.id);
    setDraft(row);
    setErrores({});
  };

  const remove = (id: string) => {
    updateRows(rows.filter((row) => row.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDraft({ ...VACIO });
      setErrores({});
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-brand-navy text-sm font-semibold">{title}</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">Nombre del promotor</span>
          <Input
            value={draft.nombre_promotor}
            disabled={disabled}
            onChange={(e) =>
              setDraft({ ...draft, nombre_promotor: e.target.value })
            }
          />
          {errores.nombre_promotor && (
            <span className="text-state-danger text-xs">
              {errores.nombre_promotor}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">
            Nombre de la promotoría
          </span>
          <Input
            value={draft.nombre_promotoria}
            disabled={disabled}
            onChange={(e) =>
              setDraft({ ...draft, nombre_promotoria: e.target.value })
            }
          />
          {errores.nombre_promotoria && (
            <span className="text-state-danger text-xs">
              {errores.nombre_promotoria}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">Correo del promotor</span>
          <Input
            type="email"
            value={draft.correo_promotor}
            disabled={disabled}
            onChange={(e) =>
              setDraft({ ...draft, correo_promotor: e.target.value })
            }
          />
          {errores.correo_promotor && (
            <span className="text-state-danger text-xs">
              {errores.correo_promotor}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">
            Teléfono del promotor
          </span>
          <Input
            value={draft.telefono_promotor}
            disabled={disabled}
            onChange={(e) =>
              setDraft({ ...draft, telefono_promotor: e.target.value })
            }
          />
        </label>
      </div>

      <div>
        <BrandButton
          type="button"
          tone="secondary"
          onClick={addOrUpdate}
          className="h-11 w-full px-6 sm:w-auto"
          disabled={disabled}
        >
          <Plus className="mr-1 h-4 w-4" />
          {editingId ? "Guardar promotoría" : "Agregar promotoría"}
        </BrandButton>
      </div>

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <div className="hidden grid-cols-[2fr_2fr_2fr_1.5fr_auto] bg-blue-50 px-4 py-2.5 text-xs font-semibold text-neutral-600 md:grid">
            <div>Promotor</div>
            <div>Promotoría</div>
            <div>Correo</div>
            <div>Teléfono</div>
            <div className="w-24" />
          </div>
          {rows.map((row, i) => (
            <div
              key={row.id}
              className={`grid grid-cols-1 gap-2 px-4 py-3 text-sm md:grid-cols-[2fr_2fr_2fr_1.5fr_auto] md:items-center md:gap-0 ${
                i !== rows.length - 1 ? "border-b border-neutral-100" : ""
              }`}
            >
              <div className="text-brand-navy">{row.nombre_promotor}</div>
              <div className="text-neutral-600">{row.nombre_promotoria}</div>
              <div className="text-neutral-600">
                {row.correo_promotor || "—"}
              </div>
              <div className="text-neutral-600">
                {row.telefono_promotor || "—"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => edit(row)}
                  disabled={disabled}
                  className="bg-brand-navy hover:bg-brand-navy-hover flex h-8 w-8 items-center justify-center rounded-full text-white disabled:opacity-50"
                  aria-label="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  disabled={disabled}
                  className="bg-brand-navy hover:bg-brand-navy-hover flex h-8 w-8 items-center justify-center rounded-full text-white disabled:opacity-50"
                  aria-label="Eliminar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
