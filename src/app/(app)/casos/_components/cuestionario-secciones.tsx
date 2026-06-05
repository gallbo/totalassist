"use client";

import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/select-input";
import { Field } from "@/components/forms/field";
import type { CuestionarioPregunta } from "@/lib/api/brokers";
import { cn } from "@/lib/utils";

// Secciones del cuestionario del siniestro (formato "Página broker - siniestro").
// Sección I: campos obligatorios — la fecha y el número de siniestro viven en el
// caso (los renderiza el form padre vía `camposCaso`); aquí van las preguntas que
// no tienen campo propio. Sección II: al menos una pregunta contestada.

export type RespuestasCuestionario = Record<number, string>;
export type ErroresCuestionario = Record<string, string>;

export function validarCuestionario(
  preguntas: CuestionarioPregunta[],
  respuestas: RespuestasCuestionario,
): ErroresCuestionario {
  const errores: ErroresCuestionario = {};

  for (const p of preguntas) {
    if (
      p.seccion === 1 &&
      p.obligatoria &&
      !respuestas[p.pregunta_id]?.trim()
    ) {
      errores[String(p.pregunta_id)] = "Este campo es obligatorio.";
    }
  }

  const seccionDos = preguntas.filter((p) => p.seccion === 2);
  const contestoAlguna = seccionDos.some((p) =>
    respuestas[p.pregunta_id]?.trim(),
  );
  if (seccionDos.length > 0 && !contestoAlguna) {
    errores.seccion_2 = "Contesta al menos una pregunta de esta sección.";
  }

  return errores;
}

export function respuestaYaSeReporto(
  preguntas: CuestionarioPregunta[],
  respuestas: RespuestasCuestionario,
): string | null {
  const pregunta = preguntas.find(
    (p) => p.seccion === 1 && p.texto.toLowerCase().includes("ya se report"),
  );
  return pregunta ? (respuestas[pregunta.pregunta_id] ?? null) : null;
}

export function PreguntaControl({
  pregunta,
  valor,
  onChange,
  disabled,
  error,
}: {
  pregunta: CuestionarioPregunta;
  valor: string;
  onChange: (valor: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const etiqueta = pregunta.obligatoria
    ? `${pregunta.texto} *`
    : pregunta.texto;
  const inputId = `pregunta-${pregunta.pregunta_id}`;

  let control: React.ReactNode;

  if (pregunta.tipo === "si_no") {
    control = (
      <div className="flex gap-6 pt-1">
        {["Sí", "No"].map((opcion) => (
          <label
            key={opcion}
            className="text-brand-navy flex items-center gap-2 text-sm"
          >
            <input
              type="radio"
              checked={valor === opcion}
              disabled={disabled}
              onChange={() => onChange(opcion)}
            />
            {opcion}
          </label>
        ))}
      </div>
    );
  } else if (pregunta.tipo === "escala" || pregunta.tipo === "opciones") {
    control = (
      <SelectInput
        value={valor}
        onValueChange={onChange}
        disabled={disabled}
        invalid={!!error}
        placeholder="Selecciona una opción"
        options={pregunta.opciones.map((o) => ({ value: o, label: o }))}
      />
    );
  } else if (pregunta.tipo === "fecha") {
    control = (
      <Input
        id={inputId}
        type="date"
        value={valor}
        disabled={disabled}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else if (pregunta.tipo === "numero") {
    control = (
      <Input
        id={inputId}
        type="number"
        inputMode="numeric"
        placeholder="Tu respuesta"
        value={valor}
        disabled={disabled}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else if (pregunta.tipo === "texto_largo") {
    control = (
      <textarea
        id={inputId}
        rows={3}
        placeholder="Tu respuesta"
        value={valor}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "rounded-xl bg-neutral-200/90 px-4 py-3 text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]",
          "focus:ring-brand-navy/30 placeholder:text-neutral-500 focus:bg-white focus:ring-2 focus:outline-none",
          "disabled:opacity-60",
          error && "ring-2 ring-red-400",
        )}
      />
    );
  } else {
    control = (
      <Input
        id={inputId}
        placeholder="Tu respuesta"
        value={valor}
        disabled={disabled}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <Field label={etiqueta} htmlFor={inputId} error={error}>
      {control}
    </Field>
  );
}

export function CuestionarioSecciones({
  preguntas,
  tipoSeguroNombre,
  respuestas,
  onRespuesta,
  errores,
  disabled,
  camposCaso,
}: {
  preguntas: CuestionarioPregunta[];
  tipoSeguroNombre: string | null;
  respuestas: RespuestasCuestionario;
  onRespuesta: (preguntaId: number, valor: string) => void;
  errores: ErroresCuestionario;
  disabled?: boolean;
  camposCaso?: React.ReactNode;
}) {
  const seccionUno = preguntas.filter((p) => p.seccion === 1);
  const seccionDos = preguntas.filter((p) => p.seccion === 2);

  if (preguntas.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Selecciona el tipo de seguro para ver el cuestionario.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          Tipo de siniestro
        </span>
        <span className="bg-brand-navy rounded-full px-4 py-1 text-sm font-bold text-white">
          {tipoSeguroNombre ?? "—"}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-brand-navy text-sm font-semibold">
          Sección I · Información del siniestro{" "}
          <span className="font-normal text-neutral-500">
            (campos obligatorios)
          </span>
        </h3>
        {camposCaso}
        {seccionUno.map((p) => (
          <PreguntaControl
            key={p.pregunta_id}
            pregunta={p}
            valor={respuestas[p.pregunta_id] ?? ""}
            onChange={(v) => onRespuesta(p.pregunta_id, v)}
            disabled={disabled}
            error={errores[String(p.pregunta_id)]}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 border-t border-neutral-200 pt-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-brand-navy text-sm font-semibold">
            Sección II · Detalles del siniestro{" "}
            <span className="font-normal text-neutral-500">
              (contesta al menos una)
            </span>
          </h3>
          {errores.seccion_2 ? (
            <span className="text-xs text-red-600">{errores.seccion_2}</span>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {seccionDos.map((p) => (
            <PreguntaControl
              key={p.pregunta_id}
              pregunta={p}
              valor={respuestas[p.pregunta_id] ?? ""}
              onChange={(v) => onRespuesta(p.pregunta_id, v)}
              disabled={disabled}
              error={errores[String(p.pregunta_id)]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
