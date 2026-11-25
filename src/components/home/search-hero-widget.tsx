"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Building,
  CircleDollarSign,
  ArrowRight,
  Sparkles,
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
  { label: "Tất cả quận / huyện", value: "", city: "" },
  { label: "Quận Bình Thạnh (TP.HCM)", value: "Quận Bình Thạnh", city: "TP. Hồ Chí Minh" },
  { label: "Quận 1 - Trung tâm (TP.HCM)", value: "Quận 1", city: "TP. Hồ Chí Minh" },
  { label: "Quận 7 (TP.HCM)", value: "Quận 7", city: "TP. Hồ Chí Minh" },
  { label: "TP. Thủ Đức (TP.HCM)", value: "TP. Thủ Đức", city: "TP. Hồ Chí Minh" },
  { label: "Quận Cầu Giấy (Hà Nội)", value: "Quận Cầu Giấy", city: "Hà Nội" },
  { label: "Quận Đống Đa (Hà Nội)", value: "Quận Đống Đa", city: "Hà Nội" },
];

const priceRanges = [
  { label: "Tất cả mức giá", min: "", max: "" },
  { label: "Dưới 5 triệu", min: "0", max: "5000000" },
  { label: "5 - 10 triệu", min: "5000000", max: "10000000" },
  { label: "10 - 15 triệu", min: "10000000", max: "15000000" },
  { label: "Trên 15 triệu", min: "15000000", max: "" },
];

const trendingTags = [
  { label: "Gần HUTECH D2", district: "Quận Bình Thạnh", query: "HUTECH" },
  { label: "Studio Quận 1", district: "Quận 1", type: "studio" },
  { label: "Sunrise City Q7", district: "Quận 7", query: "Sunrise" },
  { label: "Phòng có gác lửng", query: "Gác lửng" },
  { label: "Ban công thoáng mát", query: "Ban công" },
];

export function SearchHeroWidget() {
  const router = useRouter();
  const [selectedType, setSelectedType] = React.useState("");
  const [selectedDistrict, setSelectedDistrict] = React.useState("");
  const [selectedPrice, setSelectedPrice] = React.useState(priceRanges[0]);
  const [searchKeyword, setSearchKeyword] = React.useState("");

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

  const handleTagClick = (tag: typeof trendingTags[0]) => {
    const params = new URLSearchParams();
    if (tag.query) params.set("query", tag.query);
    if (tag.district) params.set("district", tag.district);
    if (tag.type) params.set("propertyType", tag.type);
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
              placeholder="Tên đường, địa điểm, trường ĐH..."
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
              onChange={(e) => setSelectedDistrict(e.target.value)}
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

        {/* Quick Trending Tags */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold flex items-center gap-1 text-slate-700">
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
      </div>
    </div>
  );
}
