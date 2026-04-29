const FALLBACK_GENERICO =
  "Ocurrió un problema, intenta de nuevo. Si persiste, contáctanos.";

const MENSAJES_POR_CODIGO: Record<string, string> = {
  cedula_invalida:
    "No encontramos tu cédula en el padrón de CNSF. Verifica el número.",
  email_duplicado: "Este correo ya está registrado. ¿Quieres iniciar sesión?",
  validacion: "Algunos datos no son válidos. Revisa el formulario.",
  password_actual_incorrecta: "Tu contraseña actual no es correcta.",
  token_invalido: "El enlace es inválido o ya se usó. Solicita uno nuevo.",
  token_expirado: "El enlace caducó. Solicita uno nuevo.",
  cuenta_inexistente: "No encontramos una cuenta con ese correo.",
  no_autenticado: "Tu sesión expiró. Vuelve a iniciar sesión.",
  sin_cupos: "Tu paquete activo no tiene cupos disponibles.",
  paquete_invalido: "Ese paquete no está disponible.",
  paquete_vigente_existente:
    "Ya tienes un paquete vigente. Podrás contratar otro cuando caduque.",
  caso_no_encontrado: "No encontramos el caso.",
  archivo_requerido: "Selecciona un archivo.",
  archivo_invalido: "El archivo no se pudo leer. Intenta con otro.",
  archivo_grande: "El archivo supera el tamaño máximo permitido (10 MB).",
  archivo_no_encontrado: "El archivo ya no existe.",
  almacenamiento_no_disponible:
    "No pudimos guardar el archivo, intenta de nuevo en unos segundos.",
};

export function traducirError(input: {
  code?: string;
  status: number;
  mensaje?: string;
}): string {
  const { code, status, mensaje } = input;

  if (code && MENSAJES_POR_CODIGO[code]) {
    return MENSAJES_POR_CODIGO[code];
  }

  if (status === 401) return "Tu sesión expiró. Vuelve a iniciar sesión.";
  if (status === 429) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }
  if (status >= 500) return FALLBACK_GENERICO;
  if (status === 0) {
    return "No pudimos conectar con el servidor. Revisa tu conexión.";
  }

  if (mensaje && esTextoAmigable(mensaje)) return mensaje;
  return FALLBACK_GENERICO;
}

function esTextoAmigable(texto: string): boolean {
  const tieneEspacios = /\s/.test(texto);
  const noParecePuroSnakeCase = !/^[a-z][a-z0-9_]*$/.test(texto);
  return tieneEspacios && noParecePuroSnakeCase && texto.length < 240;
}
