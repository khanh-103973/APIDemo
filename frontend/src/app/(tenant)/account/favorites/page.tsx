"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Trash2, Calendar, MapPin, Search } from "lucide-react";
import { Listing } from "@/types";
import { getMockFavorites, toggleMockFavorite } from "@/lib/auth/mock-auth";
import { fetchAllHousesFromApi } from "@/lib/api/listings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatVND } from "@/lib/format/currency";
import { ViewingModal } from "@/components/listing/viewing-modal";

export default function TenantFavoritesPage() {
  const router = useRouter();
  const [allListings, setAllListings] = React.useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([]);
  const [selectedViewingListing, setSelectedViewingListing] = React.useState<Listing | null>(null);

  React.useEffect(() => {
    let active = true;
    void fetchAllHousesFromApi().then((houses) => {
      if (!active) return;
      setFavoriteIds(getMockFavorites());
      if (houses) {
        setAllListings(houses.filter((h) => h.status !== "pending" && h.status !== "rejected"));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const favorites = allListings.filter((l) => favoriteIds.includes(l.id));

  const handleRemoveFavorite = (id: string) => {
    const next = toggleMockFavorite(id);
    setFavoriteIds(next);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Danh sách tin đã lưu
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý các phòng trọ và căn hộ bạn đang quan tâm ({favorites.length} tin)
          </p>
        </div>

        <Link href="/listings">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Search className="h-4 w-4" />
            Tìm thêm phòng
          </Button>
        </Link>
      </div>

      {/* Favorites Content */}
      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Chưa có tin đăng nào được lưu"
          description="Khi xem danh sách phòng, bạn có thể nhấn vào biểu tượng trái tim để lưu lại và so sánh tại đây."
          actionLabel="Khám phá phòng thuê ngay"
          onAction={() => {
            router.push("/listings");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((listing) => (
            <Card key={listing.id} className="overflow-hidden flex flex-col justify-between">
              <div>
                <div className="aspect-16/9 relative overflow-hidden bg-muted">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={listing.status} />
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(listing.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-600 hover:bg-white shadow-xs transition-colors cursor-pointer"
                    title="Xóa khỏi danh sách yêu thích"
                    aria-label="Xóa khỏi yêu thích"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{listing.address}, {listing.district}</span>
                  </div>

                  <Link href={`/listings/${listing.id}`}>
                    <h3 className="font-heading text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                      {listing.title}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between pt-1">
                    <p className="font-heading text-lg font-bold text-primary">
                      {formatVND(listing.rentPrice)}
                      <span className="text-xs font-normal text-muted-foreground">/tháng</span>
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {listing.area} m² • {listing.bedrooms} PN
                    </span>
                  </div>
                </CardContent>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 border-t border-border mt-3 flex items-center justify-between gap-2">
                <Link href={`/listings/${listing.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Xem chi tiết
                  </Button>
                </Link>
                <Button
                  variant="accent"
                  size="sm"
                  className="gap-1.5 flex-1"
                  onClick={() => setSelectedViewingListing(listing)}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Đặt lịch xem
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Viewing Modal Trigger */}
      {selectedViewingListing && (
        <ViewingModal
          listing={selectedViewingListing}
          open={Boolean(selectedViewingListing)}
          onOpenChange={(open) => {
            if (!open) setSelectedViewingListing(null);
          }}
        />
      )}
    </div>
  );
}
