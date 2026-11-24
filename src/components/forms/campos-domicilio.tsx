"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import type { DomicilioInput } from "@/lib/schemas/auth";

/** RFC y domicilio que se piden para completar el perfil (Skipper, migración 144). */
export function CamposDomicilio({
  register,
  errors,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  errors: FieldErrors<DomicilioInput>;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="RFC" htmlFor="rfc" error={errors.rfc?.message}>
        <Input
          id="rfc"
          autoCapitalize="characters"
          placeholder="Ej. PEGJ800101AB1"
          maxLength={13}
          className="uppercase placeholder:normal-case"
          disabled={disabled}
          {...register("rfc")}
        />
      </Field>
      <Field
        label="Código postal"
        htmlFor="codigo_postal"
        error={errors.codigo_postal?.message}
      >
        <Input
          id="codigo_postal"
          inputMode="numeric"
          maxLength={5}
          autoComplete="postal-code"
          disabled={disabled}
          {...register("codigo_postal")}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field
          label="Domicilio"
          htmlFor="domicilio"
          error={errors.domicilio?.message}
        >
          <Input
            id="domicilio"
            placeholder="Calle, número y colonia"
            autoComplete="street-address"
            disabled={disabled}
            {...register("domicilio")}
          />
        </Field>
      </div>
      <Field
        label="Ciudad o municipio"
        htmlFor="ciudad"
        error={errors.ciudad?.message}
      >
        <Input
          id="ciudad"
          autoComplete="address-level2"
          disabled={disabled}
          {...register("ciudad")}
        />
      </Field>
      <Field label="Estado" htmlFor="estado" error={errors.estado?.message}>
        <Input
          id="estado"
          autoComplete="address-level1"
          disabled={disabled}
          {...register("estado")}
        />
      </Field>
    </div>
  );
}
