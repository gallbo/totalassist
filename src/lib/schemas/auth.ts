import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Ingresa un correo válido" }),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Ingresa tu nombre"),
    lastName: z.string().min(2, "Ingresa tus apellidos"),
    email: z.email({ message: "Ingresa un correo válido" }),
    phone: z
      .string()
      .min(8, "Ingresa un teléfono válido")
      .regex(/^[0-9+\-\s()]+$/, "Solo números y símbolos de teléfono"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const recoverSchema = z.object({
  email: z.email({ message: "Ingresa un correo válido" }),
});

export type RecoverInput = z.infer<typeof recoverSchema>;
