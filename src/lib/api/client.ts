import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

import { traducirError } from "./errors";

const baseURL =
  process.env.NEXT_PUBLIC_SKIPPER_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export type ApiErrorPayload = {
  error?: string;
  mensaje?: string;
  errors?: Record<string, string[]>;
  detalles?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code?: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export async function request<T>(
  config: AxiosRequestConfig,
  token?: string,
): Promise<T> {
  const headers = { ...(config.headers ?? {}) } as Record<string, string>;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete headers["Content-Type"];
  }

  try {
    const response: AxiosResponse<T> = await apiClient.request<T>({
      ...config,
      headers,
    });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<ApiErrorPayload>;
    const status = ax.response?.status ?? 0;
    const data = ax.response?.data;
    const code = data?.error;
    const message = traducirError({
      code,
      status,
      mensaje: data?.mensaje,
    });
    return new ApiError(message, status, code, data?.detalles ?? data?.errors);
  }

  return new ApiError(
    "Ocurrió un problema, intenta de nuevo. Si persiste, contáctanos.",
    0,
  );
}
