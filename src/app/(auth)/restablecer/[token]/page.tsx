"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { BrandButton } from "@/components/ui/brand-button";
import { Field } from "@/components/forms/field";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/schemas/auth";
import { brokerApi } from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";

export default function RestablecerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [tokenInvalido, setTokenInvalido] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    setSubmitting(true);
    try {
      await brokerApi.resetearPassword({
        token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      toast.success("Tu contraseña se actualizó. Ya puedes iniciar sesión.");
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError) {
        if (
          error.code === "token_invalido" ||
          error.code === "token_expirado"
        ) {
          setTokenInvalido(true);
        }
        toast.error(error.message);
      } else {
        toast.error(
          "Ocurrió un problema, intenta de nuevo. Si persiste, contáctanos.",
        );
      }
      setSubmitting(false);
    }
  };

  if (tokenInvalido) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <h1 className="text-brand-navy text-3xl font-bold">Enlace no válido</h1>
        <p className="text-sm text-neutral-600">
          El enlace para restablecer tu contraseña ya se usó o caducó. Solicita
          uno nuevo desde la página de recuperación.
        </p>
        <div className="flex justify-center">
          <Link href="/recuperar-acceso">
            <BrandButton type="button">Solicitar nuevo enlace</BrandButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <h1 className="text-brand-navy text-center text-3xl font-bold">
        Nueva contraseña
      </h1>

      <p className="text-center text-sm text-neutral-600">
        Elige una contraseña segura para tu cuenta. Debe tener al menos 10
        caracteres, con mayúsculas, minúsculas, números y un símbolo.
      </p>

      <div className="flex flex-col gap-4">
        <Field
          label="Nueva contraseña"
          htmlFor="password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            disabled={submitting}
            {...register("password")}
          />
        </Field>

        <Field
          label="Confirmar contraseña"
          htmlFor="password_confirmation"
          error={errors.password_confirmation?.message}
        >
          <PasswordInput
            id="password_confirmation"
            autoComplete="new-password"
            disabled={submitting}
            {...register("password_confirmation")}
          />
        </Field>
      </div>

      <div className="flex justify-center">
        <BrandButton type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : "Actualizar contraseña"}
        </BrandButton>
      </div>

      <Separator />

      <p className="text-brand-navy text-center text-sm">
        ¿Recordaste tu contraseña?{" "}
        <Link href="/login" className="font-semibold italic hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
