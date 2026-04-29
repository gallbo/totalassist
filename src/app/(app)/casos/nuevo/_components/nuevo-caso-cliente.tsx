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
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  Aseguradora,
  Estado,
  PaqueteContratado,
  TipoSeguro,
} from "@/lib/api/brokers";
import { nuevoCasoSchema, type NuevoCasoSchema } from "../_schema";
import { registrarCasoAction, subirArchivoCasoAction } from "../_actions";

const TAMANO_MAX = 10 * 1024 * 1024;

type Props = {
  aseguradoras: Aseguradora[];
  tiposSeguro: TipoSeguro[];
  estados: Estado[];
  paqueteActivo: PaqueteContratado | null;
};

export function NuevoCasoCliente({
  aseguradoras,
  tiposSeguro,
  estados,
  paqueteActivo,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [archivos, setArchivos] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NuevoCasoSchema>({
    resolver: zodResolver(
      nuevoCasoSchema,
    ) as unknown as Resolver<NuevoCasoSchema>,
    defaultValues: {
      tipo_persona: "fisica",
      contactos_atencion: [],
      beneficiarios: [],
    },
  });

  const tipoPersona = watch("tipo_persona");

  const contactos = useFieldArray({ control, name: "contactos_atencion" });
  const beneficiarios = useFieldArray({ control, name: "beneficiarios" });

  const onAgregarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files ?? []);
    const validos = fs.filter((f) => {
      if (f.size > TAMANO_MAX) {
        toast.error(`"${f.name}" supera el límite de 10 MB.`);
        return false;
      }
      return true;
    });
    setArchivos((prev) => [...prev, ...validos]);
    e.target.value = "";
  };

  const onSubmit = (data: NuevoCasoSchema) => {
    if (!paqueteActivo) {
      toast.error(
        "No tienes un paquete con cupos disponibles. Contrata uno antes de registrar un caso.",
      );
      router.push("/paquetes");
      return;
    }

    startTransition(async () => {
      const result = await registrarCasoAction({
        ...data,
        correo: data.correo || null,
        contactos_atencion: data.contactos_atencion?.map((c) => ({
          nombre: c.nombre,
          telefono: c.telefono || null,
          email: c.email || null,
        })),
      });

      if (!result.ok) {
        if (result.code === "sin_cupos") {
          toast.error(result.message, {
            action: {
              label: "Ver paquetes",
              onClick: () => router.push("/paquetes"),
            },
          });
          return;
        }
        toast.error(result.message);
        return;
      }

      const casoId = result.data.id;
      const archivosACargar = archivos;

      // Disparamos uploads en paralelo y dejamos que terminen en segundo
      // plano. Cada uno revalida /casos/{id} al terminar (server action
      // hace revalidatePath), así que cuando el usuario abra el detalle ya
      // están listos. Evitamos bloquear la navegación a /casos.
      if (archivosACargar.length > 0) {
        toast.info(
          archivosACargar.length === 1
            ? "Subiendo 1 archivo en segundo plano…"
            : `Subiendo ${archivosACargar.length} archivos en segundo plano…`,
        );
        void Promise.all(
          archivosACargar.map(async (file) => {
            const fd = new FormData();
            fd.append("archivo", file);
            const up = await subirArchivoCasoAction(casoId, fd);
            if (!up.ok) {
              toast.error(`No se pudo subir "${file.name}": ${up.message}`);
            }
            return up;
          }),
        ).then((resultados) => {
          const exitosos = resultados.filter((r) => r.ok).length;
          if (exitosos > 0) {
            toast.success(
              exitosos === 1
                ? "1 archivo cargado al caso."
                : `${exitosos} archivos cargados al caso.`,
            );
          }
        });
      }

      toast.success("Caso registrado.");
      router.push("/casos");
    });
  };

  const onInvalid = () => {
    toast.error("Revisa los campos marcados antes de continuar.");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-brand-navy text-xl font-bold">Registro de caso</h1>
        {paqueteActivo && (
          <span className="text-sm text-neutral-600">
            Paquete activo: {paqueteActivo.casos_restantes} de{" "}
            {paqueteActivo.numero_casos} casos restantes
          </span>
        )}
      </div>

      {!paqueteActivo && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No tienes paquetes con cupo. Contrata uno en{" "}
          <Link href="/paquetes" className="underline">
            Paquetes
          </Link>{" "}
          antes de registrar un caso.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {(["fisica", "moral"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() =>
              setValue("tipo_persona", t, { shouldValidate: true })
            }
            className={cn(
              "h-12 rounded-full text-sm font-semibold transition-colors",
              tipoPersona === t
                ? "bg-brand-navy text-white"
                : "text-brand-navy/80 bg-blue-50 hover:bg-blue-100",
            )}
          >
            {t === "fisica" ? "Persona física" : "Persona moral"}
          </button>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <h2 className="text-brand-navy text-base font-bold md:pt-2">
            {tipoPersona === "fisica" ? "Información personal" : "Información"}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Controller
              control={control}
              name="tipo_seguro_id"
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <SelectPill
                    label="Tipo de seguro *"
                    options={tiposSeguro.map((t) => ({
                      value: String(t.id),
                      label: t.nombre,
                    }))}
                    value={field.value ? String(field.value) : ""}
                    onChange={(v) => field.onChange(v ? Number(v) : null)}
                    invalid={!!fieldState.error}
                  />
                  {fieldState.error && (
                    <span className="text-xs text-red-600">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />
            <Controller
              control={control}
              name="aseguradora_id"
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <SelectPill
                    label="Aseguradora *"
                    options={aseguradoras.map((a) => ({
                      value: String(a.id),
                      label: a.nombre,
                    }))}
                    value={field.value ? String(field.value) : ""}
                    onChange={(v) => field.onChange(v ? Number(v) : null)}
                    invalid={!!fieldState.error}
                  />
                  {fieldState.error && (
                    <span className="text-xs text-red-600">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
        </div>

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
            <Field label="Correo" error={errors.correo?.message}>
              <Input type="email" {...register("correo")} />
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Correo" error={errors.correo?.message}>
                <Input type="email" {...register("correo")} />
              </Field>
              <Field label="Teléfono">
                <Input type="tel" {...register("telefono")} />
              </Field>
            </div>
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

      <section className="border-t border-neutral-200 pt-6">
        <h3 className="text-brand-navy mb-3 text-sm font-semibold">
          Documentos (opcional)
        </h3>
        <label className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-sm text-neutral-600 hover:bg-neutral-50">
          <Upload className="mr-2 h-5 w-5" />
          <span>Selecciona archivos (máx 10 MB c/u)</span>
          <input
            type="file"
            multiple
            className="sr-only"
            onChange={onAgregarArchivo}
          />
        </label>
        {archivos.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {archivos.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-sm"
              >
                <span className="truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setArchivos((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="text-neutral-500 hover:text-red-600"
                  aria-label="Quitar archivo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-200 pt-6">
        <Button
          variant="outline"
          type="button"
          className="bg-brand-navy hover:bg-brand-navy-hover h-11 rounded-full px-6 text-white hover:text-white"
          render={<Link href="/casos" />}
        >
          Cancelar
        </Button>
        <BrandButton
          type="submit"
          tone="secondary"
          className="px-8"
          disabled={isPending || !paqueteActivo}
        >
          {isPending ? "Guardando…" : "Guardar"}
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

type SelectPillOption = { value: string; label: string };

function SelectPill({
  label,
  options,
  value,
  onChange,
  invalid = false,
  buscable = true,
}: {
  label: string;
  options: SelectPillOption[];
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  buscable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  const seleccionada = options.find((o) => o.value === value);

  const filtradas = filtro
    ? options.filter((o) =>
        o.label.toLowerCase().includes(filtro.toLowerCase()),
      )
    : options;

  // Mostrar input de búsqueda solo si la lista vale la pena filtrar.
  const mostrarBusqueda = buscable && options.length > 6;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (open) setFiltro("");
        }}
        className={cn(
          "bg-brand-yellow text-brand-navy hover:bg-brand-yellow-hover inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold",
          invalid && "ring-2 ring-red-500",
        )}
      >
        <span className="max-w-[260px] truncate">
          {seleccionada?.label ?? label}
        </span>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-20 mt-2 flex max-h-80 min-w-[260px] flex-col rounded-xl bg-blue-50 shadow-lg ring-1 ring-neutral-200">
          {mostrarBusqueda && (
            <div className="border-b border-blue-100 p-2">
              <input
                type="text"
                placeholder="Buscar…"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                autoFocus
                className="text-brand-navy w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-blue-300"
              />
            </div>
          )}
          <div className="overflow-y-auto py-2">
            {filtradas.length === 0 ? (
              <div className="px-5 py-2 text-xs text-neutral-500">
                {filtro
                  ? "No hay resultados para esa búsqueda."
                  : "Sin opciones disponibles."}
              </div>
            ) : (
              filtradas.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setFiltro("");
                  }}
                  className={cn(
                    "block w-full px-5 py-2 text-left text-sm",
                    value === o.value
                      ? "text-brand-navy font-semibold"
                      : "text-brand-navy/80 hover:text-brand-navy",
                  )}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
