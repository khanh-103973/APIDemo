"use client";

import { ViewingRequest, ViewingStatus } from "@/types";
import { mockViewingRequests } from "@/mocks/viewings";
import { apiRequest, getAuthToken } from "@/lib/api/client";

export const STORAGE_KEY_VIEWINGS = "house_rental_viewings";

interface BackendBooking {
  id: number;
  userId: number;
  houseId: number;
  startDate: string;
  endDate: string;
  status: string;
}

function mapBookingStatus(status?: string): ViewingStatus {
  const s = (status || "").toLowerCase();
  if (s === "approved" || s === "confirmed") return "confirmed";
  if (s === "cancelled") return "cancelled";
  if (s === "completed") return "completed";
  if (s === "rejected") return "rejected";
  return "pending";
}

function mapBookingToViewing(b: BackendBooking): ViewingRequest {
  const start = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(b.startDate));
  return {
    id: `bk_${b.id}`,
    listingId: `house_${b.houseId}`,
    tenantId: String(b.userId),
    landlordId: "owner",
    preferredDate: start,
    preferredTimeSlot: "09:00 - 10:00",
    status: mapBookingStatus(b.status),
    tenantNote: `Đặt lịch thuê nhà #${b.houseId} (từ ${start})`,
    createdAt: start,
    updatedAt: start,
  };
}

export function getAllViewings(): ViewingRequest[] {
  if (typeof window === "undefined") return mockViewingRequests;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VIEWINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(
      STORAGE_KEY_VIEWINGS,
      JSON.stringify(mockViewingRequests)
    );
  } catch {}
  return mockViewingRequests;
}

export function saveAllViewings(viewings: ViewingRequest[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_VIEWINGS, JSON.stringify(viewings));
    window.dispatchEvent(new Event("house_rental_viewings_change"));
  } catch {}
}

export async function getViewingRequests(params?: {
  landlordId?: string;
  tenantId?: string;
  listingId?: string;
}): Promise<ViewingRequest[]> {
  try {
    const apiBookings = await apiRequest<BackendBooking[]>("/bookings");
    if (Array.isArray(apiBookings) && apiBookings.length > 0) {
      let mapped = apiBookings.map(mapBookingToViewing);
      if (params?.tenantId) {
        const filtered = mapped.filter((v) => v.tenantId === params.tenantId);
        if (filtered.length > 0) mapped = filtered;
      }
      if (params?.listingId) {
        mapped = mapped.filter((v) => v.listingId === params.listingId);
      }
      return mapped;
    }
  } catch {
    // Fallback to localStorage/mock
  }

  let results = getAllViewings();
  if (params?.landlordId) {
    results = results.filter((v) => v.landlordId === params.landlordId);
  }
  if (params?.tenantId) {
    results = results.filter((v) => v.tenantId === params.tenantId);
  }
  if (params?.listingId) {
    results = results.filter((v) => v.listingId === params.listingId);
  }
  return results;
}

export function createViewingRequest(data: {
  listingId: string;
  tenantId: string;
  landlordId: string;
  preferredDate: string;
  preferredTimeSlot: string;
  tenantNote?: string;
}): ViewingRequest {
  const current = getAllViewings();
  const id = `vr_${Date.now()}`;
  const now = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  const newViewing: ViewingRequest = {
    id,
    listingId: data.listingId,
    tenantId: data.tenantId,
    landlordId: data.landlordId,
    preferredDate: data.preferredDate,
    preferredTimeSlot: data.preferredTimeSlot,
    status: "pending",
    tenantNote: data.tenantNote || "",
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newViewing, ...current];
  saveAllViewings(updated);

  // Best-effort sync with real ASP.NET Core /api/bookings when authenticated with JWT
  const numericUserId = Number(data.tenantId);
  const numericHouseId = Number(data.listingId.replace("house_", ""));
  if (
    getAuthToken() &&
    Number.isInteger(numericUserId) &&
    numericUserId > 0 &&
    Number.isInteger(numericHouseId) &&
    numericHouseId > 0
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 6);

    void apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify({
        userId: numericUserId,
        houseId: numericHouseId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    }).catch(() => {});
  }

  return newViewing;
}

export function updateViewingStatus(
  viewingId: string,
  status: ViewingStatus,
  landlordNote?: string
): ViewingRequest[] {
  const current = getAllViewings();
  const now = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  const next = current.map((v) =>
    v.id === viewingId
      ? {
          ...v,
          status,
          landlordNote:
            landlordNote !== undefined ? landlordNote : v.landlordNote,
          updatedAt: now,
        }
      : v
  );

  saveAllViewings(next);
  return next;
}

export function cancelViewingRequest(viewingId: string): ViewingRequest[] {
  return updateViewingStatus(
    viewingId,
    "cancelled",
    "Khách thuê đã hủy lịch hẹn xem phòng"
  );
}
