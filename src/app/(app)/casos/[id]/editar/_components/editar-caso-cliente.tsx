"use client";

import { useMemo, useState, useTransition } from "react";
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
import { SelectInput } from "@/components/ui/select-input";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { AccordionSection } from "@/components/ui/accordion";
import { LeyendaRequerido } from "@/components/ui/indicador-requerido";
import { SelectPill } from "@/components/forms/select-pill";
import { cn } from "@/lib/utils";
import type {
  Aseguradora,
  CasoDetalle,
  CuestionarioPregunta,
  Estado,
  TipoSeguro,
} from "@/lib/api/brokers";
import {
  CuestionarioSecciones,
  respuestaYaSeReporto,
  validarCuestionario,
  type ErroresCuestionario,
  type RespuestasCuestionario,
} from "../../../_components/cuestionario-secciones";
import { nuevoCasoSchema, type NuevoCasoSchema } from "../../../nuevo/_schema";
import {
  actualizarCasoAction,
  guardarCuestionarioAction,
} from "../../_actions";

type Props = {
  caso: CasoDetalle;
  aseguradoras: Aseguradora[];
  tiposSeguro: TipoSeguro[];
  estados: Estado[];
  preguntas: CuestionarioPregunta[];
};

export function EditarCasoCliente({
  caso,
  aseguradoras,
  tiposSeguro,
  estados,
  preguntas,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [respuestas, setRespuestas] = useState<RespuestasCuestionario>(() =>
    Object.fromEntries(
      preguntas
        .filter((p) => p.respuesta != null && p.respuesta !== "")
        .map((p) => [p.pregunta_id, p.respuesta as string]),
    ),
  );
  const [erroresCuestionario, setErroresCuestionario] =
    useState<ErroresCuestionario>({});
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
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
      aseguradora_id: (caso.aseguradora_id ?? 0) as number,
      tipo_seguro_id: (caso.tipo_seguro_id ?? 0) as number,
      tipo_siniestro_id: caso.tipo_siniestro_id ?? null,
      num_siniestro_poliza: caso.num_siniestro_poliza ?? "",
      fecha_siniestro: caso.fecha_siniestro ?? "",
      numero_poliza: caso.poliza?.numero_poliza ?? "",
      moneda: caso.poliza?.moneda ?? "Moneda Nacional",
      fecha_expedicion: caso.poliza?.fecha_expedicion ?? "",
      vigencia_inicio: caso.poliza?.vigencia_inicio ?? "",
      vigencia_fin: caso.poliza?.vigencia_fin ?? "",
      estado_id: caso.estado_id ?? undefined,
      ciudad: caso.ciudad ?? "",
      domicilio: caso.domicilio ?? "",
      contactos_atencion: caso.contactos_atencion.map((c) => ({
        nombre: c.nombre,
        telefono: c.telefono ?? "",
        email: c.email ?? "",
        relacion_asegurado: c.relacion_asegurado ?? "",
      })),
      beneficiarios: caso.beneficiarios.map((b) => ({
        nombre: b.nombre,
        parentesco: b.parentesco ?? "",
        porcentaje: b.porcentaje ?? null,
      })),
    },
  });

  const tipoPersona = watch("tipo_persona");
  const tipoSeguroId = watch("tipo_seguro_id");
  // Contactos de atención: obligatorio solo en VIDA (tipo_seguro_id = 3).
  const contactosObligatorio = Number(tipoSeguroId) === 3;
  const contactos = useFieldArray({ control, name: "contactos_atencion" });
  const beneficiarios = useFieldArray({ control, name: "beneficiarios" });

  const tipoSeguroNombre = useMemo(
    () =>
      tiposSeguro.find((t) => t.id === Number(caso.tipo_seguro_id))?.nombre ??
      caso.tipo_seguro ??
      null,
    [tiposSeguro, caso.tipo_seguro_id, caso.tipo_seguro],
  );
  const yaSeReporto = respuestaYaSeReporto(preguntas, respuestas);

  const onRespuesta = (preguntaId: number, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    setErroresCuestionario((prev) => {
      const next = { ...prev };
      delete next[String(preguntaId)];
      delete next.seccion_2;
      return next;
    });
  };

  const onInvalid = () => {
    setIntentoEnviar(true);
    setErroresCuestionario(validarCuestionario(preguntas, respuestas));
    toast.error("Revisa los campos marcados antes de continuar.");
  };

  const onSubmit = (data: NuevoCasoSchema) => {
    setIntentoEnviar(true);

    const erroresQ = validarCuestionario(preguntas, respuestas);
    const numeroVacio = !data.num_siniestro_poliza?.trim();
    if (yaSeReporto === "Sí" && numeroVacio) {
      setError("num_siniestro_poliza", {
        type: "custom",
        message:
          "Captura el número de siniestro: indicaste que ya se reportó a la aseguradora.",
      });
    }
    if (
      Object.keys(erroresQ).length > 0 ||
      (yaSeReporto === "Sí" && numeroVacio)
    ) {
      setErroresCuestionario(erroresQ);
      toast.error("Revisa el cuestionario del siniestro antes de continuar.");
      return;
    }

    const cuestionarioPayload: Record<string, string> = {};
    for (const p of preguntas) {
      cuestionarioPayload[String(p.pregunta_id)] =
        respuestas[p.pregunta_id]?.trim() ?? "";
    }

    startTransition(async () => {
      const result = await actualizarCasoAction(caso.id, {
        tipo_persona: data.tipo_persona,
        nombre_asegurado: data.nombre_asegurado || null,
        nombre_empresa: data.nombre_empresa || null,
        nombre_comercial: data.nombre_comercial || null,
        nombre_representante: data.nombre_representante || null,
        rfc: data.rfc || null,
        correo: data.correo || null,
        telefono: data.telefono || null,
        celular: data.celular || null,
        aseguradora_id: data.aseguradora_id,
        tipo_seguro_id: data.tipo_seguro_id,
        tipo_siniestro_id: data.tipo_siniestro_id ?? null,
        num_siniestro_poliza: data.num_siniestro_poliza || null,
        fecha_siniestro: data.fecha_siniestro || null,
        numero_poliza: data.numero_poliza || null,
        moneda: data.moneda || null,
        fecha_expedicion: data.fecha_expedicion || null,
        vigencia_inicio: data.vigencia_inicio || null,
        vigencia_fin: data.vigencia_fin || null,
        estado_id: data.estado_id ?? null,
        ciudad: data.ciudad || null,
        domicilio: data.domicilio || null,
        codigo_postal: data.codigo_postal || null,
        contactos_atencion: (data.contactos_atencion ?? []).map((c) => ({
          nombre: c.nombre,
          telefono: c.telefono || null,
          email: c.email || null,
          relacion_asegurado: c.relacion_asegurado || null,
        })),
        beneficiarios: data.beneficiarios ?? [],
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      // Las respuestas del cuestionario se guardan aparte (endpoint propio).
      const resultCuestionario = await guardarCuestionarioAction(
        caso.id,
        cuestionarioPayload,
      );
      if (!resultCuestionario.ok) {
        toast.error(
          `El caso se actualizó, pero el cuestionario no se pudo guardar: ${resultCuestionario.message}`,
        );
        return;
      }

      toast.success("Caso actualizado.");
      router.push(`/casos/${caso.id}`);
    });
  };

  const errorSeguro = !!(
    errors.aseguradora_id ||
    errors.numero_poliza ||
    errors.vigencia_fin
  );
  const errorCuestionario =
    !!errors.fecha_siniestro ||
    !!errors.num_siniestro_poliza ||
    Object.keys(erroresCuestionario).length > 0;
  const errorAsegurado = !!(
    errors.nombre_asegurado ||
    errors.nombre_empresa ||
    errors.correo
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-brand-navy text-xl font-bold">
          Editar caso {caso.folio ? `· Folio ${caso.folio}` : `#${caso.id}`}
        </h1>
      </div>

      <LeyendaRequerido className="border-y border-neutral-100 py-2.5" />

      {/* ── 1. Datos del seguro ── */}
      <AccordionSection
        titulo="Datos del seguro"
        descripcion="Tipo de seguro, aseguradora y póliza"
        obligatorio
        abiertoInicial
        forzarAbierto={intentoEnviar && errorSeguro}
        conError={errorSeguro}
      >
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Número de póliza" error={errors.numero_poliza?.message}>
            <Input {...register("numero_poliza")} />
          </Field>
          <Field label="Moneda">
            <Input {...register("moneda")} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Fecha de expedición">
            <Input type="date" {...register("fecha_expedicion")} />
          </Field>
          <Field label="Inicio de vigencia">
            <Input type="date" {...register("vigencia_inicio")} />
          </Field>
          <Field label="Fin de vigencia" error={errors.vigencia_fin?.message}>
            <Input type="date" {...register("vigencia_fin")} />
          </Field>
        </div>
      </AccordionSection>

      {/* ── 2. Cuestionario del siniestro ── */}
      <AccordionSection
        titulo="Cuestionario del siniestro"
        descripcion="Los detalles del siniestro que ayudan a procesar la reclamación"
        obligatorio
        abiertoInicial
        forzarAbierto={intentoEnviar && errorCuestionario}
        conError={intentoEnviar && errorCuestionario}
      >
        <CuestionarioSecciones
          preguntas={preguntas}
          tipoSeguroNombre={tipoSeguroNombre}
          respuestas={respuestas}
          onRespuesta={onRespuesta}
          errores={erroresCuestionario}
          disabled={isPending}
          camposCaso={
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Fecha del siniestro *"
                error={errors.fecha_siniestro?.message}
              >
                <Input type="date" {...register("fecha_siniestro")} />
              </Field>
              <Field
                label={
                  yaSeReporto === "Sí"
                    ? "Número de siniestro *"
                    : "Número de siniestro"
                }
                error={errors.num_siniestro_poliza?.message}
              >
                <Input
                  placeholder={
                    yaSeReporto === "No"
                      ? "Aún no se reporta a la aseguradora"
                      : ""
                  }
                  disabled={yaSeReporto === "No"}
                  {...register("num_siniestro_poliza")}
                />
              </Field>
            </div>
          }
        />
      </AccordionSection>

      {/* ── 3. Datos del asegurado ── */}
      <AccordionSection
        titulo="Datos del asegurado"
        descripcion="A nombre de quién es la póliza"
        obligatorio
        abiertoInicial
        forzarAbierto={intentoEnviar && errorAsegurado}
        conError={errorAsegurado}
      >
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
      </AccordionSection>

      {/* ── 4. Dirección ── */}
      <AccordionSection
        titulo="Dirección"
        descripcion="Domicilio del asegurado"
        obligatorio={false}
      >
        <Field label="Domicilio">
          <Input {...register("domicilio")} />
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Estado">
            <Controller
              control={control}
              name="estado_id"
              render={({ field, fieldState }) => (
                <SelectInput
                  name={field.name}
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                  onBlur={field.onBlur}
                  invalid={!!fieldState.error}
                  options={estados.map((e) => ({
                    value: e.id,
                    label: e.nombre,
                  }))}
                />
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
      </AccordionSection>

      {/* ── 5. Contactos de atención ── */}
      <AccordionSection
        titulo="Contactos de atención"
        descripcion="Personas con quienes coordinar el caso"
        obligatorio={contactosObligatorio}
        nota="NOTA: obligatorio en VIDA, opcional en GMM y AUTO"
        abiertoInicial={caso.contactos_atencion.length > 0}
      >
        <div className="flex flex-col gap-3">
          {contactos.fields.map((f, i) => (
            <div
              key={f.id}
              className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
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
              <Input
                placeholder="Relación con el asegurado"
                {...register(`contactos_atencion.${i}.relacion_asegurado`)}
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
              contactos.append({
                nombre: "",
                telefono: "",
                email: "",
                relacion_asegurado: "",
              })
            }
            tone="secondary"
            className="self-start"
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar contacto
          </BrandButton>
        </div>
      </AccordionSection>

      {/* ── 6. Beneficiarios ── */}
      <AccordionSection
        titulo="Beneficiarios"
        descripcion="Beneficiarios de la póliza"
        obligatorio={false}
        abiertoInicial={caso.beneficiarios.length > 0}
      >
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
      </AccordionSection>

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
