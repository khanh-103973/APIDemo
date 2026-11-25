import { Listing, ListingFilterParams } from "@/types";
import { mockListings } from "@/mocks/listings";

export const STORAGE_KEY_LISTINGS = "house_rental_listings";

export function getRawListings(): Listing[] {
  if (typeof window === "undefined") return mockListings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LISTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(mockListings));
  } catch {}
  return mockListings;
}

export async function getListings(
  filters?: ListingFilterParams
): Promise<Listing[]> {
  // Simulate network latency (20ms) for realistic async behavior
  await new Promise((resolve) => setTimeout(resolve, 20));

  const all = getRawListings();

  // Public Marketplace Security Guard: ONLY active and approved listings are public
  let results = all.filter(
    (l) => l.status === "active" && (!l.moderationStatus || l.moderationStatus === "approved")
  );

  if (!filters) return results;

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q)
    );
  }

  if (filters.city) {
    results = results.filter((l) => l.city === filters.city);
  }

  if (filters.district) {
    results = results.filter((l) => l.district === filters.district);
  }

  if (filters.propertyType) {
    results = results.filter((l) => l.propertyType === filters.propertyType);
  }

  if (filters.minPrice !== undefined) {
    results = results.filter((l) => l.rentPrice >= (filters.minPrice ?? 0));
  }

  if (filters.maxPrice !== undefined) {
    results = results.filter((l) => l.rentPrice <= (filters.maxPrice ?? Infinity));
  }

  if (filters.bedrooms !== undefined) {
    results = results.filter((l) => l.bedrooms >= (filters.bedrooms ?? 0));
  }

  if (filters.amenities && filters.amenities.length > 0) {
    results = results.filter((l) =>
      filters.amenities!.every((a) => l.amenities.includes(a))
    );
  }

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "price_asc":
        results.sort((a, b) => a.rentPrice - b.rentPrice);
        break;
      case "price_desc":
        results.sort((a, b) => b.rentPrice - a.rentPrice);
        break;
      case "area_desc":
        results.sort((a, b) => b.area - a.area);
        break;
      case "newest":
      default:
        // maintain existing order
        break;
    }
  }

  return results;
}

export async function getListingById(id: string): Promise<Listing | null> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const all = getRawListings();
  return all.find((l) => l.id === id) || null;
}

export async function getFeaturedListings(): Promise<Listing[]> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const all = getRawListings();
  return all.filter(
    (l) =>
      l.isFeatured &&
      l.status === "active" &&
      (!l.moderationStatus || l.moderationStatus === "approved")
  );
}
