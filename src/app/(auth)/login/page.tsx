"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { BrandButton } from "@/components/ui/brand-button";
import { Field } from "@/components/forms/field";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";

// Aviso al volver a login tras cambiar la contraseña o expirar la sesión.
function AvisoSesion() {
  const params = useSearchParams();
  const motivo = params.get("password")
    ? "Tu contraseña se actualizó. Inicia sesión con tu nueva contraseña."
    : params.get("expirada")
      ? "Tu sesión expiró. Vuelve a iniciar sesión para continuar."
      : null;

  if (!motivo) return null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center text-sm text-blue-900">
      {motivo}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    setSubmitting(true);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      const message =
        result.error === "CredentialsSignin"
          ? "Correo o contraseña incorrectos."
          : "No pudimos iniciar sesión. Intenta de nuevo en un momento.";
      toast.error(message);
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <h1 className="text-brand-navy text-center text-3xl font-bold">
        ¡Hola Broker!
      </h1>

      <Suspense fallback={null}>
        <AvisoSesion />
      </Suspense>

      <div className="flex flex-col gap-4">
        <Field label="Correo" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            disabled={submitting}
            {...register("email")}
          />
        </Field>

        <Field
          label="Contraseña"
          htmlFor="password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            disabled={submitting}
            {...register("password")}
          />
        </Field>
      </div>

      <div className="flex flex-col items-center gap-3">
        <BrandButton type="submit" disabled={submitting}>
          {submitting ? "Iniciando..." : "Iniciar sesión"}
        </BrandButton>

        <Link
          href="/recuperar-acceso"
          className="text-brand-navy text-sm hover:underline"
        >
          Olvidé mi contraseña
        </Link>
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
