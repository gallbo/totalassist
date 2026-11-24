"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { BrandButton } from "@/components/ui/brand-button";
import { CamposDomicilio } from "@/components/forms/campos-domicilio";
import { domicilioSchema, type DomicilioInput } from "@/lib/schemas/auth";
import { completarPerfilAction } from "../_actions";

export function CompletarPerfilForm({ inicial }: { inicial: DomicilioInput }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DomicilioInput>({
    resolver: zodResolver(domicilioSchema),
    mode: "onTouched",
    defaultValues: inicial,
  });
  const completo = domicilioSchema.safeParse(useWatch({ control })).success;

  const onSubmit = async (values: DomicilioInput) => {
    setSubmitting(true);
    const r = await completarPerfilAction(values);
    if (!r.ok) {
      toast.error(r.message);
      setSubmitting(false);
      return;
    }
    toast.success("¡Listo! Tu perfil está completo.");
    // Carga completa: el layout vuelve a leer el perfil (ya completo), quita
    // el guardia y abre el tutorial.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- se quiere carga completa
    window.location.assign("/dashboard");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <CamposDomicilio
        register={register}
        errors={errors}
        disabled={submitting}
      />
      <div className="flex justify-end">
        <BrandButton type="submit" disabled={submitting || !completo}>
          {submitting ? "Guardando..." : "Guardar y continuar"}
        </BrandButton>
      </div>
    </form>
  );
}
