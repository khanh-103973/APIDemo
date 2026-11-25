"use client";

import * as React from "react";
import {
  LayoutGrid,
  List as ListIcon,
  Map as MapIcon,
  SlidersHorizontal,
  Home,
  Sparkles,
  Building,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { Listing, ListingFilterParams, PropertyType } from "@/types";
import { getListings } from "@/lib/api/listings";
import { ListingCard } from "@/components/listing/listing-card";
import { SearchFilters } from "@/components/listing/search-filters";
import { MockMap } from "@/components/listing/mock-map";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const quickTypes = [
  { id: "", label: "Tất cả" },
  { id: "boarding_house", label: "Phòng trọ" },
  { id: "studio", label: "Studio dịch vụ" },
  { id: "apartment", label: "Căn hộ chung cư" },
  { id: "house", label: "Nhà nguyên căn" },
];

export default function ListingsPage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isPending, startTransition] = React.useTransition();
  const [filters, setFilters] = React.useState<ListingFilterParams>({
    sortBy: "newest",
  });
  const [viewMode, setViewMode] = React.useState<"grid" | "list" | "map">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
  const [initialLoaded, setInitialLoaded] = React.useState(false);

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
    setFilters({ sortBy: "newest" });
  };

  const sortOptions = [
    { label: "Mới nhất", value: "newest" },
    { label: "Giá tăng dần", value: "price_asc" },
    { label: "Giá giảm dần", value: "price_desc" },
    { label: "Diện tích lớn nhất", value: "area_desc" },
  ];

  const loading = !initialLoaded || isPending;

  return (
    <div className="min-h-screen bg-surface/30 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <span className="hover:text-foreground">Trang chủ</span>
            <span>/</span>
            <span className="font-semibold text-foreground">Danh sách phòng cho thuê</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Khám phá phòng trọ & căn hộ cho thuê
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Minh bạch chi phí, thông tin thực tế 100%, kết nối trực tiếp với chủ nhà uy tín.
              </p>
            </div>

            {/* Quick Type Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickTypes.map((type) => {
                const isActive = (filters.propertyType || "") === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        propertyType: (type.id as PropertyType) || undefined,
                      })
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
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
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Trigger Button */}
        <div className="flex md:hidden items-center justify-between gap-3 mb-4">
          <Button
            variant="outline"
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc tìm kiếm
          </Button>
          <div className="w-40">
            <Select
              value={filters.sortBy || "newest"}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as ListingFilterParams["sortBy"],
                })
              }
              options={sortOptions}
            />
          </div>
        </div>

        {/* Control Bar: Result count, Sort, View toggles */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
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
                    setFilters({
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
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              setMobileFilterOpen(false);
            }}
            onReset={() => {
              handleResetFilters();
              setMobileFilterOpen(false);
            }}
          />
        </div>
      </Sheet>
    </div>
  );
}
