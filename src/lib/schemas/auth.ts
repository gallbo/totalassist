import { z } from "zod";

const passwordPolicy = z
  .string()
  .regex(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{10,}$/,
    "Tu contraseña debe tener al menos 10 caracteres, con mayúsculas, minúsculas, números y un símbolo.",
  );

const cedulaPolicy = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(
    z
      .string()
      .regex(
        /^(?:[A-Z]\d{6}|\d{5})$/,
        "La cédula debe ser una letra seguida de 6 dígitos o 5 dígitos si es provisional.",
      ),
  );

export const loginSchema = z.object({
  email: z.email({ message: "Ingresa un correo válido" }),
  password: z.string().min(1, "Escribe tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nombre: z.string().trim().min(2, "Ingresa tu nombre"),
    apellido_paterno: z.string().trim().min(2, "Ingresa tu apellido paterno"),
    apellido_materno: z
      .string()
      .trim()
      .max(150, "Apellido materno demasiado largo")
      .optional()
      .or(z.literal("")),
    email: z.email({ message: "Ingresa un correo válido" }),
    telefono: z
      .string()
      .trim()
      .min(8, "Ingresa un teléfono válido")
      .regex(/^[0-9+\-\s()]+$/, "Solo números y símbolos de teléfono"),
    cedula: cedulaPolicy,
    password: passwordPolicy,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const recoverSchema = z.object({
  email: z.email({ message: "Ingresa un correo válido" }),
});

export type RecoverInput = z.infer<typeof recoverSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordPolicy,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
