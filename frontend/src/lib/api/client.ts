export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5066/api";

// Khi chạy SSR bên trong Docker container, Next.js gọi trực tiếp service nội bộ (http://api:8080/api)
const SERVER_API_BASE_URL =
  process.env.INTERNAL_API_URL || API_BASE_URL;

export const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:5066";

export const STORAGE_KEY_JWT = "house_rental_jwt_token";
export const STORAGE_KEY_USER = "house_rental_mock_user";
export const AUTH_EVENT_NAME = "house_rental_auth_change";
export const SESSION_EXPIRED_EVENT = "house_rental_session_expired";

export interface ApiErrorPayload {
  statusCode?: number;
  message?: string;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
  timestamp?: string;
}

export interface BackendPageResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ApiResult<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.message) {
    return err.message;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

/**
 * Retrieve JWT from single active storage (sessionStorage if non-persistent, otherwise localStorage).
 */
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

/**
 * Store JWT in exactly ONE storage (no duplication between localStorage and sessionStorage).
 * @param token JWT access token or null to clear
 * @param persist true -> localStorage (remember me across browser restarts); false -> sessionStorage (current tab only)
 */
export function setAuthToken(token: string | null, persist = true): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY_JWT);
    localStorage.removeItem(STORAGE_KEY_JWT);
    if (token) {
      const targetStorage = persist ? localStorage : sessionStorage;
      targetStorage.setItem(STORAGE_KEY_JWT, token);
    }
  } catch {}
}

export function clearAuthToken(): void {
  setAuthToken(null);
}

/**
 * Clear both JWT and cached user profile from all browser storages.
 */
export function clearStoredAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY_JWT);
    localStorage.removeItem(STORAGE_KEY_JWT);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch {}
}

let isHandlingUnauthorized = false;

/**
 * Automatically log out user and redirect to /login when an authenticated API call returns 401 Unauthorized.
 * Debounced so concurrent 401 responses only trigger a single logout & redirect.
 */
export function handleUnauthorizedSession(): void {
  if (typeof window === "undefined") return;
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  try {
    clearStoredAuthSession();
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

    const currentPath = window.location.pathname;
    const isAuthPage =
      currentPath.startsWith("/login") || currentPath.startsWith("/register");

    if (!isAuthPage) {
      const returnTo = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`
      );
      const loginUrl = new URL(
        `/login?reason=session_expired&returnTo=${returnTo}`,
        window.location.origin
      ).toString();
      window.location.replace(loginUrl);
    }
  } finally {
    setTimeout(() => {
      isHandlingUnauthorized = false;
    }, 1500);
  }
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

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return false;

      const data = (await res.json()) as { token?: string };
      if (data?.token) {
        const persisted = Boolean(localStorage.getItem(STORAGE_KEY_JWT));
        setAuthToken(data.token, persisted);
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipAutoLogout?: boolean;
  _retriedAfterRefresh?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuth, skipAutoLogout, _retriedAfterRefresh, headers, ...rest } = options;
  const token = skipAuth ? null : getAuthToken();

  const mergedHeaders = new Headers(headers);
  if (!mergedHeaders.has("Content-Type") && !(rest.body instanceof FormData)) {
    mergedHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const activeBaseUrl =
    typeof window === "undefined" ? SERVER_API_BASE_URL : API_BASE_URL;
  const response = await fetch(`${activeBaseUrl}${normalizedPath}`, {
    ...rest,
    credentials: "include",
    headers: mergedHeaders,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  // Silent Refresh Token Rotation khi Access Token (15p) hết hạn trước khi auto-logout
  if (
    response.status === 401 &&
    !skipAuth &&
    !skipAutoLogout &&
    !_retriedAfterRefresh &&
    !normalizedPath.startsWith("/auth/refresh") &&
    !normalizedPath.startsWith("/auth/login")
  ) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, _retriedAfterRefresh: true });
    }
    handleUnauthorizedSession();
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
    const validationErrors = payload?.errors
      ? Object.values(payload.errors).flat().filter(Boolean).join(" ")
      : "";
    const message =
      payload?.message ||
      validationErrors ||
      payload?.title ||
      (typeof data === "string" && data) ||
      `Yêu cầu thất bại (HTTP ${response.status})`;

    if (response.status === 401 && !skipAuth && !skipAutoLogout && token) {
      handleUnauthorizedSession();
    }

    throw new ApiError(message, response.status, payload);
  }

  return data as T;
}
