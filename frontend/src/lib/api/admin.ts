"use client";

import { User, Listing, ActivityLog, ListingStatus, ModerationStatus, UserStatus } from "@/types";
import { mockUsers } from "@/mocks/users";
import { mockListings } from "@/mocks/listings";
import { getAllUsers } from "@/lib/auth/mock-auth";
import { getUsers } from "@/lib/api/users";
import { fetchAllHousesFromApi } from "@/lib/api/listings";

const STORAGE_KEY_ADMIN_USERS = "house_rental_admin_users";
const STORAGE_KEY_ADMIN_LISTINGS = "house_rental_listings";
const STORAGE_KEY_ADMIN_LOGS = "house_rental_admin_logs";
const STORAGE_KEY_ADMIN_VERIFICATIONS = "house_rental_admin_verifications";
const STORAGE_KEY_ADMIN_REPORTS = "house_rental_admin_reports";

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  businessName?: string;
  idCardNumber: string;
  address: string;
  propertiesCount: number;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
  documents: string[];
}

export interface UserReport {
  id: string;
  reporterName: string;
  reporterPhone: string;
  targetType: "listing" | "user";
  targetId: string;
  targetTitle: string;
  reason: "fake_listing" | "wrong_price" | "duplicate" | "scam" | "other";
  description: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export const initialVerificationRequests: VerificationRequest[] = [
  {
    id: "ver_01",
    userId: "usr_landlord_2",
    userName: "Lê Thị Hương",
    userPhone: "0987654321",
    userEmail: "huong.le@bds-saigon.vn",
    businessName: "Căn Hộ Dịch Vụ Hương House",
    idCardNumber: "079188009988",
    address: "18A/24 Nguyễn Thị Minh Khai, P. Đa Kao, Quận 1",
    propertiesCount: 1,
    status: "pending",
    submittedAt: "24/02/2026",
    documents: [
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    ],
  },
];

export const initialUserReports: UserReport[] = [
  {
    id: "rep_01",
    reporterName: "Trương Quốc Bảo",
    reporterPhone: "0918889999",
    targetType: "listing",
    targetId: "list_2",
    targetTitle: "Studio Hiện Đại Phong Cách Bắc Âu Trung Tâm Đa Kao Quận 1",
    reason: "wrong_price",
    description: "Tôi liên hệ thì chủ nhà báo giá thực tế cao hơn 500k so với giá niêm yết trên web.",
    status: "pending",
    createdAt: "23/02/2026",
  },
  {
    id: "rep_02",
    reporterName: "Hoàng Mai Anh",
    reporterPhone: "0944567890",
    targetType: "listing",
    targetId: "list_3",
    targetTitle: "Căn Hộ 2PN Sunrise City View 76m² Full Nội Thất",
    reason: "duplicate",
    description: "Tin đăng này trùng lặp với một tin khác cùng phòng ở tầng 14.",
    status: "resolved",
    createdAt: "15/02/2026",
  },
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: "log_01",
    userId: "usr_admin_1",
    userName: "Nguyễn Văn Quản Trị",
    userRole: "admin",
    action: "Phê duyệt tin đăng",
    entityType: "listing",
    entityId: "list_2",
    details: "Duyệt xuất bản tin 'Studio Hiện Đại Phong Cách Bắc Âu Đa Kao'",
    timestamp: "24/02/2026 16:45",
  },
  {
    id: "log_02",
    userId: "usr_admin_1",
    userName: "Nguyễn Văn Quản Trị",
    userRole: "admin",
    action: "Xác thực danh tính chủ nhà",
    entityType: "verification",
    entityId: "usr_landlord_1",
    details: "Xác nhận hồ sơ định danh CCCD của chủ nhà Trần Minh Đức",
    timestamp: "20/02/2026 10:15",
  },
  {
    id: "log_03",
    userId: "usr_admin_1",
    userName: "Nguyễn Văn Quản Trị",
    userRole: "admin",
    action: "Giải quyết báo cáo vi phạm",
    entityType: "listing",
    entityId: "list_3",
    details: "Xử lý báo cáo trùng lặp cho tin Căn Hộ Sunrise City View",
    timestamp: "16/02/2026 14:30",
  },
];

/**
 * Get Platform KPI Statistics
 */
export function getAdminStats() {
  const users = getAdminUsers();
  const listings = getAdminListings();
  const verifications = getAdminVerifications();
  const reports = getAdminReports();

  const totalUsers = users.length;
  const tenantsCount = users.filter((u) => u.role === "tenant").length;
  const landlordsCount = users.filter((u) => u.role === "landlord").length;

  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === "active").length;
  const pendingModeration = listings.filter((l) => l.moderationStatus === "pending" || l.status === "pending").length;

  const pendingVerifications = verifications.filter((v) => v.status === "pending").length;
  const pendingReports = reports.filter((r) => r.status === "pending").length;

  return {
    totalUsers,
    tenantsCount,
    landlordsCount,
    totalListings,
    activeListings,
    pendingModeration,
    pendingVerifications,
    pendingReports,
    moderationSpeedHours: "1.8",
  };
}

/**
 * Users Management
 */
export function getAdminUsers(): User[] {
  const allKnown = getAllUsers();
  if (typeof window === "undefined") return allKnown;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_USERS);
    if (raw) {
      const stored: User[] = JSON.parse(raw);
      const storedIds = new Set(stored.map((u) => u.id));
      const newlyAdded = allKnown.filter((u) => !storedIds.has(u.id));
      return [...stored, ...newlyAdded];
    }
    localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(allKnown));
  } catch {}
  return allKnown;
}

/**
 * Fetch real users from ASP.NET Core GET /api/users (requires Admin JWT)
 */
export async function fetchAdminUsersFromApi(): Promise<User[]> {
  try {
    const apiUsers = await getUsers();
    if (apiUsers && apiUsers.length > 0 && apiUsers.some((u) => /^\d+$/.test(u.id))) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(apiUsers));
        } catch {}
      }
      return apiUsers;
    }
  } catch {}
  return getAdminUsers();
}

/**
 * Fetch real listings from ASP.NET Core GET /api/houses
 */
export async function fetchAdminListingsFromApi(): Promise<Listing[]> {
  const apiListings = await fetchAllHousesFromApi();
  if (apiListings && apiListings.length > 0) {
    return apiListings;
  }
  return getAdminListings();
}

export function toggleAdminUserStatus(userId: string): User[] {
  const users = getAdminUsers();
  const next = users.map((u) => {
    if (u.id === userId) {
      const newStatus: UserStatus = u.status === "suspended" ? "active" : "suspended";
      return { ...u, status: newStatus };
    }
    return u;
  });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(next));
      // Real-time security revocation: if suspended user has active session, terminate it
      const rawUser = localStorage.getItem("house_rental_mock_user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed.id === userId) {
          localStorage.removeItem("house_rental_mock_user");
          window.dispatchEvent(new Event("house_rental_auth_change"));
        }
      }
    } catch {}
  }
  return next;
}

/**
 * Listings Moderation
 */
export function getAdminListings(): Listing[] {
  if (typeof window === "undefined") return mockListings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_LISTINGS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY_ADMIN_LISTINGS, JSON.stringify(mockListings));
  } catch {}
  return mockListings;
}

export function moderateAdminListing(
  listingId: string,
  decision: "approved" | "rejected" | "changes_requested",
  notes?: string
): Listing[] {
  const listings = getAdminListings();
  const next = listings.map((l) => {
    if (l.id === listingId) {
      const newStatus: ListingStatus = decision === "approved" ? "active" : decision === "rejected" ? "rejected" : "pending";
      const modStatus: ModerationStatus = decision;
      return {
        ...l,
        status: newStatus,
        moderationStatus: modStatus,
        moderationNotes: notes || l.moderationNotes,
        updatedAt: "25/11/2026",
      };
    }
    return l;
  });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_LISTINGS, JSON.stringify(next));
    } catch {}
  }
  return next;
}

export function toggleListingFeatured(listingId: string): Listing[] {
  const listings = getAdminListings();
  const next = listings.map((l) =>
    l.id === listingId ? { ...l, isFeatured: !l.isFeatured } : l
  );
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_LISTINGS, JSON.stringify(next));
    } catch {}
  }
  return next;
}

/**
 * Verifications Management
 */
export function getAdminVerifications(): VerificationRequest[] {
  if (typeof window === "undefined") return initialVerificationRequests;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_VERIFICATIONS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY_ADMIN_VERIFICATIONS, JSON.stringify(initialVerificationRequests));
  } catch {}
  return initialVerificationRequests;
}

export function moderateAdminVerification(
  id: string,
  status: "verified" | "rejected"
): VerificationRequest[] {
  const list = getAdminVerifications();
  const next = list.map((v) => (v.id === id ? { ...v, status } : v));
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_VERIFICATIONS, JSON.stringify(next));
    } catch {}
  }
  return next;
}

/**
 * User Reports Management
 */
export function getAdminReports(): UserReport[] {
  if (typeof window === "undefined") return initialUserReports;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_REPORTS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY_ADMIN_REPORTS, JSON.stringify(initialUserReports));
  } catch {}
  return initialUserReports;
}

export function resolveAdminReport(
  id: string,
  status: "resolved" | "dismissed"
): UserReport[] {
  const list = getAdminReports();
  const next = list.map((r) => (r.id === id ? { ...r, status } : r));
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_REPORTS, JSON.stringify(next));
    } catch {}
  }
  return next;
}

/**
 * Activity Logs
 */
export function getAdminActivityLogs(): ActivityLog[] {
  if (typeof window === "undefined") return initialActivityLogs;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_LOGS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY_ADMIN_LOGS, JSON.stringify(initialActivityLogs));
  } catch {}
  return initialActivityLogs;
}
