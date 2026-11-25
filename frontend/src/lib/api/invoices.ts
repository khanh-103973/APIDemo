"use client";

/**
 * NOTE: Mock/localStorage adapter — Backend chưa có bảng/API /api/invoices.
 * Khi Backend bổ sung InvoicesController, thay thế các hàm này bằng apiRequest("/invoices").
 */
import { Invoice } from "@/types";
import { mockInvoices } from "@/mocks/invoices";

export const STORAGE_KEY_INVOICES = "house_rental_invoices";

export function getAllInvoices(): Invoice[] {
  if (typeof window === "undefined") return mockInvoices;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVOICES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(mockInvoices));
  } catch {}
  return mockInvoices;
}

export function saveAllInvoices(invoices: Invoice[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
    window.dispatchEvent(new Event("house_rental_invoices_change"));
  } catch {}
}

export async function getInvoices(params?: {
  landlordId?: string;
  tenantId?: string;
  contractId?: string;
}): Promise<Invoice[]> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  let results = getAllInvoices();
  if (params?.landlordId) {
    results = results.filter((i) => i.landlordId === params.landlordId);
  }
  if (params?.tenantId) {
    results = results.filter((i) => i.tenantId === params.tenantId);
  }
  if (params?.contractId) {
    results = results.filter((i) => i.contractId === params.contractId);
  }
  return results;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const all = getAllInvoices();
  return all.find((i) => i.id === id) || null;
}
