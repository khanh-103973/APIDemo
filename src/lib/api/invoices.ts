import { Invoice } from "@/types";
import { mockInvoices } from "@/mocks/invoices";

export async function getInvoices(params?: {
  landlordId?: string;
  tenantId?: string;
  contractId?: string;
}): Promise<Invoice[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  let results = [...mockInvoices];
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
  return mockInvoices.find((i) => i.id === id) || null;
}
