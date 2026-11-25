import { Listing, ListingFilterParams } from "@/types";
import { mockListings } from "@/mocks/listings";
import { apiRequest, resolveBackendImageUrl } from "@/lib/api/client";

export const STORAGE_KEY_LISTINGS = "house_rental_listings";

export interface BackendHouse {
  id: number;
  title: string;
  description: string;
  address: string;
  price: number;
  area: number;
  bedrooms: number;
  imageUrl?: string;
  status: string;
  ownerId: number;
}

export interface BackendPageResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

function normalizeVi(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function inferPropertyType(house: BackendHouse): Listing["propertyType"] {
  const titleNorm = normalizeVi(house.title || "");
  if (titleNorm.includes("studio")) return "studio";
  if (titleNorm.includes("phong tro") || titleNorm.includes("gac lung")) return "boarding_house";
  if (titleNorm.includes("nguyen can") || house.bedrooms >= 2) return "house";
  return "apartment";
}

export function mapHouseToListing(house: BackendHouse): Listing {
  const parts = (house.address || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let street = house.address || "";
  let district = "Quận Hải Châu";
  let city = "TP. Đà Nẵng";

  if (parts.length >= 3) {
    city = parts[parts.length - 1];
    district = parts[parts.length - 2];
    street = parts.slice(0, parts.length - 2).join(", ");
  } else if (parts.length === 2) {
    city = parts[1];
    district = parts[0];
    street = "";
  } else if (parts.length === 1) {
    street = parts[0];
  }

  const normalizedStatus = (house.status || "").toLowerCase();

  return {
    id: `house_${house.id}`,
    landlordId: String(house.ownerId),
    propertyId: `prop_${house.id}`,
    title: house.title,
    slug: `house-${house.id}`,
    description: house.description || "",
    propertyType: inferPropertyType(house),
    rentPrice: Number(house.price) || 0,
    deposit: Number(house.price) || 0,
    area: Number(house.area) || 25,
    bedrooms: Number(house.bedrooms) || 1,
    bathrooms: Math.max(1, Math.min(house.bedrooms || 1, 2)),
    address: street,
    ward: "",
    district,
    city,
    amenities: ["Wi-Fi tốc độ cao", "Điều hòa", "An ninh 24/7"],
    images: [resolveBackendImageUrl(house.imageUrl)],
    status:
      normalizedStatus === "rented"
        ? "rented"
        : normalizedStatus === "maintenance"
        ? "hidden"
        : "active",
    moderationStatus: "approved",
    isFeatured: true,
    viewsCount: 120,
    createdAt: new Intl.DateTimeFormat("vi-VN").format(new Date()),
    updatedAt: new Intl.DateTimeFormat("vi-VN").format(new Date()),
  };
}

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

export async function fetchAllHousesFromApi(): Promise<Listing[] | null> {
  try {
    const res = await apiRequest<BackendPageResult<BackendHouse>>(
      "/houses?pageNumber=1&pageSize=100",
      { skipAuth: true }
    );
    if (res && Array.isArray(res.items)) {
      const mapped = res.items.map(mapHouseToListing);
      if (typeof window !== "undefined" && mapped.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(mapped));
        } catch {}
      }
      return mapped;
    }
  } catch {
    return null;
  }
  return null;
}

export async function getListings(
  filters?: ListingFilterParams
): Promise<Listing[]> {
  try {
    const query = new URLSearchParams();
    query.set("pageNumber", "1");
    query.set("pageSize", "50");
    if (filters?.query) query.set("searchTerm", filters.query);
    if (filters?.minPrice !== undefined)
      query.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined)
      query.set("maxPrice", String(filters.maxPrice));
    if (filters?.sortBy === "price_asc") {
      query.set("sortBy", "price");
      query.set("isDescending", "false");
    } else if (filters?.sortBy === "price_desc") {
      query.set("sortBy", "price");
      query.set("isDescending", "true");
    } else if (filters?.sortBy === "area_desc") {
      query.set("sortBy", "area");
      query.set("isDescending", "true");
    }

    const res = await apiRequest<BackendPageResult<BackendHouse>>(
      `/houses?${query.toString()}`,
      { skipAuth: true }
    );
    if (res && Array.isArray(res.items) && res.items.length > 0) {
      let apiListings = res.items.map(mapHouseToListing);
      if (typeof window !== "undefined" && !filters?.query) {
        try {
          localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(apiListings));
        } catch {}
      }
      if (filters?.city) {
        const cityNorm = normalizeVi(filters.city);
        apiListings = apiListings.filter((l) =>
          normalizeVi(`${l.city} ${l.address}`).includes(cityNorm)
        );
      }
      if (filters?.district) {
        const distNorm = normalizeVi(filters.district);
        apiListings = apiListings.filter((l) =>
          normalizeVi(`${l.district} ${l.address}`).includes(distNorm)
        );
      }
      if (filters?.propertyType) {
        apiListings = apiListings.filter(
          (l) => l.propertyType === filters.propertyType
        );
      }
      if (filters?.bedrooms !== undefined) {
        apiListings = apiListings.filter(
          (l) => l.bedrooms >= (filters.bedrooms ?? 0)
        );
      }
      return apiListings;
    }
  } catch {
    // Graceful fallback to local/mock data if backend is offline
  }

  const all = getRawListings();

  let results = all.filter(
    (l) =>
      l.status === "active" &&
      (!l.moderationStatus || l.moderationStatus === "approved")
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
    results = results.filter(
      (l) => l.rentPrice <= (filters.maxPrice ?? Infinity)
    );
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
        break;
    }
  }

  return results;
}

export async function getListingById(id: string): Promise<Listing | null> {
  const numericId = id.startsWith("house_") ? id.replace("house_", "") : id;
  if (/^\d+$/.test(numericId)) {
    try {
      const house = await apiRequest<BackendHouse>(`/houses/${numericId}`, {
        skipAuth: true,
      });
      if (house) return mapHouseToListing(house);
    } catch {
      // Fall back to local/mock listings
    }
  }

  const all = getRawListings();
  return all.find((l) => l.id === id) || null;
}

export async function getFeaturedListings(): Promise<Listing[]> {
  try {
    const res = await apiRequest<BackendPageResult<BackendHouse>>(
      "/houses?pageNumber=1&pageSize=6",
      { skipAuth: true }
    );
    if (res && Array.isArray(res.items) && res.items.length > 0) {
      return res.items.map(mapHouseToListing);
    }
  } catch {
    // Fall back to mock listings
  }

  const all = getRawListings();
  return all.filter(
    (l) =>
      l.isFeatured &&
      l.status === "active" &&
      (!l.moderationStatus || l.moderationStatus === "approved")
  );
}
