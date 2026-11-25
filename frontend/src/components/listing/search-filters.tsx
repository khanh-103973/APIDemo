"use client";

import * as React from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ListingFilterParams, PropertyType } from "@/types";

export interface SearchFiltersProps {
  filters: ListingFilterParams;
  onFilterChange: (filters: ListingFilterParams) => void;
  onReset: () => void;
  searchInput?: string;
  onSearchInputChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  className?: string;
}

const cityOptions = [
  { label: "Tất cả thành phố", value: "" },
  { label: "TP. Đà Nẵng", value: "TP. Đà Nẵng" },
  { label: "TP. Hồ Chí Minh", value: "TP. Hồ Chí Minh" },
  { label: "Hà Nội", value: "Hà Nội" },
];

const districtOptions = [
  { label: "Tất cả quận/huyện", value: "" },
  { label: "Quận Hải Châu", value: "Quận Hải Châu" },
  { label: "Quận Sơn Trà", value: "Quận Sơn Trà" },
  { label: "Quận Thanh Khê", value: "Quận Thanh Khê" },
  { label: "Quận Ngũ Hành Sơn", value: "Quận Ngũ Hành Sơn" },
  { label: "Quận Liên Chiểu", value: "Quận Liên Chiểu" },
  { label: "Quận Cẩm Lệ", value: "Quận Cẩm Lệ" },
];

const propertyTypeOptions = [
  { label: "Tất cả loại hình", value: "" },
  { label: "Phòng trọ", value: "boarding_house" },
  { label: "Căn hộ dịch vụ Studio", value: "studio" },
  { label: "Căn hộ chung cư", value: "apartment" },
  { label: "Nhà nguyên căn", value: "house" },
];

const priceRangeOptions = [
  { label: "Tất cả mức giá", value: "" },
  { label: "Dưới 5 triệu", value: "0-5000000" },
  { label: "5 - 10 triệu", value: "5000000-10000000" },
  { label: "10 - 15 triệu", value: "10000000-15000000" },
  { label: "Trên 15 triệu", value: "15000000-999999999" },
];

const amenityOptions = [
  "Máy lạnh",
  "Thang máy",
  "Ban công",
  "Gác lửng",
  "Bảo vệ 24/7",
  "Hầm để xe",
  "Bếp riêng",
  "Khóa vân tay",
];

export function SearchFilters({
  filters,
  onFilterChange,
  onReset,
  searchInput: controlledSearch,
  onSearchInputChange,
  onSearchSubmit,
  className,
}: SearchFiltersProps) {
  const [localSearch, setLocalSearch] = React.useState(filters.query || "");
  const isControlled = controlledSearch !== undefined;
  const searchValue = isControlled ? controlledSearch : localSearch;

  const setSearchValue = (next: string) => {
    if (onSearchInputChange) {
      onSearchInputChange(next);
    } else {
      setLocalSearch(next);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (onSearchSubmit) {
      onSearchSubmit(trimmed);
    } else {
      onFilterChange({ ...filters, query: trimmed || undefined });
    }
  };

  const handlePriceSelect = (value: string) => {
    if (!value) {
      onFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined });
      return;
    }
    const [min, max] = value.split("-").map(Number);
    onFilterChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const currentPriceRangeValue = React.useMemo(() => {
    if (filters.minPrice === 0 && filters.maxPrice === 5000000) return "0-5000000";
    if (filters.minPrice === 5000000 && filters.maxPrice === 10000000) return "5000000-10000000";
    if (filters.minPrice === 10000000 && filters.maxPrice === 15000000) return "10000000-15000000";
    if (filters.minPrice === 15000000) return "15000000-999999999";
    return "";
  }, [filters.minPrice, filters.maxPrice]);

  const handleToggleAmenity = (amenity: string) => {
    const current = filters.amenities || [];
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onFilterChange({ ...filters, amenities: next.length > 0 ? next : undefined });
  };

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.query) {
    activeChips.push({
      key: "query",
      label: `Từ khóa: "${filters.query}"`,
      onRemove: () => {
        setSearchValue("");
        onFilterChange({ ...filters, query: undefined });
      },
    });
  }

  if (filters.city) {
    activeChips.push({
      key: "city",
      label: filters.city,
      onRemove: () => onFilterChange({ ...filters, city: undefined, district: undefined }),
    });
  }

  if (filters.district) {
    activeChips.push({
      key: "district",
      label: filters.district,
      onRemove: () => onFilterChange({ ...filters, district: undefined }),
    });
  }

  if (filters.propertyType) {
    const match = propertyTypeOptions.find((p) => p.value === filters.propertyType);
    activeChips.push({
      key: "propertyType",
      label: match?.label || filters.propertyType,
      onRemove: () => onFilterChange({ ...filters, propertyType: undefined }),
    });
  }

  if (currentPriceRangeValue) {
    const match = priceRangeOptions.find((p) => p.value === currentPriceRangeValue);
    activeChips.push({
      key: "price",
      label: match?.label || "Mức giá",
      onRemove: () => onFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined }),
    });
  } else if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const label =
      filters.minPrice !== undefined && filters.maxPrice !== undefined
        ? `${(filters.minPrice / 1_000_000).toFixed(1)} - ${(filters.maxPrice / 1_000_000).toFixed(1)} triệu`
        : filters.minPrice !== undefined
        ? `Từ ${(filters.minPrice / 1_000_000).toFixed(1)} triệu`
        : `Dưới ${((filters.maxPrice ?? 0) / 1_000_000).toFixed(1)} triệu`;
    activeChips.push({
      key: "custom-price",
      label,
      onRemove: () => onFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined }),
    });
  }

  if (filters.bedrooms !== undefined) {
    activeChips.push({
      key: "bedrooms",
      label: `Từ ${filters.bedrooms} PN`,
      onRemove: () => onFilterChange({ ...filters, bedrooms: undefined }),
    });
  }

  if (filters.amenities && filters.amenities.length > 0) {
    filters.amenities.forEach((a) => {
      activeChips.push({
        key: `amenity-${a}`,
        label: a,
        onRemove: () => handleToggleAmenity(a),
      });
    });
  }

  return (
    <div className={className}>
      {/* Search Bar Row */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 min-w-0">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm theo khu vực, đường, trường ĐH (VD: Hải Châu, Đông Á, Mỹ Khê)..."
            className="pl-9 pr-8"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                if (filters.query) {
                  onFilterChange({ ...filters, query: undefined });
                }
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button type="submit" variant="primary" className="shrink-0 w-full sm:w-auto">
          Tìm kiếm
        </Button>
      </form>

      {/* Primary Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          value={filters.city || ""}
          onChange={(e) => onFilterChange({ ...filters, city: e.target.value || undefined, district: undefined })}
          options={cityOptions}
        />

        <Select
          value={filters.district || ""}
          onChange={(e) => onFilterChange({ ...filters, district: e.target.value || undefined })}
          options={districtOptions}
        />

        <Select
          value={filters.propertyType || ""}
          onChange={(e) => onFilterChange({ ...filters, propertyType: (e.target.value as PropertyType) || undefined })}
          options={propertyTypeOptions}
        />

        <Select
          value={currentPriceRangeValue}
          onChange={(e) => handlePriceSelect(e.target.value)}
          options={priceRangeOptions}
        />
      </div>

      {/* Amenities Chips Selector */}
      <div className="mt-4 pt-4 border-t border-border">
        <span className="text-xs font-semibold text-muted-foreground block mb-2">
          Tiện ích phổ biến:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {amenityOptions.map((amenity) => {
            const isSelected = filters.amenities?.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => handleToggleAmenity(amenity)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                    : "bg-background text-muted-foreground border-input hover:border-primary hover:text-foreground"
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      {/* Applied Filter Chips Bar */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground font-medium">Đang lọc theo:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground border border-purple-200 max-w-full"
            >
              <span className="truncate">{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:bg-purple-200 rounded-full p-0.5 text-secondary-foreground cursor-pointer shrink-0"
                aria-label={`Xóa bộ lọc ${chip.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              onReset();
            }}
            className="text-xs font-semibold text-destructive hover:underline ml-auto flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}
