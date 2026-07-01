export const TERMINOS_VERSION = "2026-07-01";

export type TerminosSeccion = {
  titulo: string;
  parrafos: string[];
};

export const TERMINOS_SECCIONES: TerminosSeccion[] = [
  {
    titulo: "1. Aceptación",
    parrafos: [
      "Al crear una cuenta y utilizar Total Assist aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con ellos, te pedimos que no continúes con el registro ni con el uso de la plataforma.",
    ],
  },
  {
    titulo: "2. Descripción del servicio",
    parrafos: [
      "Total Assist es una plataforma dirigida a agentes y corredores de seguros para registrar y dar seguimiento a las reclamaciones de sus asegurados. El alcance de la atención depende del paquete contratado y de la disponibilidad del servicio.",
    ],
  },
  {
    titulo: "3. Cuenta y responsabilidad del usuario",
    parrafos: [
      "Eres responsable de mantener la confidencialidad de tus credenciales y de toda la actividad que ocurra en tu cuenta. La información que registres debe ser veraz y encontrarse actualizada.",
      "El correo y la cédula asociados a tu cuenta se registran de forma permanente y no pueden modificarse una vez creada la cuenta.",
    ],
  },
  {
    titulo: "4. Uso aceptable",
    parrafos: [
      "Te comprometes a utilizar la plataforma con apego a la ley y a no emplearla para fines distintos a los previstos. Nos reservamos el derecho de suspender cuentas que hagan un uso indebido del servicio.",
    ],
  },
  {
    titulo: "5. Disponibilidad del servicio",
    parrafos: [
      "Trabajamos para mantener la plataforma disponible, pero el registro de nuevos casos puede limitarse temporalmente por razones operativas o de capacidad. Te informaremos cuando el servicio vuelva a estar disponible.",
    ],
  },
  {
    titulo: "6. Protección de datos",
    parrafos: [
      "Los datos personales que compartas se tratan conforme a nuestro aviso de privacidad. Únicamente se utilizan para operar el servicio y dar seguimiento a las reclamaciones registradas.",
    ],
  },
  {
    titulo: "7. Cambios a estos términos",
    parrafos: [
      "Podemos actualizar estos términos cuando sea necesario. La versión vigente se identifica por su fecha y estará siempre disponible en esta página. El uso continuo del servicio después de una actualización implica la aceptación de la nueva versión.",
    ],
  },
];
