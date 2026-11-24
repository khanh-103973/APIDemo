"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Heart, ShieldCheck, Bed, Bath, Maximize2 } from "lucide-react";
import { Listing } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatVND } from "@/lib/format/currency";
import { cn } from "@/lib/utils";

export interface ListingCardProps {
  listing: Listing;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  layout?: "grid" | "list";
}

const propertyTypeLabels: Record<string, string> = {
  apartment: "Căn hộ",
  house: "Nhà nguyên căn",
  boarding_house: "Phòng trọ",
  studio: "Studio",
  villa: "Biệt thự",
};

export function ListingCard({
  listing,
  isFavorited = false,
  onToggleFavorite,
  layout = "grid",
}: ListingCardProps) {
  const [favorite, setFavorite] = React.useState(isFavorited);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !favorite;
    setFavorite(nextState);
    if (onToggleFavorite) {
      onToggleFavorite(listing.id);
    }
  };

  const propertyTypeLabel =
    propertyTypeLabels[listing.propertyType] || listing.propertyType;

  if (layout === "list") {
    return (
      <Link href={`/listings/${listing.id}`} className="block">
        <Card interactive className="overflow-hidden transition-all duration-200">
          <div className="flex flex-col sm:flex-row">
            {/* Image Cover */}
            <div className="sm:w-64 h-48 sm:h-auto shrink-0 relative overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <StatusBadge status={listing.status} />
                {listing.isFeatured && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500 text-white shadow-xs">
                    Nổi bật
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleFavoriteClick}
                className={cn(
                  "absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs transition-colors hover:bg-white cursor-pointer shadow-xs",
                  favorite ? "text-red-500" : "text-slate-600 hover:text-red-500"
                )}
                aria-label={favorite ? "Xóa khỏi danh sách yêu thích" : "Lưu vào yêu thích"}
              >
                <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
              </button>
            </div>

            {/* Content Details */}
            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                  <span className="font-semibold text-primary px-2 py-0.5 rounded bg-purple-50">
                    {propertyTypeLabel}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{listing.district}, {listing.city}</span>
                  </div>
                </div>

                <h3 className="font-heading text-lg font-bold text-foreground line-clamp-2 hover:text-primary transition-colors">
                  {listing.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Specs & Pricing */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-medium text-foreground">{listing.area} m²</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-medium text-foreground">{listing.bedrooms} PN</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-medium text-foreground">{listing.bathrooms} WC</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block text-right">Giá thuê</span>
                  <p className="font-heading text-lg font-bold text-primary">
                    {formatVND(listing.rentPrice)}
                    <span className="text-xs font-normal text-muted-foreground">/tháng</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid layout (default)
  return (
    <Link href={`/listings/${listing.id}`} className="block h-full">
      <Card interactive className="overflow-hidden h-full flex flex-col transition-all duration-200">
        <div className="aspect-16/10 relative overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <StatusBadge status={listing.status} />
            {listing.isFeatured && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500 text-white shadow-xs">
                Nổi bật
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs transition-colors hover:bg-white cursor-pointer shadow-xs",
              favorite ? "text-red-500" : "text-slate-600 hover:text-red-500"
            )}
            aria-label={favorite ? "Xóa khỏi danh sách yêu thích" : "Lưu vào yêu thích"}
          >
            <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
          </button>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span className="font-semibold text-primary px-2 py-0.5 rounded bg-purple-50">
                {propertyTypeLabel}
              </span>
              <div className="flex items-center gap-1 truncate max-w-[180px]">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{listing.district}, {listing.city}</span>
              </div>
            </div>

            <h3 className="font-heading text-base font-bold text-foreground line-clamp-2 hover:text-primary transition-colors">
              {listing.title}
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{listing.area} m²</span>
              <span>•</span>
              <span>{listing.bedrooms} PN</span>
              <span>•</span>
              <span>{listing.bathrooms} WC</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <span className="text-[11px] text-muted-foreground">Giá thuê</span>
                <p className="font-heading text-base font-bold text-primary leading-tight">
                  {formatVND(listing.rentPrice)}
                  <span className="text-xs font-normal text-muted-foreground">/tháng</span>
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Xác thực</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
