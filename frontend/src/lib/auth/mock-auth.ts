"use client";

import * as React from "react";
import { User, UserRole, ViewingRequest, Listing } from "@/types";
import { mockUsers } from "@/mocks/users";
import { mockListings } from "@/mocks/listings";
import { mockViewingRequests } from "@/mocks/viewings";
import {
  apiRequest,
  ApiError,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/lib/api/client";

const STORAGE_KEY_USER = "house_rental_mock_user";
const STORAGE_KEY_REGISTERED_USERS = "house_rental_registered_users";
const STORAGE_KEY_FAVORITES = "house_rental_mock_favorites";
const STORAGE_KEY_VIEWINGS = "house_rental_viewings";
const AUTH_EVENT_NAME = "house_rental_auth_change";

interface BackendAuthUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  dateOfBirth?: string;
}

interface BackendAuthResponse {
  message?: string;
  token: string;
  expiresAt?: string;
  user: BackendAuthUser;
}

function mapBackendRole(role?: string): UserRole {
  const normalized = (role || "").trim().toLowerCase();
  if (normalized === "admin") return "admin";
  if (normalized === "owner" || normalized === "landlord" || normalized === "manager") {
    return "landlord";
  }
  return "tenant";
}

function mapBackendUserToFrontend(user: BackendAuthUser): User {
  const mappedRole = mapBackendRole(user.role);
  return {
    id: String(user.id),
    name: user.fullName || user.username,
    fullName: user.fullName || user.username,
    email: user.email,
    phone: "0900000000",
    phoneNumber: "0900000000",
    role: mappedRole,
    status: "active",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    createdAt: new Intl.DateTimeFormat("vi-VN").format(new Date()),
  };
}

/**
 * Returns all valid users in system (predefined mock users + registered users)
 */
export function getAllUsers(): User[] {
  let registered: User[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
      if (raw) {
        registered = JSON.parse(raw);
        if (!Array.isArray(registered)) registered = [];
      }
    } catch {}
  }
  return [...mockUsers, ...registered];
}

/**
 * Validates and retrieves the current authenticated user session.
 * Supports both Backend JWT sessions and local demo sessions.
 */
export function getMockCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    let raw = sessionStorage.getItem(STORAGE_KEY_USER);
    if (!raw) {
      raw = localStorage.getItem(STORAGE_KEY_USER);
    }
    if (!raw) return null;

    const parsed: Partial<User> = JSON.parse(raw);
    if (!parsed || !parsed.email || !parsed.role) return null;

    // If a real JWT token is stored, trust the authenticated API user session
    if (getAuthToken() && parsed.id && parsed.name && parsed.status !== "suspended") {
      return parsed as User;
    }

    const allUsers = getAllUsers();
    const verifiedUser = allUsers.find(
      (u) =>
        u.email.toLowerCase() === (parsed.email || "").toLowerCase() &&
        u.role === parsed.role &&
        u.status !== "suspended"
    );

    if (verifiedUser) {
      return verifiedUser;
    }

    sessionStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch {}
  return null;
}

export function setMockCurrentUser(user: User | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      const allUsers = getAllUsers();
      const exists = allUsers.some(
        (u) => u.email.toLowerCase() === user.email.toLowerCase()
      );
      if (!exists) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
          const currentRegistered: User[] = raw ? JSON.parse(raw) : [];
          currentRegistered.push(user);
          localStorage.setItem(
            STORAGE_KEY_REGISTERED_USERS,
            JSON.stringify(currentRegistered)
          );
        } catch {}
      }

      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  } catch {}
}

/**
 * Login against ASP.NET Core Web API (/api/auth/login) and persist JWT Bearer token.
 * Falls back to local mock users only when the backend server is unreachable.
 */
export async function loginWithApi(
  usernameOrEmail: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string; viaApi?: boolean }> {
  const identifier = usernameOrEmail.trim();
  if (!identifier) {
    return { success: false, error: "Vui lòng nhập tên đăng nhập hoặc email." };
  }
  if (!password) {
    return { success: false, error: "Vui lòng nhập mật khẩu." };
  }

  try {
    const response = await apiRequest<BackendAuthResponse>("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        username: identifier,
        password,
      }),
    });

    if (response?.token && response?.user) {
      setAuthToken(response.token);
      const frontendUser = mapBackendUserToFrontend(response.user);
      setMockCurrentUser(frontendUser);
      return { success: true, user: frontendUser, viaApi: true };
    }
    return {
      success: false,
      error: "Không nhận được thông tin xác thực từ máy chủ.",
    };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: "Không thể kết nối tới máy chủ Backend. Vui lòng kiểm tra API đang chạy.",
    };
  }
}

/**
 * Register against ASP.NET Core Web API (/api/auth/register) and persist JWT Bearer token.
 */
export async function registerWithApi(payload: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: "tenant" | "landlord";
}): Promise<{ success: boolean; user?: User; error?: string; viaApi?: boolean }> {
  const cleanEmail = payload.email.trim().toLowerCase();
  const derivedUsername =
    cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "_") ||
    `user_${Date.now()}`;

  try {
    const response = await apiRequest<BackendAuthResponse>("/auth/register", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        username: derivedUsername,
        fullName: payload.fullName.trim(),
        email: cleanEmail,
        password: payload.password,
        phone: payload.phone.trim(),
        role: payload.role === "landlord" ? "Owner" : "Tenant",
        dateOfBirth: "1998-01-01",
      }),
    });

    if (response?.token && response?.user) {
      setAuthToken(response.token);
      const frontendUser = mapBackendUserToFrontend(response.user);
      frontendUser.phone = payload.phone.trim();
      frontendUser.phoneNumber = payload.phone.trim();
      setMockCurrentUser(frontendUser);
      return { success: true, user: frontendUser, viaApi: true };
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
  }

  // Fallback local session if backend is offline
  const newUser: User = {
    id: `usr_${Date.now()}`,
    name: payload.fullName.trim(),
    fullName: payload.fullName.trim(),
    email: cleanEmail,
    phone: payload.phone.trim(),
    phoneNumber: payload.phone.trim(),
    role: payload.role,
    status: "active",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    createdAt: new Intl.DateTimeFormat("vi-VN").format(new Date()),
  };
  setMockCurrentUser(newUser);
  return { success: true, user: newUser, viaApi: false };
}

export function loginWithEmail(email: string): {
  success: boolean;
  user?: User;
  error?: string;
} {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: "Vui lòng nhập địa chỉ email tài khoản." };
  }

  const allUsers = getAllUsers();
  const matchedUser = allUsers.find(
    (u) => u.email.toLowerCase() === cleanEmail
  );

  if (!matchedUser) {
    return {
      success: false,
      error: `Tài khoản "${email}" không tồn tại. Vui lòng kiểm tra lại hoặc dùng tài khoản mẫu (admin / 123456).`,
    };
  }

  if (matchedUser.status === "suspended") {
    return {
      success: false,
      error: "Tài khoản này đang bị tạm khóa. Vui lòng liên hệ quản trị viên.",
    };
  }

  setMockCurrentUser(matchedUser);
  return { success: true, user: matchedUser };
}

export function logoutMockUser(): void {
  clearAuthToken();
  setMockCurrentUser(null);
}

/**
 * React hook to observe authentication state across components
 */
export function useMockAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setUser(getMockCurrentUser());
    setIsLoading(false);

    const handleAuthChange = () => {
      setUser(getMockCurrentUser());
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_USER) {
        if (!sessionStorage.getItem(STORAGE_KEY_USER)) {
          setUser(getMockCurrentUser());
        }
      }

      if (e.key === "house_rental_viewings") {
        window.dispatchEvent(new Event("house_rental_viewings_change"));
      }
      if (e.key === "house_rental_listings") {
        window.dispatchEvent(new Event("house_rental_listings_change"));
      }
      if (e.key === "house_rental_invoices") {
        window.dispatchEvent(new Event("house_rental_invoices_change"));
      }
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    user,
    isLoading,
    login: loginWithEmail,
    loginWithApi,
    registerWithApi,
    logout: logoutMockUser,
    isAuthenticated: !!user,
    token: getAuthToken(),
  };
}

/* =========================================================================
   Favorites and Viewings Helpers
   ========================================================================= */

const DEFAULT_FAVORITES = ["list_1", "list_2"];

export function getMockFavorites(): string[] {
  if (typeof window === "undefined") return DEFAULT_FAVORITES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(DEFAULT_FAVORITES));
  } catch {}
  return DEFAULT_FAVORITES;
}

export function toggleMockFavorite(listingId: string): string[] {
  const current = getMockFavorites();
  const next = current.includes(listingId)
    ? current.filter((id) => id !== listingId)
    : [...current, listingId];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(next));
  }
  return next;
}

export function getMockTenantViewings(): ViewingRequest[] {
  if (typeof window === "undefined") return mockViewingRequests;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VIEWINGS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY_VIEWINGS, JSON.stringify(mockViewingRequests));
  } catch {}
  return mockViewingRequests;
}

export function cancelMockViewing(viewingId: string): ViewingRequest[] {
  const current = getMockTenantViewings();
  const next = current.map((v) =>
    v.id === viewingId
      ? { ...v, status: "cancelled" as const, updatedAt: "25/11/2026" }
      : v
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_VIEWINGS, JSON.stringify(next));
    window.dispatchEvent(new Event("house_rental_viewings_change"));
  }
  return next;
}

export function getFavoriteListings(): Listing[] {
  const ids = getMockFavorites();
  return mockListings.filter((l) => ids.includes(l.id));
}
