import { Property, Room } from "@/types";
import { mockProperties, mockRooms } from "@/mocks/properties";

export async function getProperties(landlordId?: string): Promise<Property[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  if (landlordId) {
    return mockProperties.filter((p) => p.landlordId === landlordId);
  }
  return [...mockProperties];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  return mockProperties.find((p) => p.id === id) || null;
}

export async function getRooms(propertyId?: string): Promise<Room[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  if (propertyId) {
    return mockRooms.filter((r) => r.propertyId === propertyId);
  }
  return [...mockRooms];
}

export async function getRoomById(id: string): Promise<Room | null> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  return mockRooms.find((r) => r.id === id) || null;
}
