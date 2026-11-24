import { z } from "zod";

export const REQUISITOS_PASSWORD = [
  { texto: "Mínimo 8 caracteres", cumple: (v: string) => v.length >= 8 },
  {
    texto: "Al menos 1 letra mayúscula",
    cumple: (v: string) => /[A-Z]/.test(v),
  },
  { texto: "Al menos 1 número", cumple: (v: string) => /\d/.test(v) },
  { texto: "Al menos 1 símbolo", cumple: (v: string) => /[\W_]/.test(v) },
];

const passwordPolicy = z
  .string()
  .regex(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
    "Tu contraseña debe tener al menos 8 caracteres, con una mayúscula, un número y un símbolo.",
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

export const registerSchema = z.object({
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
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Registro en dos pasos (Skipper, migración 144): en la activación el agente
// define su contraseña y completa su perfil con domicilio y RFC.
const rfcPolicy = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase().replace(/\s+/g, ""))
  .pipe(
    z
      .string()
      .regex(
        /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/,
        "El RFC debe tener 13 caracteres (persona física) o 12 (persona moral).",
      ),
  );

export const domicilioSchema = z.object({
  rfc: rfcPolicy,
  domicilio: z.string().trim().min(5, "Escribe calle, número y colonia"),
  ciudad: z.string().trim().min(2, "Escribe tu ciudad o municipio"),
  estado: z.string().trim().min(2, "Escribe tu estado"),
  codigo_postal: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos"),
});

export type DomicilioInput = z.infer<typeof domicilioSchema>;

export const activarCuentaSchema = domicilioSchema
  .extend({
    password: passwordPolicy,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

export type ActivarCuentaFormInput = z.infer<typeof activarCuentaSchema>;

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
