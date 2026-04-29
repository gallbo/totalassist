"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useForm,
  useFieldArray,
  Controller,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  Aseguradora,
  CasoDetalle,
  Estado,
  TipoSeguro,
} from "@/lib/api/brokers";
import { nuevoCasoSchema, type NuevoCasoSchema } from "../../../nuevo/_schema";
import { actualizarCasoAction } from "../../_actions";

type Props = {
  caso: CasoDetalle;
  aseguradoras: Aseguradora[];
  tiposSeguro: TipoSeguro[];
  estados: Estado[];
};

export function EditarCasoCliente({
  caso,
  aseguradoras,
  tiposSeguro,
  estados,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<NuevoCasoSchema>({
    resolver: zodResolver(
      nuevoCasoSchema,
    ) as unknown as Resolver<NuevoCasoSchema>,
    defaultValues: {
      tipo_persona: caso.tipo_persona,
      nombre_asegurado:
        caso.tipo_persona === "fisica" ? (caso.nombre ?? "") : "",
      nombre_empresa: caso.nombre_empresa ?? "",
      nombre_comercial: caso.nombre_comercial ?? "",
      nombre_representante: caso.nombre_representante ?? "",
      rfc: caso.rfc ?? "",
      correo: caso.correo ?? "",
      telefono: caso.telefono ?? "",
      celular: caso.celular ?? "",
      // Estos quedan locked desde la UI pero la zod los pide required.
      // Inyectamos los valores actuales del caso para que la validación pase.
      aseguradora_id: (caso.aseguradora_id ?? 0) as number,
      tipo_seguro_id: (caso.tipo_seguro_id ?? 0) as number,
      tipo_siniestro_id: caso.tipo_siniestro_id ?? null,
      folio_poliza: caso.folio_poliza ?? "",
      fecha_siniestro: caso.fecha_siniestro ?? "",
      monto_estimado:
        caso.monto_estimado != null ? Number(caso.monto_estimado) : undefined,
      estado_id: caso.estado_id ?? undefined,
      ciudad: caso.ciudad ?? "",
      domicilio: caso.domicilio ?? "",
      contactos_atencion: caso.contactos_atencion.map((c) => ({
        nombre: c.nombre,
        telefono: c.telefono ?? "",
        email: c.email ?? "",
      })),
      beneficiarios: caso.beneficiarios.map((b) => ({
        nombre: b.nombre,
        parentesco: b.parentesco ?? "",
        porcentaje: b.porcentaje ?? null,
      })),
    },
  });

  const tipoPersona = watch("tipo_persona");
  const contactos = useFieldArray({ control, name: "contactos_atencion" });
  const beneficiarios = useFieldArray({ control, name: "beneficiarios" });

  const aseguradoraNombre =
    aseguradoras.find((a) => a.id === caso.aseguradora_id)?.nombre ??
    caso.aseguradora ??
    "—";
  const tipoSeguroNombre =
    tiposSeguro.find((t) => t.id === caso.tipo_seguro_id)?.nombre ??
    caso.tipo_seguro ??
    "—";

  const onInvalid = () => {
    toast.error("Revisa los campos marcados antes de continuar.");
  };

  const onSubmit = (data: NuevoCasoSchema) => {
    startTransition(async () => {
      // No mandamos correo, aseguradora_id ni tipo_seguro_id desde la UI:
      // estos quedan locked en el form. El backend igual los aceptaría si
      // se decidiera permitir editarlos en el futuro.
      const result = await actualizarCasoAction(caso.id, {
        tipo_persona: data.tipo_persona,
        nombre_asegurado: data.nombre_asegurado || null,
        nombre_empresa: data.nombre_empresa || null,
        nombre_comercial: data.nombre_comercial || null,
        nombre_representante: data.nombre_representante || null,
        rfc: data.rfc || null,
        telefono: data.telefono || null,
        celular: data.celular || null,
        tipo_siniestro_id: data.tipo_siniestro_id ?? null,
        folio_poliza: data.folio_poliza || null,
        fecha_siniestro: data.fecha_siniestro || null,
        monto_estimado: data.monto_estimado ?? null,
        estado_id: data.estado_id ?? null,
        ciudad: data.ciudad || null,
        domicilio: data.domicilio || null,
        codigo_postal: data.codigo_postal || null,
        contactos_atencion: (data.contactos_atencion ?? []).map((c) => ({
          nombre: c.nombre,
          telefono: c.telefono || null,
          email: c.email || null,
        })),
        beneficiarios: data.beneficiarios ?? [],
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Caso actualizado.");
      router.push(`/casos/${caso.id}`);
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-brand-navy text-xl font-bold">
          Editar caso {caso.folio ? `· Folio ${caso.folio}` : `#${caso.id}`}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 opacity-60">
        {(["fisica", "moral"] as const).map((t) => (
          <button
            key={t}
            type="button"
            disabled
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold",
              tipoPersona === t
                ? "bg-brand-navy text-white"
                : "text-brand-navy/80 bg-blue-50",
            )}
          >
            {t === "fisica" ? "Persona física" : "Persona moral"}
            {tipoPersona === t && <Lock className="h-3.5 w-3.5" />}
          </button>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-brand-navy text-base font-bold">
          {tipoPersona === "fisica" ? "Información personal" : "Información"}
        </h2>

        <CamposLocked
          aseguradora={aseguradoraNombre}
          tipoSeguro={tipoSeguroNombre}
          correo={caso.correo}
        />

        {tipoPersona === "fisica" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nombre completo del asegurado"
              error={errors.nombre_asegurado?.message}
            >
              <Input {...register("nombre_asegurado")} />
            </Field>
            <Field label="RFC">
              <Input {...register("rfc")} />
            </Field>
            <Field label="Teléfono">
              <Input type="tel" {...register("telefono")} />
            </Field>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field
                label="Razón social"
                error={errors.nombre_empresa?.message}
              >
                <Input {...register("nombre_empresa")} />
              </Field>
              <Field label="Nombre comercial">
                <Input {...register("nombre_comercial")} />
              </Field>
              <Field label="RFC">
                <Input {...register("rfc")} />
              </Field>
            </div>
            <h3 className="text-brand-navy pt-2 text-sm font-semibold">
              Representante legal
            </h3>
            <Field label="Nombre">
              <Input {...register("nombre_representante")} />
            </Field>
            <Field label="Teléfono">
              <Input type="tel" {...register("telefono")} />
            </Field>
          </>
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-neutral-200 pt-6">
        <h2 className="text-brand-navy text-base font-bold">
          Datos del siniestro
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Folio de la póliza"
            error={errors.folio_poliza?.message}
          >
            <Input placeholder="POL-2026-0001" {...register("folio_poliza")} />
          </Field>
          <Field label="Fecha del siniestro">
            <Input type="date" {...register("fecha_siniestro")} />
          </Field>
          <Field label="Monto estimado (MXN)">
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("monto_estimado")}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-neutral-200 pt-6">
        <h2 className="text-brand-navy text-base font-bold">Dirección</h2>
        <Field label="Domicilio">
          <Input {...register("domicilio")} />
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Estado">
            <Controller
              control={control}
              name="estado_id"
              render={({ field }) => (
                <select
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="border-input bg-background text-foreground h-11 rounded-md border px-3 text-sm"
                >
                  <option value="">Selecciona…</option>
                  {estados.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              )}
            />
          </Field>
          <Field label="Ciudad">
            <Input {...register("ciudad")} />
          </Field>
          <Field label="Código postal">
            <Input {...register("codigo_postal")} />
          </Field>
        </div>
      </section>

      <section className="border-t border-neutral-200 pt-6">
        <h3 className="text-brand-navy mb-3 text-sm font-semibold">
          Contactos de atención (opcional)
        </h3>
        <div className="flex flex-col gap-3">
          {contactos.fields.map((f, i) => (
            <div
              key={f.id}
              className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <Input
                placeholder="Nombre"
                {...register(`contactos_atencion.${i}.nombre`)}
              />
              <Input
                placeholder="Teléfono"
                {...register(`contactos_atencion.${i}.telefono`)}
              />
              <Input
                placeholder="Correo"
                {...register(`contactos_atencion.${i}.email`)}
              />
              <button
                type="button"
                onClick={() => contactos.remove(i)}
                className="bg-brand-navy hover:bg-brand-navy-hover flex h-10 w-10 items-center justify-center self-end rounded-full text-white"
                aria-label="Eliminar contacto"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <BrandButton
            type="button"
            onClick={() =>
              contactos.append({ nombre: "", telefono: "", email: "" })
            }
            tone="secondary"
            className="self-start"
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar contacto
          </BrandButton>
        </div>
      </section>

      <section className="border-t border-neutral-200 pt-6">
        <h3 className="text-brand-navy mb-3 text-sm font-semibold">
          Beneficiarios (opcional)
        </h3>
        <div className="flex flex-col gap-3">
          {beneficiarios.fields.map((f, i) => (
            <div
              key={f.id}
              className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_120px_auto]"
            >
              <Input
                placeholder="Nombre"
                {...register(`beneficiarios.${i}.nombre`)}
              />
              <Input
                placeholder="Parentesco"
                {...register(`beneficiarios.${i}.parentesco`)}
              />
              <Input
                placeholder="% participación"
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...register(`beneficiarios.${i}.porcentaje`)}
              />
              <button
                type="button"
                onClick={() => beneficiarios.remove(i)}
                className="bg-brand-navy hover:bg-brand-navy-hover flex h-10 w-10 items-center justify-center self-end rounded-full text-white"
                aria-label="Eliminar beneficiario"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <BrandButton
            type="button"
            onClick={() =>
              beneficiarios.append({
                nombre: "",
                parentesco: "",
                porcentaje: null,
              })
            }
            tone="secondary"
            className="self-start"
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar beneficiario
          </BrandButton>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-200 pt-6">
        <Button
          variant="outline"
          type="button"
          className="bg-brand-navy hover:bg-brand-navy-hover h-11 rounded-full px-6 text-white hover:text-white"
          render={<Link href={`/casos/${caso.id}`} />}
        >
          Cancelar
        </Button>
        <BrandButton
          type="submit"
          tone="secondary"
          className="px-8"
          disabled={isPending}
        >
          {isPending ? "Guardando…" : "Guardar cambios"}
        </BrandButton>
      </div>
    </form>
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

function CamposLocked({
  aseguradora,
  tipoSeguro,
  correo,
}: {
  aseguradora: string;
  tipoSeguro: string;
  correo: string | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg bg-blue-50/40 p-4 md:grid-cols-3">
      <Locked label="Aseguradora" value={aseguradora} />
      <Locked label="Tipo de seguro" value={tipoSeguro} />
      <Locked label="Correo" value={correo ?? "—"} />
      <p className="text-xs text-neutral-500 md:col-span-3">
        Estos datos no se pueden cambiar desde aquí. Si necesitas modificarlos,
        contáctanos.
      </p>
    </div>
  );
}

function Locked({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-xs text-neutral-600">
        <Lock className="h-3 w-3" />
        {label}
      </span>
      <div className="text-brand-navy truncate rounded-md bg-white px-3 py-2 text-sm ring-1 ring-neutral-200">
        {value}
      </div>
    </div>
  );
}
