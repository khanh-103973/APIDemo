"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  List as ListIcon,
  Map as MapIcon,
  SlidersHorizontal,
  Home,
} from "lucide-react";
import { Listing, ListingFilterParams, PropertyType } from "@/types";
import { getListings } from "@/lib/api/listings";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingCard } from "@/components/listing/listing-card";
import { SearchFilters } from "@/components/listing/search-filters";
import { MockMap } from "@/components/listing/mock-map";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const VALID_PROPERTY_TYPES: PropertyType[] = [
  "apartment",
  "house",
  "boarding_house",
  "studio",
  "villa",
];

const VALID_SORT_VALUES: NonNullable<ListingFilterParams["sortBy"]>[] = [
  "newest",
  "price_asc",
  "price_desc",
  "area_desc",
];

const quickTypes = [
  { id: "", label: "Tất cả" },
  { id: "boarding_house", label: "Phòng trọ" },
  { id: "studio", label: "Studio dịch vụ" },
  { id: "apartment", label: "Căn hộ chung cư" },
  { id: "house", label: "Nhà nguyên căn" },
];

function parseNumericParam(raw: string | null): number | undefined {
  if (!raw || raw.trim() === "") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseFiltersFromParams(params: URLSearchParams): ListingFilterParams {
  const rawQuery = (params.get("query") || params.get("q") || "").trim();
  const rawCity = (params.get("city") || "").trim();
  const rawDistrict = (params.get("district") || "").trim();
  const rawType = (params.get("propertyType") || "").trim();
  const rawSort = (params.get("sort") || params.get("sortBy") || "newest").trim();
  const rawAmenities = (params.get("amenities") || "").trim();

  const propertyType = VALID_PROPERTY_TYPES.includes(rawType as PropertyType)
    ? (rawType as PropertyType)
    : undefined;

  const sortBy = VALID_SORT_VALUES.includes(
    rawSort as NonNullable<ListingFilterParams["sortBy"]>
  )
    ? (rawSort as NonNullable<ListingFilterParams["sortBy"]>)
    : "newest";

  const amenities = rawAmenities
    ? rawAmenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : undefined;

  return {
    query: rawQuery || undefined,
    city: rawCity || undefined,
    district: rawDistrict || undefined,
    propertyType,
    minPrice: parseNumericParam(params.get("minPrice")),
    maxPrice: parseNumericParam(params.get("maxPrice")),
    bedrooms: parseNumericParam(params.get("bedrooms")),
    amenities: amenities && amenities.length > 0 ? amenities : undefined,
    sortBy,
  };
}

function serializeFiltersToQueryString(filters: ListingFilterParams): string {
  const params = new URLSearchParams();
  if (filters.query?.trim()) params.set("query", filters.query.trim());
  if (filters.city) params.set("city", filters.city);
  if (filters.district) params.set("district", filters.district);
  if (filters.propertyType) params.set("propertyType", filters.propertyType);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.bedrooms !== undefined) params.set("bedrooms", String(filters.bedrooms));
  if (filters.amenities && filters.amenities.length > 0) {
    params.set("amenities", filters.amenities.join(","));
  }
  if (filters.sortBy && filters.sortBy !== "newest") {
    params.set("sort", filters.sortBy);
  }
  return params.toString();
}

function ListingsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  // URL query string is the single source of truth so F5 / shareable links / Back-Forward always stay synced
  const filters = React.useMemo(
    () => parseFiltersFromParams(new URLSearchParams(searchParamsKey)),
    [searchParamsKey]
  );

  const [searchInput, setSearchInput] = React.useState(
    () => filters.query || ""
  );
  const debouncedSearchInput = useDebounce(searchInput, 350);

  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isPending, startTransition] = React.useTransition();
  const [viewMode, setViewMode] = React.useState<"grid" | "list" | "map">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
  const [initialLoaded, setInitialLoaded] = React.useState(false);

  const updateUrlFilters = React.useCallback(
    (nextFilters: ListingFilterParams) => {
      const nextQueryString = serializeFiltersToQueryString(nextFilters);
      if (nextQueryString === searchParamsKey) return;
      const targetUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router, searchParamsKey]
  );

  // Sync debounced search keyword into URL query string without spamming router/API on every keystroke
  React.useEffect(() => {
    const trimmed = debouncedSearchInput.trim();
    const currentUrlQuery = filters.query || "";
    if (trimmed === currentUrlQuery) return;
    updateUrlFilters({
      ...filters,
      query: trimmed || undefined,
    });
  }, [debouncedSearchInput, filters, updateUrlFilters]);

  // Keep search input aligned on browser Back/Forward navigation
  React.useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchInput((params.get("query") || params.get("q") || "").trim());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      const data = await getListings(filters);
      if (!cancelled) {
        setListings(data);
        setInitialLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const handleResetFilters = () => {
    setSearchInput("");
    updateUrlFilters({ sortBy: "newest" });
  };

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.city) count++;
    if (filters.district) count++;
    if (filters.propertyType) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.bedrooms !== undefined) count++;
    if (filters.amenities?.length) count += filters.amenities.length;
    return count;
  }, [filters]);

  const sortOptions = [
    { label: "Mới nhất", value: "newest" },
    { label: "Giá tăng dần", value: "price_asc" },
    { label: "Giá giảm dần", value: "price_desc" },
    { label: "Diện tích lớn nhất", value: "area_desc" },
  ];

  const loading = !initialLoaded || isPending;

  return (
    <div className="min-h-screen bg-surface/30 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">Danh sách phòng cho thuê</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-heading text-xl sm:text-3xl font-bold text-foreground">
                Khám phá phòng trọ & căn hộ cho thuê
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Minh bạch chi phí, thông tin thực tế 100%, kết nối trực tiếp với chủ nhà uy tín.
              </p>
            </div>

            {/* Quick Type Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {quickTypes.map((type) => {
                const isActive = (filters.propertyType || "") === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      updateUrlFilters({
                        ...filters,
                        propertyType: (type.id as PropertyType) || undefined,
                      })
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-primary text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Desktop Bar */}
        <div className="glass-card rounded-2xl p-5 mb-6 shadow-sm border border-slate-200 hidden md:block">
          <SearchFilters
            filters={filters}
            onFilterChange={updateUrlFilters}
            onReset={handleResetFilters}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={(val) =>
              updateUrlFilters({ ...filters, query: val || undefined })
            }
          />
        </div>

        {/* Mobile Filter Trigger Button */}
        <div className="flex md:hidden items-center justify-between gap-2 mb-4">
          <Button
            variant="outline"
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 min-w-0 gap-2 text-xs sm:text-sm"
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span className="truncate">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <div className="w-36 shrink-0">
            <Select
              value={filters.sortBy || "newest"}
              onChange={(e) =>
                updateUrlFilters({
                  ...filters,
                  sortBy: e.target.value as ListingFilterParams["sortBy"],
                })
              }
              options={sortOptions}
            />
          </div>
        </div>

        {/* Control Bar: Result count, Sort, View toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="text-sm text-muted-foreground">
            {loading ? (
              <span className="inline-block w-28 h-4 bg-muted animate-pulse rounded" />
            ) : (
              <span>
                Tìm thấy{" "}
                <strong className="text-foreground font-semibold">
                  {listings.length}
                </strong>{" "}
                phòng cho thuê phù hợp
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sắp xếp:</span>
              <div className="w-44">
                <Select
                  value={filters.sortBy || "newest"}
                  onChange={(e) =>
                    updateUrlFilters({
                      ...filters,
                      sortBy: e.target.value as ListingFilterParams["sortBy"],
                    })
                  }
                  options={sortOptions}
                />
              </div>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="inline-flex rounded-lg border border-border bg-card p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Xem dạng lưới"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Xem dạng danh sách"
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === "map"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Xem trên bản đồ"
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <Skeleton className="aspect-16/10 w-full rounded-lg" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Home}
            title="Không tìm thấy phòng thuê phù hợp"
            description="Hãy thử bỏ bớt điều kiện lọc hoặc tìm kiếm theo khu vực / mức giá khác."
            actionLabel="Xóa toàn bộ bộ lọc"
            onAction={handleResetFilters}
          />
        ) : viewMode === "map" ? (
          <MockMap listings={listings} />
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                layout="list"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        side="bottom"
        title="Bộ lọc tìm kiếm phòng thuê"
      >
        <div className="py-2">
          <SearchFilters
            filters={filters}
            onFilterChange={updateUrlFilters}
            onReset={() => {
              handleResetFilters();
              setMobileFilterOpen(false);
            }}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={(val) => {
              updateUrlFilters({ ...filters, query: val || undefined });
              setMobileFilterOpen(false);
            }}
          />
          <div className="mt-4 pt-3 border-t border-border">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={() => setMobileFilterOpen(false)}
            >
              Xem {listings.length} kết quả phù hợp
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-surface/30 py-12 text-center text-sm text-muted-foreground">
          Đang tải danh sách phòng cho thuê tại Đà Nẵng...
        </div>
      }
    >
      <ListingsPageContent />
    </React.Suspense>
  );
}
