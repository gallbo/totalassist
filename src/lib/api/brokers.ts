import { ApiError, type ApiErrorPayload, request } from "./client";

const baseURL =
  process.env.NEXT_PUBLIC_SKIPPER_API_URL ?? "http://localhost:8080";

export type RegistrarBrokerInput = {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  password: string;
  cedula: string;
  telefono?: string;
};

export type RegistrarBrokerResponse = {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  telefono?: string | null;
  cedula: string;
};

export type DireccionBroker = {
  id?: number;
  domicilio: string;
  estado: string;
  ciudad: string;
  codigo_postal: string;
  principal?: boolean;
};

export type ContactoAtencion = {
  id?: number;
  nombre: string;
  telefono: string;
};

export type Promotoria = {
  id?: number;
  nombre_promotor: string;
  nombre_promotoria: string;
  correo_promotor?: string | null;
  telefono_promotor?: string | null;
};

export const REDES_SOCIALES_VALORES = [
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "tiktok",
  "youtube",
  "whatsapp",
  "sitio_web",
  "otra",
] as const;

export type RedSocialCodigo = (typeof REDES_SOCIALES_VALORES)[number];

export type RedSocial = {
  id?: number;
  red_social: RedSocialCodigo;
  usuario: string;
};

export type BrokerMe = {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  logo_url?: string | null;
};

export type PerfilBroker = {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  telefono?: string | null;
  cedula: string;
  rfc?: string | null;
  logo_url?: string | null;
  direcciones: DireccionBroker[];
  contactos_atencion: ContactoAtencion[];
  promotorias: Promotoria[];
  redes_sociales: RedSocial[];
};

export type ActualizarPerfilInput = {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string | null;
  telefono?: string | null;
  rfc?: string | null;
  direcciones?: DireccionBroker[];
  contactos_atencion?: ContactoAtencion[];
  promotorias?: Promotoria[];
  redes_sociales?: RedSocial[];
};

export type CambiarPasswordInput = {
  password_actual: string;
  password_nueva: string;
  password_nueva_confirmation: string;
};

export type MensajeResponse = { mensaje: string };

export type Aseguradora = { id: number; nombre: string };
export type TipoSeguro = { id: number; nombre: string };
export type Estado = { id: number; nombre: string };

export type PaqueteCatalogo = {
  id: number;
  descripcion: string;
  tipo: string;
  numero_casos: number;
  precio: string;
  vigencia_dias: number;
};

export type PaqueteContratado = {
  id: number;
  paquete_id: number;
  descripcion: string | null;
  tipo: string | null;
  fecha_contratacion: string | null;
  fecha_expiracion: string | null;
  numero_casos: number;
  casos_consumidos: number;
  casos_restantes: number;
  vigente: boolean;
  activo: boolean;
};

export type CasoContactoAtencion = {
  id?: number;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
};

export type CasoBeneficiario = {
  id?: number;
  nombre: string;
  parentesco?: string | null;
  porcentaje?: number | null;
};

export type CasoArchivo = {
  id: number;
  nombre_original: string;
  mime_type: string | null;
  tamano: number | null;
  url: string | null;
  created_at: string | null;
};

export type CasoResumen = {
  id: number;
  folio: string | null;
  folio_poliza: string | null;
  num_siniestro_poliza: string | null;
  nombre: string | null;
  aseguradora: string | null;
  aseguradora_id: number | null;
  tipo_seguro: string | null;
  tipo_seguro_id: number | null;
  estatus_caso: number;
  fecha_siniestro: string | null;
  monto_estimado: string | number | null;
  created_at: string | null;
};

export type CasoDetalle = CasoResumen & {
  tipo_persona: "fisica" | "moral";
  nombre_empresa: string | null;
  nombre_comercial: string | null;
  nombre_representante: string | null;
  rfc: string | null;
  correo: string | null;
  telefono: string | null;
  celular: string | null;
  tipo_siniestro_id: number | null;
  estado_id: number | null;
  estado: string | null;
  ciudad: string | null;
  domicilio: string | null;
  contactos_atencion: CasoContactoAtencion[];
  beneficiarios: CasoBeneficiario[];
  archivos: CasoArchivo[];
  paquete: { id: number; descripcion: string | null } | null;
};

export type ListaCasos = {
  data: CasoResumen[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type RegistrarCasoInput = {
  tipo_persona: "fisica" | "moral";
  nombre_asegurado?: string | null;
  nombre_empresa?: string | null;
  nombre_comercial?: string | null;
  nombre_representante?: string | null;
  rfc?: string | null;
  correo?: string | null;
  telefono?: string | null;
  celular?: string | null;
  aseguradora_id?: number | null;
  tipo_seguro_id?: number | null;
  tipo_siniestro_id?: number | null;
  num_siniestro_poliza: string;
  folio_poliza?: string | null;
  fecha_siniestro?: string | null;
  monto_estimado?: number | null;
  estado_id?: number | null;
  ciudad?: string | null;
  domicilio?: string | null;
  codigo_postal?: string | null;
  contactos_atencion?: CasoContactoAtencion[];
  beneficiarios?: CasoBeneficiario[];
};

export type ActualizarCasoInput = Partial<RegistrarCasoInput>;

export type RegistrarCasoResponse = {
  id: number;
  folio: string | null;
  nombre: string | null;
  empresa_id: number;
  broker_paquete_id: number;
  estatus: number;
  created_at: string | null;
  paquete: { id: number; casos_restantes: number };
};

export type ListarCasosParams = {
  page?: number;
  per_page?: number;
  q?: string;
  estatus_caso?: number;
};

export type NuevoCasoBootstrap = {
  aseguradoras: Aseguradora[];
  tipos_seguro: TipoSeguro[];
  estados: Estado[];
  paquete_activo: {
    id: number;
    numero_casos: number;
    casos_consumidos: number;
    casos_restantes: number;
    fecha_expiracion: string | null;
    descripcion: string | null;
  } | null;
};

export type DashboardData = {
  broker: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
  };
  casos_counts: {
    en_proceso: number;
    interrumpido: number;
    finalizado: number;
    total: number;
  };
  paquete_activo: {
    id: number;
    casos_restantes: number;
    numero_casos: number;
    fecha_expiracion: string | null;
  } | null;
  registro_casos: {
    total: number;
    delta_porcentaje: number;
    serie: Array<{ mes: string; anio: number; valor: number }>;
  };
  favoritos: {
    aseguradora: string | null;
    tipo_seguro: string | null;
  };
};

export const brokerApi = {
  registrar(input: RegistrarBrokerInput) {
    return request<RegistrarBrokerResponse>({
      method: "POST",
      url: "/api/brokers/registro",
      data: input,
    });
  },

  recuperarAcceso(email: string) {
    return request<MensajeResponse>({
      method: "POST",
      url: "/api/brokers/recuperar",
      data: { email },
    });
  },

  resetearPassword(input: {
    token: string;
    password: string;
    password_confirmation: string;
  }) {
    return request<MensajeResponse>({
      method: "POST",
      url: "/api/brokers/resetear",
      data: input,
    });
  },

  getPerfil(token: string) {
    return request<PerfilBroker>(
      { method: "GET", url: "/api/brokers/perfil" },
      token,
    );
  },

  // Usa fetch nativo (en lugar de axios) para aprovechar el cache de Next con
  // tags. Se invalida con `revalidateTag("broker-me")` desde las server actions
  // que tocan nombre, apellidos o logo. Resultado: 1 fetch al primer render
  // post-login y 0 en navegaciones siguientes hasta que el broker cambie algo.
  async getMe(token: string): Promise<BrokerMe> {
    const res = await fetch(`${baseURL}/api/brokers/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { tags: ["broker-me"], revalidate: 300 },
    });
    if (!res.ok) {
      throw new ApiError(
        "No pudimos cargar tu sesión. Intenta recargar la página.",
        res.status,
      );
    }
    return (await res.json()) as BrokerMe;
  },

  actualizarPerfil(token: string, cambios: ActualizarPerfilInput) {
    return request<PerfilBroker>(
      {
        method: "PUT",
        url: "/api/brokers/perfil",
        data: cambios,
      },
      token,
    );
  },

  cambiarPassword(token: string, input: CambiarPasswordInput) {
    return request<MensajeResponse>(
      {
        method: "PUT",
        url: "/api/brokers/perfil/password",
        data: input,
      },
      token,
    );
  },

  async subirLogo(token: string, logo: File): Promise<PerfilBroker> {
    // Mismo motivo que subirArchivoCaso: axios v1 en Node 18+ no arma el body
    // multipart de la FormData global. fetch nativo sí lo manda correcto.
    const form = new FormData();
    form.append("_method", "PUT");
    form.append("logo", logo);

    const res = await fetch(`${baseURL}/api/brokers/perfil`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: form,
    });

    if (!res.ok) {
      let payload: ApiErrorPayload | undefined;
      try {
        payload = (await res.json()) as ApiErrorPayload;
      } catch {
        // Sin JSON; nos quedamos con el status.
      }
      throw new ApiError(
        payload?.mensaje ??
          "No pudimos guardar la foto. Intenta de nuevo en unos segundos.",
        res.status,
        payload?.error,
        payload?.detalles ?? payload?.errors,
      );
    }

    return (await res.json()) as PerfilBroker;
  },

  eliminarLogo(token: string) {
    return request<PerfilBroker>(
      {
        method: "DELETE",
        url: "/api/brokers/perfil/logo",
      },
      token,
    );
  },

  logout(token: string) {
    return request<MensajeResponse>(
      { method: "POST", url: "/api/brokers/logout" },
      token,
    );
  },

  getAseguradoras(token: string) {
    return request<Aseguradora[]>(
      { method: "GET", url: "/api/brokers/catalogos/aseguradoras" },
      token,
    );
  },

  getTiposSeguro(token: string) {
    return request<TipoSeguro[]>(
      { method: "GET", url: "/api/brokers/catalogos/tipos-seguro" },
      token,
    );
  },

  getEstados(token: string) {
    return request<Estado[]>(
      { method: "GET", url: "/api/brokers/catalogos/estados" },
      token,
    );
  },

  getCatalogoPaquetes(token: string) {
    return request<PaqueteCatalogo[]>(
      { method: "GET", url: "/api/brokers/paquetes/catalogo" },
      token,
    );
  },

  getPaquetes(token: string) {
    return request<PaqueteContratado[]>(
      { method: "GET", url: "/api/brokers/paquetes" },
      token,
    );
  },

  contratarPaquete(token: string, paqueteId: number) {
    return request<PaqueteContratado>(
      {
        method: "POST",
        url: "/api/brokers/paquetes/contratar",
        data: { paquete_id: paqueteId },
      },
      token,
    );
  },

  getCasos(token: string, params: ListarCasosParams = {}) {
    return request<ListaCasos>(
      {
        method: "GET",
        url: "/api/brokers/casos",
        params,
      },
      token,
    );
  },

  getCaso(token: string, id: number) {
    return request<CasoDetalle>(
      { method: "GET", url: `/api/brokers/casos/${id}` },
      token,
    );
  },

  registrarCaso(token: string, input: RegistrarCasoInput) {
    return request<RegistrarCasoResponse>(
      {
        method: "POST",
        url: "/api/brokers/casos",
        data: input,
      },
      token,
    );
  },

  actualizarCaso(token: string, id: number, input: ActualizarCasoInput) {
    return request<CasoDetalle>(
      {
        method: "PUT",
        url: `/api/brokers/casos/${id}`,
        data: input,
      },
      token,
    );
  },

  async subirArchivoCaso(
    token: string,
    casoId: number,
    archivo: File,
  ): Promise<CasoArchivo> {
    // Usamos fetch directamente en lugar de axios porque axios v1 en Node 18+
    // no arma bien el body multipart cuando recibe la FormData global del runtime
    // (espera la lib form-data). El archivo terminaba viajando vacío y Skipper
    // respondía 422 archivo_requerido.
    const form = new FormData();
    form.append("archivo", archivo);

    const res = await fetch(`${baseURL}/api/brokers/casos/${casoId}/archivos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: form,
    });

    if (!res.ok) {
      let payload: ApiErrorPayload | undefined;
      try {
        payload = (await res.json()) as ApiErrorPayload;
      } catch {
        // Respuesta sin JSON; usamos el status para mapear el mensaje.
      }
      throw new ApiError(
        payload?.mensaje ??
          "No pudimos subir el archivo. Intenta de nuevo en unos segundos.",
        res.status,
        payload?.error,
        payload?.detalles ?? payload?.errors,
      );
    }

    return (await res.json()) as CasoArchivo;
  },

  getNuevoCasoBootstrap(token: string) {
    return request<NuevoCasoBootstrap>(
      { method: "GET", url: "/api/brokers/catalogos/nuevo-caso" },
      token,
    );
  },

  getDashboard(token: string) {
    return request<DashboardData>(
      { method: "GET", url: "/api/brokers/dashboard" },
      token,
    );
  },

  borrarArchivoCaso(token: string, casoId: number, archivoId: number) {
    return request<MensajeResponse>(
      {
        method: "DELETE",
        url: `/api/brokers/casos/${casoId}/archivos/${archivoId}`,
      },
      token,
    );
  },
};
