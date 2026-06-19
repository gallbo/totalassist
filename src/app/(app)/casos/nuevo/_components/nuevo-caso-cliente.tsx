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
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { AccordionSection } from "@/components/ui/accordion";
import { LeyendaRequerido } from "@/components/ui/indicador-requerido";
import { SelectPill } from "@/components/forms/select-pill";
import type {
  Aseguradora,
  CuestionarioPregunta,
  Estado,
  PaqueteContratado,
  TipoSeguro,
} from "@/lib/api/brokers";
import {
  CuestionarioSecciones,
  respuestaYaSeReporto,
  validarCuestionario,
  type ErroresCuestionario,
  type RespuestasCuestionario,
} from "../../_components/cuestionario-secciones";
import { nuevoCasoSchema, type NuevoCasoSchema } from "../_schema";
import {
  AseguradosFields,
  aseguradoFisicaVacio,
  normalizarAsegurados,
} from "../../_components/asegurados-fields";
import { PolizasFields, polizaVacia } from "../../_components/polizas-fields";
import {
  registrarCasoAction,
  subirArchivoCasoAction,
  subirArchivoPolizaAction,
} from "../_actions";

const TAMANO_MAX = 10 * 1024 * 1024;

type Props = {
  aseguradoras: Aseguradora[];
  tiposSeguro: TipoSeguro[];
  estados: Estado[];
  paqueteActivo: PaqueteContratado | null;
  cuestionarios: Record<string, CuestionarioPregunta[]>;
};

export function NuevoCasoCliente({
  aseguradoras,
  tiposSeguro,
  estados,
  paqueteActivo,
  cuestionarios,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [archivos, setArchivos] = useState<File[]>([]);
  // Archivo por póliza, indexado por el id estable del field array de pólizas.
  const [polizaFiles, setPolizaFiles] = useState<Record<string, File | null>>(
    {},
  );
  const [respuestas, setRespuestas] = useState<RespuestasCuestionario>({});
  const [erroresCuestionario, setErroresCuestionario] =
    useState<ErroresCuestionario>({});
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<NuevoCasoSchema>({
    resolver: zodResolver(
      nuevoCasoSchema,
    ) as unknown as Resolver<NuevoCasoSchema>,
    defaultValues: {
      polizas: [polizaVacia()],
      asegurados: [aseguradoFisicaVacio()],
      beneficiarios: [],
    },
  });

  const tipoSeguroId = watch("tipo_seguro_id");
  const esAuto = Number(tipoSeguroId) === 1;

  const beneficiarios = useFieldArray({ control, name: "beneficiarios" });
  // keyName "_key" para no pisar el campo `id` propio de cada póliza.
  const polizas = useFieldArray({
    control,
    name: "polizas",
    keyName: "_key",
  });

  const preguntas = useMemo(
    () => (tipoSeguroId ? (cuestionarios[String(tipoSeguroId)] ?? []) : []),
    [cuestionarios, tipoSeguroId],
  );
  const tipoSeguroNombre =
    tiposSeguro.find((t) => t.id === Number(tipoSeguroId))?.nombre ?? null;
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

  const onCambioTipoSeguro = (nuevoId: number | null) => {
    setValue("tipo_seguro_id", nuevoId as number, { shouldValidate: true });
    // Cada ramo tiene su propio cuestionario: al cambiar se descartan respuestas.
    setRespuestas({});
    setErroresCuestionario({});
  };

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

    setIntentoEnviar(true);

    // Validación del cuestionario (depende del ramo, no entra en el schema zod).
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
      const valor = respuestas[p.pregunta_id]?.trim();
      if (valor) cuestionarioPayload[String(p.pregunta_id)] = valor;
    }

    // Snapshot del archivo de cada póliza en el orden del field array, ANTES de
    // crear el caso. Las pólizas vuelven del backend en ese mismo orden, así que
    // se correlacionan por índice. Tomarlo aquí evita re-leer polizas.fields tras
    // el await (las keys pueden cambiar) y perder el archivo.
    const archivosPolizaEnOrden = polizas.fields.map(
      (f) => polizaFiles[f._key] ?? null,
    );

    startTransition(async () => {
      const result = await registrarCasoAction({
        ...data,
        num_siniestro_poliza: data.num_siniestro_poliza || null,
        polizas: data.polizas.map((p) => ({
          numero_poliza: p.numero_poliza,
          moneda: p.moneda || null,
          fecha_expedicion: p.fecha_expedicion || null,
          vigencia_inicio: p.vigencia_inicio || null,
          vigencia_fin: p.vigencia_fin || null,
        })),
        asegurados: normalizarAsegurados(data.asegurados),
        cuestionario: cuestionarioPayload,
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

      // Archivo de cada póliza: se esperan ANTES de navegar. Si se dispararan en
      // segundo plano, el router.push de abajo desmonta la página y aborta la
      // subida en vuelo (el archivo se perdía). Es un solo archivo chico por
      // póliza, así que esperar no afecta la experiencia.
      await Promise.all(
        result.data.polizas.map((creada, idx) => {
          const file = archivosPolizaEnOrden[idx] ?? null;
          if (!file) return Promise.resolve();
          const fd = new FormData();
          fd.append("archivo", file);
          return subirArchivoPolizaAction(casoId, creada.id, fd).then((up) => {
            if (!up.ok) {
              toast.error(
                `No se pudo subir el archivo de la póliza ${creada.numero_poliza ?? idx + 1}: ${up.message}`,
              );
            }
          });
        }),
      );

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
    setIntentoEnviar(true);
    // Marca también los errores del cuestionario para abrir su sección.
    setErroresCuestionario(validarCuestionario(preguntas, respuestas));
    toast.error("Revisa los campos marcados antes de continuar.");
  };

  // Errores por sección: con error el acordeón se abre y se pinta en rojo.
  const errorSeguro = !!(
    errors.tipo_seguro_id ||
    errors.aseguradora_id ||
    errors.polizas
  );
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
        <h1 className="text-brand-navy text-xl font-bold">Registro de caso</h1>
        {paqueteActivo && (
          <span className="text-sm text-neutral-600">
            Paquete activo: {paqueteActivo.casos_restantes} de{" "}
            {paqueteActivo.numero_casos} casos restantes
          </span>
        )}
      </div>

      <LeyendaRequerido className="border-y border-neutral-100 py-2.5" />

      {!paqueteActivo && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No tienes paquetes con cupo. Contrata uno en{" "}
          <Link href="/paquetes" className="underline">
            Paquetes
          </Link>{" "}
          antes de registrar un caso.
        </div>
      )}

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
                  label="Tipo de seguro"
                  options={tiposSeguro.map((t) => ({
                    value: String(t.id),
                    label: t.nombre,
                  }))}
                  value={field.value ? String(field.value) : ""}
                  onChange={(v) => onCambioTipoSeguro(v ? Number(v) : null)}
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
                  label="Aseguradora"
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
          />
        </div>
      </AccordionSection>

      {/* ── 2. Cuestionario del siniestro ── */}
      <AccordionSection
        titulo="Cuestionario del siniestro"
        descripcion="Cuéntanos qué pasó"
        obligatorio
        abiertoInicial
        forzarAbierto={intentoEnviar && errorCuestionario}
        conError={intentoEnviar && errorCuestionario}
      >
        {!tipoSeguroId ? (
          <p className="text-sm text-neutral-500">
            Selecciona primero el tipo de seguro (en &quot;Datos del
            seguro&quot;) para ver el cuestionario.
          </p>
        ) : (
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
        )}
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

      {/* ── 7. Documentos ── */}
      <AccordionSection
        titulo="Documentos"
        descripcion="Archivos del caso"
        obligatorio={false}
      >
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
      </AccordionSection>

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
