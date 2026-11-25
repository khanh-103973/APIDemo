import { Contract, ContractStatus } from "@/types";
import { mockContracts } from "@/mocks/contracts";
import { apiRequest, getAuthToken } from "@/lib/api/client";

interface BackendContract {
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
      if (Array.isArray(apiContracts) && apiContracts.length > 0) {
        return apiContracts.map(mapBackendContract);
      }
    } catch {
      // Fallback to mock contracts if unauthorized or offline
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
