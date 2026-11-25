import { User, LandlordProfile, TenantProfile } from "@/types";
import {
  mockUsers,
  mockLandlordProfiles,
  mockTenantProfiles,
} from "@/mocks/users";

export async function getUserById(id: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  return mockUsers.find((u) => u.id === id) || null;
}

export async function getLandlordProfile(
  userId: string
): Promise<LandlordProfile | null> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  return mockLandlordProfiles[userId] || null;
}

export async function getTenantProfile(
  userId: string
): Promise<TenantProfile | null> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  return mockTenantProfiles[userId] || null;
}

export async function getUsers(): Promise<User[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return [...mockUsers];
}
