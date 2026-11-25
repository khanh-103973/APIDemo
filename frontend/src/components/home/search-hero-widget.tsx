"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  CircleDollarSign,
  ArrowRight,
  Sparkles,
  LocateFixed,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const propertyTypes = [
  { id: "", label: "Tất cả loại hình" },
  { id: "boarding_house", label: "Phòng trọ" },
  { id: "studio", label: "Studio dịch vụ" },
  { id: "apartment", label: "Căn hộ chung cư" },
  { id: "house", label: "Nhà nguyên căn" },
];

const districts = [
  { label: "Tất cả quận / huyện (Đà Nẵng)", value: "", city: "TP. Đà Nẵng", lat: 16.0544, lng: 108.2022 },
  { label: "Quận Hải Châu - Trung tâm", value: "Quận Hải Châu", city: "TP. Đà Nẵng", lat: 16.0320, lng: 108.2210 },
  { label: "Quận Sơn Trà - Biển Mỹ Khê", value: "Quận Sơn Trà", city: "TP. Đà Nẵng", lat: 16.0680, lng: 108.2450 },
  { label: "Quận Thanh Khê", value: "Quận Thanh Khê", city: "TP. Đà Nẵng", lat: 16.0640, lng: 108.1900 },
  { label: "Quận Ngũ Hành Sơn", value: "Quận Ngũ Hành Sơn", city: "TP. Đà Nẵng", lat: 16.0180, lng: 108.2470 },
  { label: "Quận Liên Chiểu", value: "Quận Liên Chiểu", city: "TP. Đà Nẵng", lat: 16.0740, lng: 108.1490 },
  { label: "Quận Cẩm Lệ", value: "Quận Cẩm Lệ", city: "TP. Đà Nẵng", lat: 16.0110, lng: 108.1970 },
];

const priceRanges = [
  { label: "Tất cả mức giá", min: "", max: "" },
  { label: "Dưới 5 triệu", min: "0", max: "5000000" },
  { label: "5 - 10 triệu", min: "5000000", max: "10000000" },
  { label: "10 - 15 triệu", min: "10000000", max: "15000000" },
  { label: "Trên 15 triệu", min: "15000000", max: "" },
];

const trendingTags = [
  { label: "Gần ĐH Đông Á", district: "Quận Hải Châu", query: "Đông Á" },
  { label: "Biển Mỹ Khê - Sơn Trà", district: "Quận Sơn Trà", query: "Mỹ Khê" },
  { label: "Gác lửng Thanh Khê", district: "Quận Thanh Khê", query: "gác lửng" },
  { label: "Studio Ngũ Hành Sơn", district: "Quận Ngũ Hành Sơn", query: "Studio" },
  { label: "Dưới 5 triệu", maxPrice: "5000000" },
];

export function SearchHeroWidget() {
  const router = useRouter();
  const [selectedType, setSelectedType] = React.useState("");
  const [selectedDistrict, setSelectedDistrict] = React.useState("");
  const [selectedPrice, setSelectedPrice] = React.useState(priceRanges[0]);
  const [searchKeyword, setSearchKeyword] = React.useState("");
  const [geoStatus, setGeoStatus] = React.useState<string | null>(null);
  const [isLocating, setIsLocating] = React.useState(false);

  const handleUseMyLocation = () => {
    setIsLocating(true);
    setGeoStatus(null);

    const selectNearestDistrict = (lat: number, lng: number) => {
      const candidates = districts.filter((d) => d.value !== "");
      let nearest = candidates[0];
      let bestDist = Infinity;
      for (const d of candidates) {
        const dist = Math.hypot(lat - d.lat, lng - d.lng);
        if (dist < bestDist) {
          bestDist = dist;
          nearest = d;
        }
      }
      setSelectedDistrict(nearest.value);
      setIsLocating(false);
      setGeoStatus(`Đã xác định khu vực gần bạn: ${nearest.value}, TP. Đà Nẵng`);
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // Nếu tọa độ nằm trong khu vực Đà Nẵng (vĩ độ 15.8 - 16.3, kinh độ 107.8 - 108.5)
          if (latitude >= 15.8 && latitude <= 16.3 && longitude >= 107.8 && longitude <= 108.5) {
            selectNearestDistrict(latitude, longitude);
          } else {
            // Mặc định chọn Quận Hải Châu (trung tâm TP. Đà Nẵng)
            setSelectedDistrict("Quận Hải Châu");
            setIsLocating(false);
            setGeoStatus("Đã chọn khu vực trung tâm: Quận Hải Châu, TP. Đà Nẵng");
          }
        },
        () => {
          setSelectedDistrict("Quận Hải Châu");
          setIsLocating(false);
          setGeoStatus("Đã chọn mặc định gần bạn: Quận Hải Châu, TP. Đà Nẵng");
        },
        { timeout: 5000 }
      );
    } else {
      setSelectedDistrict("Quận Hải Châu");
      setIsLocating(false);
      setGeoStatus("Đã chọn khu vực: Quận Hải Châu, TP. Đà Nẵng");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.set("query", searchKeyword.trim());
    if (selectedType) params.set("propertyType", selectedType);

    const districtObj = districts.find((d) => d.value === selectedDistrict);
    if (districtObj && districtObj.value) {
      params.set("district", districtObj.value);
      params.set("city", districtObj.city);
    }

    if (selectedPrice.min) params.set("minPrice", selectedPrice.min);
    if (selectedPrice.max) params.set("maxPrice", selectedPrice.max);

    router.push(`/listings?${params.toString()}`);
  };

  const handleTagClick = (tag: (typeof trendingTags)[number]) => {
    const params = new URLSearchParams();
    if ("query" in tag && tag.query) params.set("query", tag.query);
    if ("district" in tag && tag.district) {
      params.set("district", tag.district);
      params.set("city", "TP. Đà Nẵng");
    }
    if ("maxPrice" in tag && tag.maxPrice) {
      params.set("minPrice", "0");
      params.set("maxPrice", tag.maxPrice);
    }
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {propertyTypes.map((type) => {
          const isActive = selectedType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-primary border-t-2 border-t-primary shadow-sm"
                  : "bg-white/60 text-slate-600 hover:bg-white/80 hover:text-foreground"
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Main Glass Search Bar */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 shadow-xl border border-white/80">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
        >
          {/* Keyword & Location */}
          <div className="md:col-span-4 relative flex items-center">
            <div className="absolute left-3 text-primary pointer-events-none">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tên đường, ĐH Đông Á, Mỹ Khê..."
              className="w-full h-12 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* District selector */}
          <div className="md:col-span-3 relative flex items-center">
            <div className="absolute left-3 text-emerald-600 pointer-events-none">
              <MapPin className="h-4 w-4" />
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setGeoStatus(null);
              }}
              className="w-full h-12 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer appearance-none"
            >
              {districts.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price selector */}
          <div className="md:col-span-3 relative flex items-center">
            <div className="absolute left-3 text-amber-600 pointer-events-none">
              <CircleDollarSign className="h-4 w-4" />
            </div>
            <select
              value={`${selectedPrice.min}-${selectedPrice.max}`}
              onChange={(e) => {
                const found = priceRanges.find(
                  (p) => `${p.min}-${p.max}` === e.target.value
                );
                if (found) setSelectedPrice(found);
              }}
              className="w-full h-12 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer appearance-none"
            >
              {priceRanges.map((p) => (
                <option key={`${p.min}-${p.max}`} value={`${p.min}-${p.max}`}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Search Button */}
          <div className="md:col-span-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 rounded-xl text-sm font-bold gap-2 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all cursor-pointer"
            >
              <span>Tìm phòng</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Quick Trending Tags + Geolocation button */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer text-[11px] font-semibold"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            {isLocating ? "Đang định vị..." : "Gần tôi (Đà Nẵng)"}
          </button>

          <span className="font-semibold flex items-center gap-1 text-slate-700 ml-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Gợi ý nhanh:
          </span>
          {trendingTags.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-2.5 py-1 rounded-full bg-slate-100/90 hover:bg-purple-50 hover:text-primary text-slate-600 transition-colors cursor-pointer text-[11px] font-medium"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {geoStatus && (
          <p className="mt-2 text-[11px] text-emerald-700 font-medium text-left">
            {geoStatus}
          </p>
        )}
      </div>
    </div>
  );
}
