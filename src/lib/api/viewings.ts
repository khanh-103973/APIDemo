"use client";

import { ViewingRequest, ViewingStatus } from "@/types";
import { mockViewingRequests } from "@/mocks/viewings";

export const STORAGE_KEY_VIEWINGS = "house_rental_viewings";

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
    localStorage.setItem(STORAGE_KEY_VIEWINGS, JSON.stringify(mockViewingRequests));
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
  await new Promise((resolve) => setTimeout(resolve, 15));
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
          landlordNote: landlordNote !== undefined ? landlordNote : v.landlordNote,
          updatedAt: now,
        }
      : v
  );

  saveAllViewings(next);
  return next;
}

export function cancelViewingRequest(viewingId: string): ViewingRequest[] {
  return updateViewingStatus(viewingId, "cancelled", "Khách thuê đã hủy lịch hẹn xem phòng");
}
