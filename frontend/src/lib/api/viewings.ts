"use client";

import { ViewingRequest, ViewingStatus } from "@/types";
import { mockViewingRequests } from "@/mocks/viewings";
import {
  apiRequest,
  extractApiErrorMessage,
  getAuthToken,
} from "@/lib/api/client";

export const STORAGE_KEY_VIEWINGS = "house_rental_viewings";

export interface BackendBooking {
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

function mapViewingStatusToBackend(status: ViewingStatus): string {
  if (status === "confirmed") return "Approved";
  if (status === "completed") return "Completed";
  if (status === "cancelled" || status === "rejected") return "Cancelled";
  return "Pending";
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
  if (getAuthToken()) {
    try {
      const apiBookings = await apiRequest<BackendBooking[]>("/bookings");
      if (Array.isArray(apiBookings)) {
        let mapped = apiBookings.map(mapBookingToViewing);
        if (params?.tenantId) {
          mapped = mapped.filter((v) => v.tenantId === params.tenantId);
        }
        if (params?.listingId) {
          mapped = mapped.filter((v) => v.listingId === params.listingId);
        }
        return mapped;
      }
    } catch {
      // Fallback to localStorage/mock only if API is unreachable
    }
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

export async function createViewingRequestAsync(data: {
  listingId: string;
  tenantId: string;
  landlordId: string;
  preferredDate: string;
  dateIso?: string;
  preferredTimeSlot: string;
  tenantNote?: string;
}): Promise<{ success: boolean; viewing?: ViewingRequest; viaApi?: boolean; error?: string }> {
  const numericUserId = Number(data.tenantId);
  const numericHouseId = Number(data.listingId.replace("house_", ""));

  if (getAuthToken()) {
    if (!Number.isInteger(numericHouseId) || numericHouseId <= 0) {
      return {
        success: false,
        error: "Tin đăng này không thuộc hệ thống dữ liệu SQL Server. Vui lòng chọn phòng thật tại Đà Nẵng.",
      };
    }

    const parsedStart = data.dateIso ? new Date(`${data.dateIso}T09:00:00`) : new Date();
    const startDate = Number.isNaN(parsedStart.getTime()) ? new Date() : parsedStart;
    if (startDate.getTime() <= Date.now()) {
      startDate.setDate(startDate.getDate() + 1);
    }
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 6);

    try {
      const created = await apiRequest<BackendBooking>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          userId: Number.isInteger(numericUserId) && numericUserId > 0 ? numericUserId : 1,
          houseId: numericHouseId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      const mapped = mapBookingToViewing(created);
      mapped.preferredDate = data.preferredDate || mapped.preferredDate;
      mapped.preferredTimeSlot = data.preferredTimeSlot;
      if (data.tenantNote) {
        mapped.tenantNote = data.tenantNote;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("house_rental_viewings_change"));
      }
      return { success: true, viewing: mapped, viaApi: true };
    } catch (err) {
      return {
        success: false,
        error: extractApiErrorMessage(
          err,
          "Không thể gửi lịch hẹn tới Backend API. Vui lòng kiểm tra server đang chạy."
        ),
      };
    }
  }

  return {
    success: false,
    error: "Vui lòng đăng nhập tài khoản trước khi đặt lịch xem phòng.",
  };
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
  return newViewing;
}

export async function updateViewingStatusAsync(
  viewing: ViewingRequest,
  status: ViewingStatus
): Promise<{ success: boolean; error?: string }> {
  const numericBookingId = Number(viewing.id.replace("bk_", ""));
  if (getAuthToken() && Number.isInteger(numericBookingId) && numericBookingId > 0) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 6);

      await apiRequest(`/bookings/${numericBookingId}`, {
        method: "PUT",
        body: JSON.stringify({
          userId: Number(viewing.tenantId) || 1,
          houseId: Number(viewing.listingId.replace("house_", "")) || 1,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: mapViewingStatusToBackend(status),
        }),
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("house_rental_viewings_change"));
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractApiErrorMessage(
          err,
          "Không thể cập nhật trạng thái lịch hẹn lên máy chủ."
        ),
      };
    }
  }

  updateViewingStatus(viewing.id, status);
  return { success: true };
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
