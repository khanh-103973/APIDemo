"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Listing } from "@/types";
import { formatVND } from "@/lib/format/currency";

export interface MockMapProps {
  listings: Listing[];
  selectedListingId?: string;
  onSelectListing?: (id: string) => void;
}

export function MockMap({
  listings,
  selectedListingId,
  onSelectListing,
}: MockMapProps) {
  const [activeId, setActiveId] = React.useState<string | undefined>(
    selectedListingId || listings[0]?.id
  );

  const activeListing = listings.find((l) => l.id === activeId) || listings[0];

  return (
    <div className="relative w-full h-[600px] rounded-lg border border-border overflow-hidden bg-slate-100 flex flex-col">
      {/* Map Mock Background Canvas with grid texture */}
      <div className="absolute inset-0 bg-[#e5e9f0] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-80" />

      {/* Mock Map UI Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-md border border-border shadow-xs text-xs font-medium text-slate-700">
        <Navigation className="h-3.5 w-3.5 text-primary" />
        <span>Khu vực TP. Hồ Chí Minh (Chế độ mô phỏng bản đồ)</span>
      </div>

      {/* Pins on the Map */}
      <div className="relative flex-1 w-full h-full">
        {listings.map((l, index) => {
          const isSelected = l.id === activeId;
          // Deterministic pin positions for realistic mock distribution
          const topPercent = 25 + (index * 16) % 55;
          const leftPercent = 20 + (index * 22) % 65;

          return (
            <div
              key={l.id}
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
              onClick={() => {
                setActiveId(l.id);
                if (onSelectListing) onSelectListing(l.id);
              }}
            >
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 shadow-md ${
                  isSelected
                    ? "bg-primary text-primary-foreground scale-110 ring-4 ring-primary/30 z-30"
                    : "bg-white text-slate-800 hover:bg-slate-50 border border-slate-300"
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{formatVND(l.rentPrice).replace(" ₫", "đ")}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Pin Floating Card */}
      {activeListing && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 bg-white p-3.5 rounded-lg border border-border shadow-lg animate-in fade-in-50 slide-in-from-bottom-2 duration-150">
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeListing.images[0]}
                alt={activeListing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-purple-50">
                {activeListing.district}
              </span>
              <h4 className="font-heading text-xs font-bold text-foreground truncate mt-1">
                {activeListing.title}
              </h4>
              <p className="font-heading text-sm font-bold text-primary mt-1">
                {formatVND(activeListing.rentPrice)}
                <span className="text-[10px] font-normal text-muted-foreground">/tháng</span>
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{activeListing.area} m²</span>
                <Link
                  href={`/listings/${activeListing.id}`}
                  className="font-semibold text-accent hover:underline flex items-center gap-1"
                >
                  Xem chi tiết <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
