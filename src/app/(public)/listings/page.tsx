"use client";

import * as React from "react";
import {
  LayoutGrid,
  List as ListIcon,
  Map as MapIcon,
  SlidersHorizontal,
  Home,
} from "lucide-react";
import { Listing, ListingFilterParams } from "@/types";
import { getListings } from "@/lib/api/listings";
import { ListingCard } from "@/components/listing/listing-card";
import { SearchFilters } from "@/components/listing/search-filters";
import { MockMap } from "@/components/listing/mock-map";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

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
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Khám phá phòng trọ & căn hộ cho thuê
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Minh bạch chi phí, hợp đồng rõ ràng, kết nối trực tiếp với chủ nhà uy tín.
          </p>
        </div>

        {/* Filter Desktop Bar */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6 shadow-xs hidden md:block">
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
                kết quả phù hợp
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
            <div className="inline-flex rounded-md border border-border bg-card p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
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
                className={`p-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
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
                className={`p-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
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
              <div key={n} className="rounded-lg border border-border bg-card p-4 space-y-3">
                <Skeleton className="aspect-16/10 w-full rounded-md" />
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
            description="Hãy thử thay đổi từ khóa tìm kiếm, mở rộng mức giá hoặc xóa bớt các tiêu chí lọc."
            actionLabel="Xóa bộ lọc tìm kiếm"
            onAction={handleResetFilters}
          />
        ) : viewMode === "map" ? (
          <MockMap listings={listings} />
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} layout="list" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} layout="grid" />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filters Drawer */}
      <Sheet
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        side="bottom"
        title="Bộ lọc tìm kiếm"
      >
        <SearchFilters
          filters={filters}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
          }}
          onReset={() => {
            handleResetFilters();
            setMobileFilterOpen(false);
          }}
        />
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setMobileFilterOpen(false)}
          >
            Áp dụng bộ lọc
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
