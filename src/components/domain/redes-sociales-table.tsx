"use client";

import { useState } from "react";
import { Globe, Pencil, Plus, X, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import {
  REDES_SOCIALES_VALORES,
  type RedSocialCodigo,
} from "@/lib/api/brokers";

export type RedSocialRow = {
  id: string;
  red_social: RedSocialCodigo;
  usuario: string;
};

// lucide-react v1 ya no incluye iconos de marca; usamos `Globe` como icono
// generico y el label desambigua. Si en el futuro se agrega una libreria con
// brand icons (react-icons o simple-icons), se puede swapear el `icon` aqui.
export const REDES_SOCIALES_META: Record<
  RedSocialCodigo,
  { label: string; icon: LucideIcon; placeholder: string }
> = {
  facebook: { label: "Facebook", icon: Globe, placeholder: "@miempresa o URL" },
  instagram: { label: "Instagram", icon: Globe, placeholder: "@miempresa" },
  linkedin: { label: "LinkedIn", icon: Globe, placeholder: "URL del perfil" },
  x: { label: "X (Twitter)", icon: Globe, placeholder: "@miempresa" },
  tiktok: { label: "TikTok", icon: Globe, placeholder: "@miempresa" },
  youtube: { label: "YouTube", icon: Globe, placeholder: "@micanal o URL" },
  whatsapp: { label: "WhatsApp", icon: Globe, placeholder: "+52 55 1234 5678" },
  sitio_web: { label: "Sitio web", icon: Globe, placeholder: "https://..." },
  otra: { label: "Otra", icon: Globe, placeholder: "Usuario o URL" },
};

type Props = {
  title: string;
  value?: RedSocialRow[];
  onChange?: (rows: RedSocialRow[]) => void;
  disabled?: boolean;
};

const filledInput = "border-brand-navy/30 bg-transparent";

export function RedesSocialesTable({
  title,
  value,
  onChange,
  disabled = false,
}: Props) {
  const [internal, setInternal] = useState<RedSocialRow[]>([]);
  const [redSocial, setRedSocial] = useState<RedSocialCodigo>("facebook");
  const [usuario, setUsuario] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const rows = value ?? internal;

  const updateRows = (next: RedSocialRow[]) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const addOrUpdate = () => {
    if (!usuario.trim()) return;
    if (editingId) {
      updateRows(
        rows.map((row) =>
          row.id === editingId
            ? { ...row, red_social: redSocial, usuario: usuario.trim() }
            : row,
        ),
      );
      setEditingId(null);
    } else {
      updateRows([
        ...rows,
        {
          id: `row-${Date.now()}`,
          red_social: redSocial,
          usuario: usuario.trim(),
        },
      ]);
    }
    setRedSocial("facebook");
    setUsuario("");
  };

  const edit = (row: RedSocialRow) => {
    setEditingId(row.id);
    setRedSocial(row.red_social);
    setUsuario(row.usuario);
  };

  const remove = (id: string) => {
    updateRows(rows.filter((row) => row.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setRedSocial("facebook");
      setUsuario("");
    }
  };

  const placeholder = REDES_SOCIALES_META[redSocial].placeholder;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-brand-navy text-sm font-semibold">{title}</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">Red social</span>
          <select
            value={redSocial}
            disabled={disabled}
            onChange={(e) => setRedSocial(e.target.value as RedSocialCodigo)}
            className={`h-11 rounded-md border px-3 text-sm ${filledInput}`}
          >
            {REDES_SOCIALES_VALORES.map((v) => (
              <option key={v} value={v}>
                {REDES_SOCIALES_META[v].label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">Usuario</span>
          <Input
            value={usuario}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </label>
        <BrandButton
          type="button"
          onClick={addOrUpdate}
          className="h-11"
          disabled={disabled}
        >
          <Plus className="mr-1 h-4 w-4" />
          {editingId ? "Guardar" : "Agregar"}
        </BrandButton>
      </div>

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <div className="grid grid-cols-[1fr_2fr_auto] bg-blue-50 px-4 py-2.5 text-xs font-semibold text-neutral-600">
            <div>Red social</div>
            <div>Usuario</div>
            <div className="w-24" />
          </div>
          {rows.map((row, i) => {
            const Icon = REDES_SOCIALES_META[row.red_social].icon;
            return (
              <div
                key={row.id}
                className={`grid grid-cols-[1fr_2fr_auto] items-center px-4 py-3 text-sm ${
                  i !== rows.length - 1 ? "border-b border-neutral-100" : ""
                }`}
              >
                <div className="text-brand-navy flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {REDES_SOCIALES_META[row.red_social].label}
                </div>
                <div className="break-all text-neutral-600">{row.usuario}</div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
