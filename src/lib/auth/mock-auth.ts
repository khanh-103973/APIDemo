"use client";

import * as React from "react";
import { User, ViewingRequest, Listing } from "@/types";
import { mockUsers } from "@/mocks/users";
import { mockListings } from "@/mocks/listings";
import { mockViewingRequests } from "@/mocks/viewings";

const STORAGE_KEY_USER = "house_rental_mock_user";
const STORAGE_KEY_REGISTERED_USERS = "house_rental_registered_users";
const STORAGE_KEY_FAVORITES = "house_rental_mock_favorites";
const STORAGE_KEY_VIEWINGS = "house_rental_viewings";
const AUTH_EVENT_NAME = "house_rental_auth_change";

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
 * Checks tab-scoped sessionStorage first to support parallel multi-role demos in the same browser,
 * and falls back to persistent localStorage.
 * Protects against client tampering by cross-verifying with known valid users.
 */
export function getMockCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    // 1. Check tab-isolated session (enables parallel multi-role demo across tabs in same browser)
    let raw = sessionStorage.getItem(STORAGE_KEY_USER);
    if (!raw) {
      // 2. Fall back to persistent cross-tab localStorage
      raw = localStorage.getItem(STORAGE_KEY_USER);
    }
    if (!raw) return null;

    const parsed: Partial<User> = JSON.parse(raw);
    if (!parsed || !parsed.email || !parsed.role) return null;

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

    // If session was tampered with or suspended, purge invalid data
    sessionStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch {}
  return null;
}

export function setMockCurrentUser(user: User | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      // Store new registered user if not existing
      const allUsers = getAllUsers();
      const exists = allUsers.some((u) => u.email.toLowerCase() === user.email.toLowerCase());
      if (!exists) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
          const currentRegistered: User[] = raw ? JSON.parse(raw) : [];
          currentRegistered.push(user);
          localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(currentRegistered));
        } catch {}
      }

      // Save to both tab-isolated sessionStorage and persistent localStorage
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  } catch {}
}

export function loginWithEmail(email: string): { success: boolean; user?: User; error?: string } {
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
      error: `Email "${email}" không tồn tại trong hệ thống. Vui lòng kiểm tra lại email hoặc sử dụng email được cấp theo phân quyền.`,
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
  setMockCurrentUser(null);
}

/**
 * React hook to observe authentication state across components
 */
export function useMockAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Initial read on mount
    setUser(getMockCurrentUser());
    setIsLoading(false);

    const handleAuthChange = () => {
      setUser(getMockCurrentUser());
    };

    const handleStorageChange = (e: StorageEvent) => {
      // 1. Cross-tab session sync:
      // If this tab already has its own isolated session (for multi-role demo), preserve it!
      if (e.key === STORAGE_KEY_USER) {
        if (!sessionStorage.getItem(STORAGE_KEY_USER)) {
          setUser(getMockCurrentUser());
        }
      }

      // 2. Cross-tab real-time business data reactivity:
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
    logout: logoutMockUser,
    isAuthenticated: !!user,
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
    v.id === viewingId ? { ...v, status: "cancelled" as const, updatedAt: "25/11/2026" } : v
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
