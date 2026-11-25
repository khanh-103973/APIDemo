import { IssueReport } from "@/types";
import { mockIssueReports } from "@/mocks/issues";

export async function getIssueReports(params?: {
  landlordId?: string;
  tenantId?: string;
  propertyId?: string;
}): Promise<IssueReport[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  let results = [...mockIssueReports];
  if (params?.landlordId) {
    results = results.filter((iss) => iss.landlordId === params.landlordId);
  }
  if (params?.tenantId) {
    results = results.filter((iss) => iss.tenantId === params.tenantId);
  }
  if (params?.propertyId) {
    results = results.filter((iss) => iss.propertyId === params.propertyId);
  }
  return results;
}
