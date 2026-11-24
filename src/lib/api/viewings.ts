import { ViewingRequest } from "@/types";
import { mockViewingRequests } from "@/mocks/viewings";

export async function getViewingRequests(params?: {
  landlordId?: string;
  tenantId?: string;
  listingId?: string;
}): Promise<ViewingRequest[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  let results = [...mockViewingRequests];
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
