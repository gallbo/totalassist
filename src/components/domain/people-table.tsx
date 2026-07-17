"use client";

import { useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";

export type PeopleRow = {
  id: string;
  nombre: string;
  telefono: string;
};

type Props = {
  title: string;
  initial?: PeopleRow[];
  value?: PeopleRow[];
  onChange?: (rows: PeopleRow[]) => void;
  disabled?: boolean;
};

export function PeopleTable({
  title,
  initial = [],
  value,
  onChange,
  disabled = false,
}: Props) {
  const [internal, setInternal] = useState<PeopleRow[]>(initial);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const rows = value ?? internal;

  const updateRows = (next: PeopleRow[]) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const addOrUpdate = () => {
    if (!nombre.trim() || !telefono.trim()) return;
    if (editingId) {
      updateRows(
        rows.map((row) =>
          row.id === editingId ? { ...row, nombre, telefono } : row,
        ),
      );
      setEditingId(null);
    } else {
      updateRows([...rows, { id: `row-${Date.now()}`, nombre, telefono }]);
    }
    setNombre("");
    setTelefono("");
  };

  const edit = (row: PeopleRow) => {
    setEditingId(row.id);
    setNombre(row.nombre);
    setTelefono(row.telefono);
  };

  const remove = (id: string) => {
    updateRows(rows.filter((row) => row.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setNombre("");
      setTelefono("");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-brand-navy text-sm font-semibold">{title}</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">Nombre</span>
          <Input
            value={nombre}
            disabled={disabled}
            onChange={(e) => setNombre(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">Teléfono</span>
          <Input
            value={telefono}
            disabled={disabled}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </label>
        <BrandButton
          type="button"
          tone="secondary"
          onClick={addOrUpdate}
          className="h-11 w-full md:w-auto"
          disabled={disabled}
        >
          <Plus className="mr-1 h-4 w-4" />
          {editingId ? "Guardar" : "Agregar"}
        </BrandButton>
      </div>

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <div className="grid grid-cols-[1fr_1fr_auto] bg-blue-50 px-4 py-2.5 text-xs font-semibold text-neutral-600">
            <div>Nombre</div>
            <div>Teléfono</div>
            <div className="w-24" />
          </div>
          {rows.map((row, i) => (
            <div
              key={row.id}
              className={`grid grid-cols-[1fr_1fr_auto] items-center px-4 py-3 text-sm ${
                i !== rows.length - 1 ? "border-b border-neutral-100" : ""
              }`}
            >
              <div className="text-brand-navy">{row.nombre}</div>
              <div className="text-neutral-600">{row.telefono}</div>
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
