"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BrandButton } from "@/components/ui/brand-button";
import { Field } from "@/components/forms/field";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";

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
      toast.error("No pudimos iniciar sesión. Verifica tus datos.");
      setSubmitting(false);
      return;
    }

    toast.success("¡Bienvenido de vuelta!");
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
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
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
