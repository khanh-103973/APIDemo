import { Contract, ContractStatus } from "@/types";
import { mockContracts } from "@/mocks/contracts";
import {
  apiRequest,
  extractApiErrorMessage,
  getAuthToken,
} from "@/lib/api/client";

export interface BackendContract {
  id: number;
  bookingId: number;
  monthlyRent: number;
  deposit: number;
  startDate: string;
  endDate: string;
  status: string;
}

function formatDateVi(iso: string): string {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function mapContractStatus(status?: string): ContractStatus {
  const s = (status || "").toLowerCase();
  if (s === "active") return "active";
  if (s === "expired") return "expired";
  if (s === "terminated" || s === "cancelled") return "terminated";
  if (s === "pending") return "pending";
  return "active";
}

function mapBackendContract(c: BackendContract): Contract {
  return {
    id: `ct_${c.id}`,
    contractNumber: `HD-${String(c.id).padStart(4, "0")}`,
    propertyId: `booking_${c.bookingId}`,
    landlordId: "owner",
    tenantId: "tenant",
    startDate: formatDateVi(c.startDate),
    endDate: formatDateVi(c.endDate),
    monthlyRent: Number(c.monthlyRent) || 0,
    deposit: Number(c.deposit) || 0,
    billingCycle: "monthly",
    paymentDueDay: 5,
    status: mapContractStatus(c.status),
    terms: `Hợp đồng thuê nhà gắn với mã đặt lịch #${c.bookingId}`,
    createdAt: formatDateVi(c.startDate),
  };
}

export async function getContracts(params?: {
  landlordId?: string;
  tenantId?: string;
}): Promise<Contract[]> {
  if (getAuthToken()) {
    try {
      const apiContracts = await apiRequest<BackendContract[]>("/contracts");
      if (Array.isArray(apiContracts)) {
        return apiContracts.map(mapBackendContract);
      }
    } catch {
      // Fallback to mock contracts only when API is unreachable
    }
  }

  let results = [...mockContracts];
  if (params?.landlordId) {
    results = results.filter((c) => c.landlordId === params.landlordId);
  }
  if (params?.tenantId) {
    results = results.filter((c) => c.tenantId === params.tenantId);
  }
  return results;
}

export async function getContractById(id: string): Promise<Contract | null> {
  const numericId = id.startsWith("ct_") ? id.replace("ct_", "") : id;
  if (getAuthToken() && /^\d+$/.test(numericId)) {
    try {
      const c = await apiRequest<BackendContract>(`/contracts/${numericId}`);
      if (c) return mapBackendContract(c);
    } catch {
      // Fallback to mock
    }
  }
  return mockContracts.find((c) => c.id === id) || null;
}

export function viDateToIsoInput(viDate: string): string {
  const parts = (viDate || "").split("/");
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    if (yyyy.length === 4) {
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
  }
  const d = new Date(viDate);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0];
}

export async function createContractOnApi(payload: {
  bookingId: number;
  monthlyRent: number;
  deposit: number;
  startDateIso: string;
  endDateIso: string;
  status?: string;
}): Promise<{ success: boolean; contract?: Contract; error?: string }> {
  if (!getAuthToken()) {
    return { success: false, error: "Vui lòng đăng nhập tài khoản Chủ nhà hoặc Admin trước khi lập hợp đồng." };
  }
  try {
    const created = await apiRequest<BackendContract>("/contracts", {
      method: "POST",
      body: JSON.stringify({
        bookingId: payload.bookingId,
        monthlyRent: payload.monthlyRent,
        deposit: payload.deposit,
        startDate: payload.startDateIso,
        endDate: payload.endDateIso,
        status: payload.status || "Pending",
      }),
    });
    if (created) {
      return { success: true, contract: mapBackendContract(created) };
    }
    return { success: false, error: "Không nhận được dữ liệu hợp đồng từ máy chủ." };
  } catch (err) {
    return {
      success: false,
      error: extractApiErrorMessage(err, "Không thể kết nối Backend API để tạo hợp đồng."),
    };
  }
}

export async function updateContractOnApi(
  contractId: string,
  payload: {
    bookingId: number;
    monthlyRent: number;
    deposit: number;
    startDateIso: string;
    endDateIso: string;
    status: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!getAuthToken()) {
    return { success: false, error: "Vui lòng đăng nhập trước khi cập nhật hợp đồng." };
  }
  const numericId = Number(contractId.replace("ct_", ""));
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return { success: false, error: "Mã hợp đồng không hợp lệ." };
  }
  try {
    await apiRequest(`/contracts/${numericId}`, {
      method: "PUT",
      body: JSON.stringify({
        bookingId: payload.bookingId,
        monthlyRent: payload.monthlyRent,
        deposit: payload.deposit,
        startDate: payload.startDateIso,
        endDate: payload.endDateIso,
        status: payload.status,
      }),
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: extractApiErrorMessage(err, "Không thể cập nhật hợp đồng lên máy chủ."),
    };
  }
}

export async function signContractOnApi(
  contractId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!getAuthToken()) {
    return { success: false, error: "Vui lòng đăng nhập trước khi xác nhận ký hợp đồng." };
  }
  const numericId = Number(contractId.replace("ct_", ""));
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return { success: false, error: "Mã hợp đồng không hợp lệ." };
  }
  try {
    const res = await apiRequest<{ message?: string }>(`/contracts/${numericId}/sign`, {
      method: "POST",
    });
    return { success: true, message: res?.message || "Đã xác nhận ký hợp đồng thành công!" };
  } catch (err) {
    return {
      success: false,
      error: extractApiErrorMessage(err, "Không thể gửi yêu cầu ký hợp đồng lên máy chủ."),
    };
  }
}

export async function rejectContractOnApi(
  contractId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!getAuthToken()) {
    return { success: false, error: "Vui lòng đăng nhập trước khi từ chối hợp đồng." };
  }
  const numericId = Number(contractId.replace("ct_", ""));
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return { success: false, error: "Mã hợp đồng không hợp lệ." };
  }
  try {
    const res = await apiRequest<{ message?: string }>(`/contracts/${numericId}/reject`, {
      method: "POST",
    });
    return { success: true, message: res?.message || "Đã từ chối hợp đồng." };
  } catch (err) {
    return {
      success: false,
      error: extractApiErrorMessage(err, "Không thể gửi yêu cầu từ chối hợp đồng."),
    };
  }
}
