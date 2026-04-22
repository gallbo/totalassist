"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { PageCard } from "@/components/layout/page-card";
import { PeopleTable } from "@/components/domain/people-table";
import { UploadZone } from "@/components/domain/upload-zone";
import { cn } from "@/lib/utils";
import { DropdownPill } from "./_components/dropdown-pill";

const TIPOS_SEGURO = ["AUTO", "GASTOS MÉDICOS", "VIDA", "HIPOTECARIO"] as const;
const ASEGURADORAS = ["Qualitas", "AXA", "CHUBB"] as const;

type TipoPersona = "fisica" | "moral";

export default function NuevoCasoPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoPersona>("fisica");
  const [tipoSeguro, setTipoSeguro] = useState<
    (typeof TIPOS_SEGURO)[number] | null
  >(null);
  const [aseguradora, setAseguradora] = useState<
    (typeof ASEGURADORAS)[number] | null
  >(null);

  const submit = () => {
    toast.success("Caso registrado");
    router.push("/casos");
  };

  return (
    <PageCard>
      <div className="flex flex-col gap-6">
        <h1 className="text-brand-navy text-xl font-bold">Registro de caso</h1>

        <div className="grid grid-cols-2 gap-3">
          {(["fisica", "moral"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={cn(
                "h-12 rounded-full text-sm font-semibold transition-colors",
                tipo === t
                  ? "bg-brand-navy text-white"
                  : "text-brand-navy/80 bg-blue-50 hover:bg-blue-100",
              )}
            >
              {t === "fisica" ? "Persona física" : "Persona moral"}
            </button>
          ))}
        </div>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h2 className="text-brand-navy text-base font-bold">
              {tipo === "fisica" ? "Información personal" : "Información"}
            </h2>
            <div className="flex flex-wrap gap-3">
              <DropdownPill
                label="Tipo de seguro"
                options={TIPOS_SEGURO}
                value={tipoSeguro}
                onChange={setTipoSeguro}
              />
              <DropdownPill
                label="Aseguradora"
                options={ASEGURADORAS}
                value={aseguradora}
                onChange={setAseguradora}
              />
            </div>
          </div>

          {tipo === "fisica" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Nombre(s)" />
              <FormField label="Apellidos(s)" />
              <FormField label="Correo" type="email" />
              <FormField label="Teléfono" type="tel" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField label="Razón social" />
                <FormField label="Nombre comercial" />
                <FormField label="Identidad fiscal" />
              </div>
              <h3 className="text-brand-navy pt-2 text-sm font-semibold">
                Representante legal
              </h3>
              <FormField label="Nombre" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Correo" type="email" />
                <FormField label="Teléfono" type="tel" />
              </div>
            </>
          )}
        </section>

        <section className="flex flex-col gap-4 border-t border-neutral-200 pt-6">
          <h2 className="text-brand-navy text-base font-bold">Dirección</h2>
          <FormField label="Domicilio" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Estado" />
            <FormField label="Ciudad" />
            <FormField label="Código postal" />
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-6">
          <PeopleTable title="Contacto de atención (opcional)" />
        </section>

        <section className="border-t border-neutral-200 pt-6">
          <PeopleTable title="Beneficiarios (opcional)" />
        </section>

        <section className="border-t border-neutral-200 pt-6">
          <UploadZone label="Agregar documento (opcional)" />
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-200 pt-6">
          <Button
            variant="outline"
            className="bg-brand-navy hover:bg-brand-navy-hover h-11 rounded-full px-6 text-white hover:text-white"
            render={<Link href="/casos" />}
          >
            Cancelar
          </Button>
          <BrandButton tone="secondary" className="px-8" onClick={submit}>
            Guardar
          </BrandButton>
        </div>
      </div>
    </PageCard>
  );
}

function FormField({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-neutral-600">{label}</span>
      <Input type={type} />
    </label>
  );
}
