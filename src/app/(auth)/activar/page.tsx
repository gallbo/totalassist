"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BrandButton } from "@/components/ui/brand-button";
import { Field } from "@/components/forms/field";
import { CorreoEnviado } from "@/components/correo-enviado";
import { recoverSchema, type RecoverInput } from "@/lib/schemas/auth";
import { brokerApi } from "@/lib/api/brokers";
import { toast } from "@/lib/toast";
import { ApiError } from "@/lib/api/client";

/** Pedir una liga de activación nueva (vencida o perdida). */
export default function PedirActivacionPage() {
  const [enviado, setEnviado] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverInput>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: RecoverInput) => {
    try {
      await brokerApi.reenviarActivacion(email);
      setEnviado(email);
    } catch (e) {
      toast.error(
        e instanceof ApiError
          ? e.message
          : "No pudimos enviar el correo. Intenta de nuevo.",
      );
    }
  };

  if (enviado) return <CorreoEnviado email={enviado} />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-brand-navy text-3xl font-bold">Activa tu cuenta</h1>
        <p className="text-sm text-neutral-600">
          Escribe el correo con el que te registraste y te enviaremos una liga
          nueva para activar tu cuenta.
        </p>
      </div>
      <Field label="Correo" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          {...register("email")}
        />
      </Field>
      <div className="flex justify-center">
        <BrandButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar liga"}
        </BrandButton>
      </div>
      <Separator />
      <p className="text-brand-navy text-center text-sm">
        ¿Ya activaste tu cuenta?{" "}
        <Link href="/login" className="font-semibold italic hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
