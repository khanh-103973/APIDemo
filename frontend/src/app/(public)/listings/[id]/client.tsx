"use client";

import * as React from "react";
import { Calendar, Phone, Heart, Share2, Check } from "lucide-react";
import { Listing } from "@/types";
import { Button } from "@/components/ui/button";
import { ViewingModal } from "@/components/listing/viewing-modal";

export interface ListingDetailsClientProps {
  listing: Listing;
  phone: string;
}

export function ListingDetailsClient({
  listing,
  phone,
}: ListingDetailsClientProps) {
  const [viewingModalOpen, setViewingModalOpen] = React.useState(false);
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [copiedPhone, setCopiedPhone] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Primary CTA: Schedule viewing */}
      <Button
        variant="accent"
        size="lg"
        className="w-full gap-2 text-base font-bold shadow-md cursor-pointer"
        onClick={() => setViewingModalOpen(true)}
      >
        <Calendar className="h-5 w-5" />
        Đặt lịch xem phòng
      </Button>

      {/* Secondary CTA: Call Landlord */}
      <Button
        variant="outline"
        size="md"
        className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
        onClick={handleCopyPhone}
      >
        {copiedPhone ? (
          <>
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 font-semibold">Đã sao chép: {phone}</span>
          </>
        ) : (
          <>
            <Phone className="h-4 w-4" />
            <span>Gọi chủ nhà: {phone}</span>
          </>
        )}
      </Button>

      {/* Auxiliary actions: Favorite & Share */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setIsFavorited(!isFavorited)}
        >
          <Heart
            className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
          />
          {isFavorited ? "Đã lưu tin" : "Lưu tin này"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={handleShare}
        >
          {copiedLink ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Đã chép link</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Chia sẻ</span>
            </>
          )}
        </Button>
      </div>

      {/* Viewing Modal */}
      <ViewingModal
        listing={listing}
        open={viewingModalOpen}
        onOpenChange={setViewingModalOpen}
      />
    </div>
  );
}
