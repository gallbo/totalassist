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
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";

export default function RegistroPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (_values: RegisterInput) => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Cuenta creada. Inicia sesión con tus credenciales.");
    router.push("/login");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <h1 className="text-brand-navy text-center text-3xl font-bold">
        Crear cuenta
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Nombre(s)"
          htmlFor="firstName"
          error={errors.firstName?.message}
        >
          <Input
            id="firstName"
            autoComplete="given-name"
            disabled={submitting}
            {...register("firstName")}
          />
        </Field>

        <Field
          label="Apellido(s)"
          htmlFor="lastName"
          error={errors.lastName?.message}
        >
          <Input
            id="lastName"
            autoComplete="family-name"
            disabled={submitting}
            {...register("lastName")}
          />
        </Field>

        <Field label="Correo" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={submitting}
            {...register("email")}
          />
        </Field>

        <Field label="Teléfono" htmlFor="phone" error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            disabled={submitting}
            {...register("phone")}
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

        <Field
          label="Confirmar"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={submitting}
            {...register("confirmPassword")}
          />
        </Field>
      </div>

      <div className="flex justify-center">
        <BrandButton type="submit" disabled={submitting}>
          {submitting ? "Registrando..." : "Registrarme"}
        </BrandButton>
      </div>

      <Separator />

      <p className="text-brand-navy text-center text-sm">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="font-semibold italic hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
