export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5066/api";

export const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:5066";

export const STORAGE_KEY_JWT = "house_rental_jwt_token";

export interface ApiErrorPayload {
  statusCode?: number;
  message?: string;
  detail?: string;
  traceId?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      sessionStorage.getItem(STORAGE_KEY_JWT) ||
      localStorage.getItem(STORAGE_KEY_JWT)
    );
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      sessionStorage.setItem(STORAGE_KEY_JWT, token);
      localStorage.setItem(STORAGE_KEY_JWT, token);
    } else {
      sessionStorage.removeItem(STORAGE_KEY_JWT);
      localStorage.removeItem(STORAGE_KEY_JWT);
    }
  } catch {}
}

export function clearAuthToken(): void {
  setAuthToken(null);
}

export function resolveBackendImageUrl(url?: string | null): string {
  if (!url) {
    return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND_ORIGIN}${normalized}`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, headers, ...rest } = options;
  const token = skipAuth ? null : getAuthToken();

  const mergedHeaders = new Headers(headers);
  if (!mergedHeaders.has("Content-Type") && !(rest.body instanceof FormData)) {
    mergedHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...rest,
    headers: mergedHeaders,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const payload =
      typeof data === "object" && data !== null
        ? (data as ApiErrorPayload)
        : undefined;
    const message =
      payload?.message ||
      (typeof data === "string" && data) ||
      `Yêu cầu thất bại (HTTP ${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  return data as T;
}
