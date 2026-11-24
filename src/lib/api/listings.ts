import { Listing, ListingFilterParams } from "@/types";
import { mockListings } from "@/mocks/listings";

export async function getListings(
  filters?: ListingFilterParams
): Promise<Listing[]> {
  // Simulate network latency (20ms) for realistic async behavior
  await new Promise((resolve) => setTimeout(resolve, 20));

  let results = [...mockListings];

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
  return mockListings.find((l) => l.id === id) || null;
}

export async function getFeaturedListings(): Promise<Listing[]> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  return mockListings.filter((l) => l.isFeatured && l.status === "active");
}
