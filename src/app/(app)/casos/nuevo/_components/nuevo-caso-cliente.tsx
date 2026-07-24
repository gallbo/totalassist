"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useForm,
  useFieldArray,
  Controller,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileClock, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { AccordionSection } from "@/components/ui/accordion";
import type {
  Aseguradora,
  CuestionarioPregunta,
  Estado,
  PaqueteContratado,
  TipoSeguro,
} from "@/lib/api/brokers";
import {
  CuestionarioSecciones,
  debeMostrarPregunta,
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
import { TutorialAltaCasoModal } from "./tutorial-alta-caso-modal";
import { borrarBorrador, guardarBorrador, leerBorrador } from "./borrador-caso";

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
  // Índices de pólizas que no tienen archivo adjunto al momento de intentar
  // guardar. Se limpia cuando el broker adjunta el archivo faltante.
  const [polizasSinArchivo, setPolizasSinArchivo] = useState<Set<number>>(
    new Set(),
  );

  // Banner de borrador: al montar checamos si hay uno guardado; si el
  // broker acepta restaurarlo, cargamos sus datos al form.
  const [borradorPendiente, setBorradorPendiente] = useState<{
    guardadoEn: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    reset,
    getValues,
    formState: { errors },
  } = useForm<NuevoCasoSchema>({
    resolver: zodResolver(
      nuevoCasoSchema,
    ) as unknown as Resolver<NuevoCasoSchema>,
    // Feedback inmediato al broker (Alicia, jul-2026): cada campo se
    // valida al perder el foco. Después de tocarlo una vez, sigue
    // reevaluándose en cada tecleo. Sin este modo el error solo aparecía
    // al hacer submit, forzando al broker a "adivinar" qué campo estaba mal.
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      polizas: [polizaVacia()],
      asegurados: [aseguradoFisicaVacio()],
      // Alicia (jul-2026): mostrar 1 fila vacía de beneficiarios desde
      // el inicio en lugar del botón "Agregar" con lista vacía. El broker
      // ve inmediatamente qué debe capturar.
      beneficiarios: [{ nombre: "", parentesco: "", porcentaje: null }],
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

  // ── Borrador: detectar al montar ─────────────────────────────────
  // Si el broker abandonó el form antes de terminar y quedó algo en
  // localStorage, mostramos el banner para que decida "restaurar" o
  // "empezar de cero".
  useEffect(() => {
    const b = leerBorrador();
    if (b) {
      setBorradorPendiente({ guardadoEn: b.guardadoEn });
    }
  }, []);

  // Espejo del estado como ref — usado por el timer de autoguardado
  // para leer el valor MÁS reciente sin que el closure quede stale.
  // Sin esto, el autoguardado que se programó al montar con
  // borradorPendiente=null (default de React antes de leer localStorage)
  // dispararía 500ms después y pisaría el borrador con datos vacíos —
  // exactamente el bug reportado por Juan (jul-2026): "restauro pero
  // igual quedan los campos vacíos".
  const borradorPendienteRef = useRef<{ guardadoEn: string } | null>(null);
  useEffect(() => {
    borradorPendienteRef.current = borradorPendiente;
  }, [borradorPendiente]);

  const restaurarBorrador = () => {
    const b = leerBorrador();
    if (!b) {
      setBorradorPendiente(null);
      return;
    }
    // reset() pisa TODO el form con los datos del borrador. Cualquier
    // valor default se pierde — está bien porque queremos exactamente
    // el snapshot guardado.
    reset(b.datosForm as NuevoCasoSchema);
    setRespuestas(b.respuestasCuestionario ?? {});
    setBorradorPendiente(null);
    toast.success("Borrador restaurado.");
  };

  const descartarBorrador = () => {
    borrarBorrador();
    setBorradorPendiente(null);
  };

  // ── Autoguardado con debounce ────────────────────────────────────
  // Nos suscribimos a los cambios del form + de las respuestas del
  // cuestionario y guardamos en localStorage 500ms después de la última
  // edición. El debounce evita saturar el storage con cada tecla.
  //
  // IMPORTANTE: mientras el banner "Tienes un caso a medio capturar"
  // está visible (borradorPendienteRef !== null) NO guardamos — así
  // no pisamos el borrador viejo con los defaults vacíos del form
  // recién montado antes de que el broker decida restaurar o descartar.
  const timerAutoguardadoRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const subscription = watch(() => {
      if (timerAutoguardadoRef.current) {
        clearTimeout(timerAutoguardadoRef.current);
      }
      timerAutoguardadoRef.current = setTimeout(() => {
        if (borradorPendienteRef.current) return;
        guardarBorrador(getValues(), respuestas);
      }, 500);
    });
    return () => {
      subscription.unsubscribe();
      if (timerAutoguardadoRef.current) {
        clearTimeout(timerAutoguardadoRef.current);
      }
    };
  }, [watch, getValues, respuestas]);

  // Cuando el broker responde una pregunta del cuestionario, también
  // guardamos (el cuestionario vive fuera de RHF).
  useEffect(() => {
    if (timerAutoguardadoRef.current) {
      clearTimeout(timerAutoguardadoRef.current);
    }
    timerAutoguardadoRef.current = setTimeout(() => {
      if (borradorPendienteRef.current) return;
      guardarBorrador(getValues(), respuestas);
    }, 500);
  }, [respuestas, getValues]);

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

    // Validación de archivo obligatorio por póliza (cambio jul-2026): el
    // caso NO se puede guardar si alguna póliza no tiene archivo adjunto.
    // En edición cuenta como "tiene archivo" tanto un archivo nuevo como
    // uno cargado previamente en Skipper (aquí no aplica: nuevo caso).
    const faltantes = new Set<number>();
    polizas.fields.forEach((f, idx) => {
      if (!polizaFiles[f._key]) faltantes.add(idx);
    });
    if (faltantes.size > 0) {
      setPolizasSinArchivo(faltantes);
      const labels = Array.from(faltantes)
        .sort((a, b) => a - b)
        .map((i) => `Póliza ${i + 1}`);
      const listado =
        labels.length <= 3
          ? labels.join(", ")
          : `${labels.slice(0, 3).join(", ")} y ${labels.length - 3} más`;
      toast.error(`Adjunta el archivo de: ${listado}.`);
      // Scroll a la primera póliza sin archivo.
      scrollAlPrimerError();
      return;
    }

    // Payload del cuestionario — se omiten preguntas que hoy están
    // ocultas por regla condicional. Si el broker respondió "Hospitalización"
    // (habilita ID 112), luego cambió a "Consulta o estudios" (oculta 112),
    // no queremos enviar el número de días residual — sería inconsistente.
    const cuestionarioPayload: Record<string, string> = {};
    for (const p of preguntas) {
      if (!debeMostrarPregunta(p, respuestas)) continue;
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

      // El caso se creó — limpiamos el borrador de localStorage para
      // que la próxima vez que el broker abra /casos/nuevo empiece limpio.
      borrarBorrador();
      toast.success("Caso registrado.");
      router.push("/casos");
    });
  };

  const onInvalid = (
    errores: import("react-hook-form").FieldErrors<NuevoCasoSchema>,
  ) => {
    setIntentoEnviar(true);
    // Marca también los errores del cuestionario para abrir su sección.
    const errsCuestionario = validarCuestionario(preguntas, respuestas);
    setErroresCuestionario(errsCuestionario);

    // Armamos lista de campos con nombres humanos. Si hay >3 se abrevia a
    // "Campo1, Campo2, Campo3 y N más" para no hacer un toast enorme.
    const campos = nombresDeCamposConError(errores);
    if (Object.keys(errsCuestionario).length > 0) {
      campos.push("Cuestionario del siniestro");
    }
    // Dedupe preservando orden.
    const unicos: string[] = [];
    for (const c of campos) if (!unicos.includes(c)) unicos.push(c);

    if (unicos.length > 0) {
      const listado =
        unicos.length <= 3
          ? unicos.join(", ")
          : `${unicos.slice(0, 3).join(", ")} y ${unicos.length - 3} más`;
      toast.error(`Faltan: ${listado}.`, { duration: 6000 });
    } else {
      toast.error("Revisa los campos marcados antes de continuar.");
    }

    scrollAlPrimerError();
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
    <>
      <TutorialAltaCasoModal />
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-5"
      >
        {/* Header simplificado (Alicia, jul-2026): se retiró el badge
            "Paquete activo: X de Y casos restantes" — el broker lo ve
            en el dashboard y no aporta al momento de capturar. También
            se quitó la leyenda "Obligatorio/Opcional" que quedaba de
            adorno; los campos ya se marcan con asterisco. */}
        <div className="flex items-center">
          <h1 className="text-brand-navy text-xl font-bold">
            Registro de caso
          </h1>
        </div>

        {/* Banner "restaurar borrador" — Alicia (jul-2026): "estaría muy
            bien que el formato se pudiera autoguardar sin necesidad del
            botón, que quedara como una especie de borrador". Guardamos en
            localStorage y al volver a entrar se ofrece restaurar.
            Los archivos adjuntos NO se restauran (blobs no serializables). */}
        {borradorPendiente && (
          <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FileClock className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <div>
                <p className="font-medium">Tienes un caso a medio capturar.</p>
                <p className="text-xs text-blue-800/80">
                  Se guardó automáticamente el{" "}
                  {new Date(borradorPendiente.guardadoEn).toLocaleString(
                    "es-MX",
                    { dateStyle: "medium", timeStyle: "short" },
                  )}
                  . Los archivos adjuntos deberás volver a subirlos.
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={restaurarBorrador}
                className="bg-brand-navy hover:bg-brand-navy/90 rounded-md px-3 py-1.5 text-xs font-semibold text-white"
              >
                Restaurar borrador
              </button>
              <button
                type="button"
                onClick={descartarBorrador}
                className="rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

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
          {/* Selects como dropdowns tradicionales (Alicia, jul-2026).
              Antes eran pills amarillos con modal — Alicia pidió el patrón
              clásico con etiqueta arriba + <select> estándar para que el
              broker no tenga que abrir un modal por cada dato. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="tipo_seguro_id"
              render={({ field, fieldState }) => (
                <Field
                  label="Tipo de seguro *"
                  error={fieldState.error?.message}
                >
                  <select
                    value={field.value ? String(field.value) : ""}
                    onChange={(e) =>
                      onCambioTipoSeguro(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    aria-invalid={!!fieldState.error}
                    className={`text-brand-navy focus:ring-brand-navy/30 h-10 w-full rounded-md bg-neutral-100 px-3 text-sm focus:ring-2 focus:outline-none ${
                      fieldState.error ? "ring-2 ring-red-400" : ""
                    }`}
                  >
                    <option value="">Selecciona una opción</option>
                    {tiposSeguro.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            />
            <Controller
              control={control}
              name="aseguradora_id"
              render={({ field, fieldState }) => (
                <Field label="Aseguradora *" error={fieldState.error?.message}>
                  <select
                    value={field.value ? String(field.value) : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    aria-invalid={!!fieldState.error}
                    className={`text-brand-navy focus:ring-brand-navy/30 h-10 w-full rounded-md bg-neutral-100 px-3 text-sm focus:ring-2 focus:outline-none ${
                      fieldState.error ? "ring-2 ring-red-400" : ""
                    }`}
                  >
                    <option value="">Selecciona una opción</option>
                    {aseguradoras.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
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
              onRemove={(i) => {
                polizas.remove(i);
                // Cuando el broker quita una póliza, sus índices dejan de tener
                // sentido — limpiamos el set para evitar arrastrar el error.
                setPolizasSinArchivo(new Set());
              }}
              files={polizaFiles}
              onFileChange={(key, file) => {
                setPolizaFiles((prev) => ({ ...prev, [key]: file }));
                // Al adjuntar un archivo, limpiamos ese índice del set de
                // pólizas marcadas — así el rojo desaparece en vivo.
                if (file) {
                  const idx = polizas.fields.findIndex((p) => p._key === key);
                  if (idx >= 0 && polizasSinArchivo.has(idx)) {
                    setPolizasSinArchivo((prev) => {
                      const next = new Set(prev);
                      next.delete(idx);
                      return next;
                    });
                  }
                }
              }}
              indicesSinArchivo={polizasSinArchivo}
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
          {/* Error del array (ej. suma de % no da 100) — se mostraría
              acá arriba para que el broker lo vea sin buscar. */}
          {typeof errors.beneficiarios?.message === "string" && (
            <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.beneficiarios.message}
            </div>
          )}
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
              className="w-full sm:w-auto sm:self-start"
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

        <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button
            variant="outline"
            type="button"
            className="border-brand-navy text-brand-navy hover:bg-brand-navy/5 hover:text-brand-navy h-11 w-full rounded-full bg-transparent px-6 sm:w-auto"
            render={<Link href="/casos" />}
          >
            Cancelar
          </Button>
          <BrandButton
            type="submit"
            className="w-full px-8 sm:w-auto"
            disabled={isPending || !paqueteActivo}
          >
            {isPending ? "Guardando…" : "Guardar"}
          </BrandButton>
        </div>
      </form>
    </>
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

/**
 * Mapa de nombres técnicos del schema Zod → etiqueta humana que va en el toast.
 * Solo listamos los campos de primer nivel que le importan al broker; los
 * anidados (asegurados.0.nombre, polizas.1.numero_poliza) se colapsan al
 * nombre del array para no explotar la lista.
 */
const CAMPO_LABELS: Record<string, string> = {
  tipo_seguro_id: "Tipo de seguro",
  aseguradora_id: "Aseguradora",
  polizas: "Datos de la póliza",
  fecha_siniestro: "Fecha del siniestro",
  num_siniestro_poliza: "Número de siniestro",
  asegurados: "Datos del asegurado",
  beneficiarios: "Beneficiarios",
};

/**
 * Extrae los nombres humanos de los campos con error de react-hook-form.
 * Preserva el orden en el que aparecen en el schema (los objetos JS mantienen
 * orden de inserción) para que el toast liste primero lo que está más arriba
 * en el formulario.
 */
function nombresDeCamposConError(
  errores: import("react-hook-form").FieldErrors<NuevoCasoSchema>,
): string[] {
  const nombres: string[] = [];
  for (const key of Object.keys(errores)) {
    nombres.push(CAMPO_LABELS[key] ?? key);
  }
  return nombres;
}

/**
 * Hace scroll al primer nodo con error visible. Se busca por
 *   - `[aria-invalid="true"]` (inputs de shadcn/ui marcados por hook-form)
 *   - fallback a la primera `.text-red-600` (mensajes rojos que sí se pintan)
 * Se usa requestAnimationFrame para esperar el reflow después de que
 * `intentoEnviar` fuerce a abrir los accordions.
 */
function scrollAlPrimerError() {
  requestAnimationFrame(() => {
    const target =
      document.querySelector('[aria-invalid="true"]') ||
      document.querySelector(".text-red-600");
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      // Si es focoso (input, textarea, select), le damos foco también.
      if (typeof (target as HTMLInputElement).focus === "function") {
        (target as HTMLInputElement).focus({ preventScroll: true });
      }
    }
  });
}
