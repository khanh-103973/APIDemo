import { User, UserRole, LandlordProfile, TenantProfile } from "@/types";
import {
  mockUsers,
  mockLandlordProfiles,
  mockTenantProfiles,
} from "@/mocks/users";
import {
  apiRequest,
  BackendPageResult,
  extractApiErrorMessage,
  getAuthToken,
} from "@/lib/api/client";

export interface BackendUserDto {
  id: number;
  username: string;
  fullName?: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  dateOfBirth?: string;
  isActive?: boolean;
  createdAt?: string;
}

type BackendUsersPage = BackendPageResult<BackendUserDto>;

function mapRole(role?: string): UserRole {
  const r = (role || "").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "owner" || r === "landlord" || r === "manager") return "landlord";
  return "tenant";
}

export function mapBackendUser(u: BackendUserDto): User {
  const displayName = u.fullName || u.username;
  const phone = u.phone?.trim() || "Chưa cập nhật";
  return {
    id: String(u.id),
    name: displayName,
    fullName: displayName,
    email: u.email,
    phone,
    phoneNumber: phone,
    role: mapRole(u.role),
    status: u.isActive === false ? "suspended" : "active",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    createdAt: u.createdAt
      ? new Intl.DateTimeFormat("vi-VN").format(new Date(u.createdAt))
      : new Intl.DateTimeFormat("vi-VN").format(new Date()),
  };
}

const SEEDED_OWNER_FALLBACK: Record<string, User> = {
  "1": {
    id: "1",
    name: "Hệ thống Quản trị",
    fullName: "Hệ thống Quản trị",
    email: "admin@rental.com",
    phone: "0900000001",
    role: "admin",
    status: "active",
    createdAt: "28/10/2026",
  },
  "2": {
    id: "2",
    name: "Quản lý Chi nhánh",
    fullName: "Quản lý Chi nhánh",
    email: "manager@rental.com",
    phone: "0912345678",
    role: "landlord",
    status: "active",
    createdAt: "28/10/2026",
  },
  "3": {
    id: "3",
    name: "Chuyên viên Nhân sự",
    fullName: "Chuyên viên Nhân sự",
    email: "hr@rental.com",
    phone: "0987654321",
    role: "tenant",
    status: "active",
    createdAt: "28/10/2026",
  },
  "4": {
    id: "4",
    name: "Khách thuê trưởng thành",
    fullName: "Khách thuê trưởng thành",
    email: "adult@rental.com",
    phone: "0933112233",
    role: "tenant",
    status: "active",
    createdAt: "28/10/2026",
  },
};

export async function getUserById(id: string): Promise<User | null> {
  if (/^\d+$/.test(id) && getAuthToken()) {
    try {
      const apiUser = await apiRequest<BackendUserDto>(`/users/${id}`);
      if (apiUser) return mapBackendUser(apiUser);
    } catch {
      // Fallback below
    }
  }
  if (SEEDED_OWNER_FALLBACK[id]) {
    return SEEDED_OWNER_FALLBACK[id];
  }
  return mockUsers.find((u) => u.id === id) || null;
}

export async function getLandlordProfile(
  userId: string
): Promise<LandlordProfile | null> {
  if (mockLandlordProfiles[userId]) {
    return mockLandlordProfiles[userId];
  }
  if (/^\d+$/.test(userId)) {
    return {
      id: `lp_${userId}`,
      userId,
      verificationStatus: "verified",
      businessName: "Chủ nhà xác thực — Hệ thống Cho thuê Nhà",
      responseRate: 98,
      responseTime: "Trong vòng 30 phút",
    };
  }
  return null;
}

export async function getTenantProfile(
  userId: string
): Promise<TenantProfile | null> {
  return mockTenantProfiles[userId] || null;
}

export async function getUsers(): Promise<User[]> {
  if (getAuthToken()) {
    try {
      const res = await apiRequest<BackendUsersPage>(
        "/users?pageNumber=1&pageSize=100"
      );
      if (res && Array.isArray(res.items)) {
        return res.items.map(mapBackendUser);
      }
    } catch {
      // Fallback to mock users only when offline or non-admin
    }
  }
  return [...mockUsers];
}

/**
 * Update the authenticated user's profile via PUT /api/users/{id}.
 */
export async function updateUserProfileOnApi(
  userId: string,
  payload: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    dateOfBirth?: string;
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  const numericId = Number(userId);
  if (!getAuthToken() || !Number.isInteger(numericId) || numericId <= 0) {
    return {
      success: false,
      error: "Vui lòng đăng nhập tài khoản hợp lệ để cập nhật hồ sơ.",
    };
  }

  try {
    const res = await apiRequest<{ message?: string }>(`/users/${numericId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return {
      success: true,
      message: res?.message || "Cập nhật hồ sơ thành công.",
    };
  } catch (err) {
    return {
      success: false,
      error: extractApiErrorMessage(err, "Không thể cập nhật hồ sơ lên máy chủ."),
    };
  }
}

/**
 * Change password via POST /api/auth/change-password (revokes all old refresh tokens).
 */
export async function changePasswordOnApi(payload: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await apiRequest<{ message?: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return {
      success: true,
      message: res?.message || "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
    };
  } catch (err) {
    return {
      success: false,
      error: extractApiErrorMessage(err, "Không thể đổi mật khẩu."),
    };
  }
}
