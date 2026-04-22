"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BrandButton } from "@/components/ui/brand-button";
import { Field } from "@/components/forms/field";
import { recoverSchema, type RecoverInput } from "@/lib/schemas/auth";

export default function RecuperarAccesoPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverInput>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (_values: RecoverInput) => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Si el correo existe, te enviaremos instrucciones.");
    router.push("/login");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <h1 className="text-brand-navy text-center text-3xl font-bold">
        Recuperar acceso
      </h1>

      <div className="flex flex-col gap-2">
        <Field label="Correo" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            disabled={submitting}
            {...register("email")}
          />
        </Field>
        <p className="text-xs text-neutral-500">
          Ingresa el correo electrónico con el que creaste tu cuenta.
        </p>
      </div>

      <div className="flex justify-center">
        <BrandButton type="submit" disabled={submitting}>
          {submitting ? "Enviando..." : "Reestablecer contraseña"}
        </BrandButton>
      </div>

      <Separator />

      <p className="text-brand-navy text-center text-sm">
        ¿Eres nuevo por aquí?{" "}
        <Link href="/registro" className="font-semibold italic hover:underline">
          Crear una cuenta
        </Link>
      </p>
    </form>
  );
}
