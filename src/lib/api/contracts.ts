import { Contract } from "@/types";
import { mockContracts } from "@/mocks/contracts";

export async function getContracts(params?: {
  landlordId?: string;
  tenantId?: string;
}): Promise<Contract[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
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
  await new Promise((resolve) => setTimeout(resolve, 15));
  return mockContracts.find((c) => c.id === id) || null;
}
