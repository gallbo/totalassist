"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BrandButton } from "@/components/ui/brand-button";
import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/select-input";
import { Field } from "@/components/forms/field";
import type { CasoDetalle, CuestionarioPregunta } from "@/lib/api/brokers";
import { guardarCuestionarioAction } from "../_actions";

// Prefijamos el nombre del campo para que react-hook-form no interprete el id
// numérico de la pregunta como índice de arreglo (respuestas.1 → array). Al
// enviar reconstruimos el mapa { pregunta_id: respuesta } que espera Skipper.
const nombreCampo = (id: number) => `respuesta_${id}`;

type FormValues = Record<string, string>;

export function CuestionarioCliente({
  caso,
  preguntas,
}: {
  caso: CasoDetalle;
  preguntas: CuestionarioPregunta[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, control, handleSubmit } = useForm<FormValues>({
    defaultValues: Object.fromEntries(
      preguntas.map((p) => [nombreCampo(p.pregunta_id), p.respuesta ?? ""]),
    ),
  });

  const onSubmit = (values: FormValues) => {
    const respuestas: Record<string, string> = {};
    for (const p of preguntas) {
      respuestas[String(p.pregunta_id)] =
        values[nombreCampo(p.pregunta_id)] ?? "";
    }
    startTransition(async () => {
      const result = await guardarCuestionarioAction(caso.id, respuestas);
      if (result.ok) {
        toast.success("Cuestionario guardado.");
        router.push(`/casos/${caso.id}`);
      } else {
        toast.error(result.message);
      }
    });
  };

  const titulo = caso.folio ? `Folio ${caso.folio}` : `Caso #${caso.id}`;

  const renderControl = (p: CuestionarioPregunta) => {
    const campo = nombreCampo(p.pregunta_id);
    const id = `pregunta-${p.pregunta_id}`;

    if (p.tipo === "si_no") {
      return (
        <div className="flex gap-6 pt-1">
          {["Sí", "No"].map((opcion) => (
            <label
              key={opcion}
              className="text-brand-navy flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                value={opcion}
                disabled={isPending}
                {...register(campo)}
              />
              {opcion}
            </label>
          ))}
        </div>
      );
    }

    if (p.tipo === "escala" || p.tipo === "opciones") {
      return (
        <Controller
          control={control}
          name={campo}
          render={({ field }) => (
            <SelectInput
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              disabled={isPending}
              placeholder="Selecciona una opción"
              options={p.opciones.map((o) => ({ value: o, label: o }))}
            />
          )}
        />
      );
    }

    if (p.tipo === "fecha") {
      return (
        <Input id={id} type="date" disabled={isPending} {...register(campo)} />
      );
    }

    if (p.tipo === "numero") {
      return (
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          placeholder="Tu respuesta"
          disabled={isPending}
          {...register(campo)}
        />
      );
    }

    return (
      <Input
        id={id}
        placeholder="Tu respuesta"
        disabled={isPending}
        {...register(campo)}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={`/casos/${caso.id}`}
          className="text-brand-navy/70 hover:text-brand-navy inline-flex w-fit items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al caso
        </Link>
        <h1 className="text-brand-navy text-xl font-bold">
          Cuestionario del siniestro
        </h1>
        <p className="text-sm text-neutral-600">
          {titulo}
          {caso.tipo_seguro ? ` · ${caso.tipo_seguro}` : ""}
        </p>
      </div>

      {preguntas.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Este tipo de caso aún no tiene cuestionario.
        </p>
      ) : (
        <>
          <p className="text-sm text-neutral-600">
            Cuéntanos los detalles del siniestro. Esta información ayuda a
            nuestro equipo a atender a tu cliente más rápido.
          </p>

          <div className="flex flex-col gap-4">
            {preguntas.map((p) => (
              <Field
                key={p.pregunta_id}
                label={p.texto}
                htmlFor={`pregunta-${p.pregunta_id}`}
              >
                {renderControl(p)}
              </Field>
            ))}
          </div>

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
              {isPending ? "Guardando…" : "Guardar cuestionario"}
            </BrandButton>
          </div>
        </>
      )}
    </form>
  );
}
