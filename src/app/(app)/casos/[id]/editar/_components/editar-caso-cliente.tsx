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
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { AccordionSection } from "@/components/ui/accordion";
import { LeyendaRequerido } from "@/components/ui/indicador-requerido";
import { SelectPill } from "@/components/forms/select-pill";
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
  AseguradosFields,
  aseguradosAForm,
  normalizarAsegurados,
} from "../../../_components/asegurados-fields";
import {
  PolizasFields,
  polizaVacia,
} from "../../../_components/polizas-fields";
import {
  actualizarCasoAction,
  guardarCuestionarioAction,
  subirArchivoPolizaAction,
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
  // Archivo nuevo por póliza, indexado por el id estable del field array.
  const [polizaFiles, setPolizaFiles] = useState<Record<string, File | null>>(
    {},
  );

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
      aseguradora_id: (caso.aseguradora_id ?? 0) as number,
      tipo_seguro_id: (caso.tipo_seguro_id ?? 0) as number,
      tipo_siniestro_id: caso.tipo_siniestro_id ?? null,
      num_siniestro_poliza: caso.num_siniestro_poliza ?? "",
      fecha_siniestro: caso.fecha_siniestro ?? "",
      polizas:
        caso.polizas.length > 0
          ? caso.polizas.map((p) => ({
              id: p.id,
              numero_poliza: p.numero_poliza ?? "",
              moneda: p.moneda ?? "Moneda Nacional",
              fecha_expedicion: p.fecha_expedicion ?? "",
              vigencia_inicio: p.vigencia_inicio ?? "",
              vigencia_fin: p.vigencia_fin ?? "",
            }))
          : [polizaVacia()],
      asegurados: aseguradosAForm(caso.asegurados),
      beneficiarios: caso.beneficiarios.map((b) => ({
        nombre: b.nombre,
        parentesco: b.parentesco ?? "",
        porcentaje: b.porcentaje ?? null,
      })),
    },
  });

  const tipoSeguroId = watch("tipo_seguro_id");
  const esAuto = Number(tipoSeguroId) === 1;
  const beneficiarios = useFieldArray({ control, name: "beneficiarios" });
  const polizas = useFieldArray({ control, name: "polizas", keyName: "_key" });

  // Nombre del archivo ya cargado por póliza (para mostrarlo en el campo de subida).
  const archivoActualPorId = useMemo(
    () =>
      Object.fromEntries(
        caso.polizas.map((p) => [
          p.id,
          { archivo_nombre: p.archivo_nombre, tiene_archivo: p.tiene_archivo },
        ]),
      ),
    [caso.polizas],
  );

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
        aseguradora_id: data.aseguradora_id,
        tipo_seguro_id: data.tipo_seguro_id,
        tipo_siniestro_id: data.tipo_siniestro_id ?? null,
        num_siniestro_poliza: data.num_siniestro_poliza || null,
        fecha_siniestro: data.fecha_siniestro || null,
        polizas: data.polizas.map((p) => ({
          ...(p.id ? { id: p.id } : {}),
          numero_poliza: p.numero_poliza,
          moneda: p.moneda || null,
          fecha_expedicion: p.fecha_expedicion || null,
          vigencia_inicio: p.vigencia_inicio || null,
          vigencia_fin: p.vigencia_fin || null,
        })),
        asegurados: normalizarAsegurados(data.asegurados),
        beneficiarios: data.beneficiarios ?? [],
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      // Archivos nuevos por póliza. Las existentes se ubican por id; las nuevas,
      // por número de póliza contra el detalle actualizado que devuelve el PUT.
      const idPorNumero = new Map(
        result.data.polizas.map((p) => [p.numero_poliza, p.id]),
      );
      polizas.fields.forEach((field, idx) => {
        const file = polizaFiles[field._key];
        if (!file) return;
        const existenteId = (field as { id?: number }).id;
        const polizaId =
          existenteId ?? idPorNumero.get(data.polizas[idx].numero_poliza);
        if (!polizaId) return;
        const fd = new FormData();
        fd.append("archivo", file);
        void subirArchivoPolizaAction(caso.id, polizaId, fd).then((up) => {
          if (!up.ok) {
            toast.error(
              `No se pudo subir el archivo de la póliza ${data.polizas[idx].numero_poliza}: ${up.message}`,
            );
          }
        });
      });

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

  const errorSeguro = !!(errors.aseguradora_id || errors.polizas);
  const errorCuestionario =
    !!errors.fecha_siniestro ||
    !!errors.num_siniestro_poliza ||
    Object.keys(erroresCuestionario).length > 0;
  const errorAsegurado = !!errors.asegurados;

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
        <div className="border-t border-neutral-100 pt-4">
          <p className="mb-3 text-xs text-neutral-500">
            Un caso es de un solo tipo de seguro, pero puede tener varias
            pólizas del mismo siniestro. Agrega todas las que apliquen.
          </p>
          <PolizasFields
            control={control}
            register={register}
            fields={polizas.fields}
            onAppend={() => polizas.append(polizaVacia())}
            onRemove={(i) => polizas.remove(i)}
            files={polizaFiles}
            onFileChange={(key, file) =>
              setPolizaFiles((prev) => ({ ...prev, [key]: file }))
            }
            archivoActualPorId={archivoActualPorId}
          />
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

      {/* ── 3. Asegurados ── */}
      <AccordionSection
        titulo="Asegurados"
        descripcion="A nombre de quién está la póliza, con sus direcciones y contactos"
        obligatorio
        abiertoInicial
        forzarAbierto={intentoEnviar && errorAsegurado}
        conError={errorAsegurado}
      >
        <AseguradosFields
          control={control}
          register={register}
          estados={estados}
          esAuto={esAuto}
        />
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
