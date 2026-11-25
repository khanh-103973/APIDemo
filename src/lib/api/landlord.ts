"use client";

import { Listing, ViewingRequest, ListingStatus, ViewingStatus } from "@/types";
import { mockListings } from "@/mocks/listings";
import { mockProperties } from "@/mocks/properties";
import { mockViewingRequests } from "@/mocks/viewings";
import { getMockCurrentUser } from "@/lib/auth/mock-auth";
import { getAllInvoices } from "@/lib/api/invoices";

const STORAGE_KEY_LISTINGS = "house_rental_listings";
const STORAGE_KEY_VIEWINGS = "house_rental_viewings";

export interface LandlordStats {
  occupancyRate: number; // percentage, e.g. 84.6
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  monthlyRevenue: number;
  revenueGrowth: number; // percentage
  pendingViewingsCount: number;
  unpaidInvoicesCount: number;
  unpaidInvoicesAmount: number;
}

/**
 * Helper to get all stored listings
 */
export function getAllListingsFromStorage(): Listing[] {
  if (typeof window === "undefined") {
    return mockListings;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LISTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(mockListings));
  } catch {}
  return mockListings;
}

/**
 * Get landlord operational KPI statistics
 */
export function getLandlordStats(): LandlordStats {
  const currentUser = getMockCurrentUser();
  const landlordId =
    currentUser && currentUser.role === "landlord" ? currentUser.id : "usr_landlord_1";

  const properties = mockProperties.filter((p) => p.landlordId === landlordId);
  const totalRooms = properties.reduce((acc, p) => acc + p.totalRooms, 0);
  const availableRooms = properties.reduce((acc, p) => acc + p.availableRooms, 0);
  const occupiedRooms = totalRooms - availableRooms;
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 1000) / 10 : 85;

  const invoices = getAllInvoices().filter((i) => i.landlordId === landlordId);
  const unpaidInvoices = invoices.filter(
    (i) => i.status === "unpaid" || i.status === "overdue"
  );
  const unpaidAmount = unpaidInvoices.reduce(
    (acc, i) => acc + (i.totalAmount - i.paidAmount),
    0
  );

  const viewings = getLandlordViewings();
  const pendingViewings = viewings.filter((v) => v.status === "pending");

  const monthlyRevenue =
    invoices
      .filter((i) => i.status === "paid")
      .reduce((acc, i) => acc + i.paidAmount, 0) ||
    (landlordId === "usr_landlord_2" ? 38000000 : 84500000);

  return {
    occupancyRate: occupancyRate || (landlordId === "usr_landlord_2" ? 83.3 : 75),
    totalRooms: totalRooms || (landlordId === "usr_landlord_2" ? 6 : 16),
    occupiedRooms: occupiedRooms || (landlordId === "usr_landlord_2" ? 5 : 12),
    availableRooms: availableRooms || (landlordId === "usr_landlord_2" ? 1 : 4),
    monthlyRevenue,
    revenueGrowth: 8.2,
    pendingViewingsCount: pendingViewings.length,
    unpaidInvoicesCount: unpaidInvoices.length,
    unpaidInvoicesAmount:
      unpaidAmount || (landlordId === "usr_landlord_2" ? 9500000 : 6180000),
  };
}

/**
 * Get all listings for landlord (combining mock dataset + custom ones stored in localStorage)
 */
export function getLandlordListings(): Listing[] {
  const all = getAllListingsFromStorage();
  const currentUser = getMockCurrentUser();
  if (currentUser && currentUser.role === "landlord") {
    return all.filter((l) => l.landlordId === currentUser.id);
  }
  return all.filter(
    (l) => l.landlordId === "usr_landlord_1" || l.landlordId === "usr_landlord_2"
  );
}

/**
 * Save / Create a new listing
 */
export function saveLandlordListing(data: Partial<Listing>): Listing {
  const allListings = getAllListingsFromStorage();
  const currentUser = getMockCurrentUser();
  const landlordId =
    data.landlordId ||
    (currentUser && currentUser.role === "landlord" ? currentUser.id : "usr_landlord_1");

  const id = `list_${Date.now()}`;
  const slug = (data.title || "tin-dang-moi")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const newListing: Listing = {
    id,
    landlordId,
    propertyId: data.propertyId || "prop_1",
    title: data.title || "Phòng trọ cho thuê",
    slug: `${slug}-${id}`,
    description: data.description || "Thông tin mô tả phòng trọ...",
    propertyType: data.propertyType || "boarding_house",
    rentPrice: data.rentPrice || 5000000,
    deposit: data.deposit || (data.rentPrice || 5000000),
    area: data.area || 25,
    bedrooms: data.bedrooms || 1,
    bathrooms: data.bathrooms || 1,
    address: data.address || "123 Đường Số 1",
    ward: data.ward || "Phường 25",
    district: data.district || "Quận Bình Thạnh",
    city: data.city || "TP. Hồ Chí Minh",
    amenities: data.amenities || ["Máy lạnh", "Wifi", "Bảo vệ 24/7"],
    images:
      data.images && data.images.length > 0
        ? data.images
        : [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
          ],
    status: data.status || "pending",
    moderationStatus: data.moderationStatus || "pending",
    viewsCount: 0,
    createdAt: new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date()),
    updatedAt: new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date()),
  };

  const updated = [newListing, ...allListings];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(updated));
      window.dispatchEvent(new Event("house_rental_listings_change"));
    } catch {}
  }

  return newListing;
}

/**
 * Update listing status (active, hidden, rented, draft, etc.)
 */
export function updateLandlordListingStatus(id: string, status: ListingStatus): Listing[] {
  const all = getAllListingsFromStorage();
  const next = all.map((item) =>
    item.id === id
      ? {
          ...item,
          status,
          updatedAt: new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(new Date()),
        }
      : item
  );

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(next));
      window.dispatchEvent(new Event("house_rental_listings_change"));
    } catch {}
  }
  return getLandlordListings();
}

/**
 * Delete a listing
 */
export function deleteLandlordListing(id: string): Listing[] {
  const all = getAllListingsFromStorage();
  const next = all.filter((item) => item.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(next));
      window.dispatchEvent(new Event("house_rental_listings_change"));
    } catch {}
  }
  return getLandlordListings();
}

/**
 * Get viewing requests for landlord
 */
export function getLandlordViewings(): ViewingRequest[] {
  let all: ViewingRequest[] = [];
  if (typeof window === "undefined") {
    all = mockViewingRequests;
  } else {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_VIEWINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          all = parsed;
        }
      } else {
        localStorage.setItem(STORAGE_KEY_VIEWINGS, JSON.stringify(mockViewingRequests));
        all = mockViewingRequests;
      }
    } catch {
      all = mockViewingRequests;
    }
  }

  const currentUser = getMockCurrentUser();
  if (currentUser && currentUser.role === "landlord") {
    return all.filter((v) => v.landlordId === currentUser.id);
  }
  return all;
}

/**
 * Update viewing status (confirm / reject / complete)
 */
export function updateViewingStatus(
  id: string,
  status: ViewingStatus,
  landlordNote?: string
): ViewingRequest[] {
  let all: ViewingRequest[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_VIEWINGS);
      if (raw) all = JSON.parse(raw);
    } catch {}
  }
  if (all.length === 0) all = mockViewingRequests;

  const next = all.map((v) =>
    v.id === id
      ? {
          ...v,
          status,
          landlordNote: landlordNote || v.landlordNote,
          updatedAt: new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(new Date()),
        }
      : v
  );

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_VIEWINGS, JSON.stringify(next));
      window.dispatchEvent(new Event("house_rental_viewings_change"));
    } catch {}
  }
  return getLandlordViewings();
}
