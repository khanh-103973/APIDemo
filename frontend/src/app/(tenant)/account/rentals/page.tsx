"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  KeyRound,
  MapPin,
  Receipt,
  FileText,
  Wrench,
  Calendar,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatVND } from "@/lib/format/currency";
import { getContracts } from "@/lib/api/contracts";
import { getViewingRequests } from "@/lib/api/viewings";
import { fetchAllHousesFromApi } from "@/lib/api/listings";
import { Contract, Listing, ViewingRequest } from "@/types";

export default function TenantRentalsPage() {
  const [contracts, setContracts] = React.useState<Contract[]>([]);
  const [bookings, setBookings] = React.useState<ViewingRequest[]>([]);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let active = true;
    void Promise.all([
      getContracts(),
      getViewingRequests(),
      fetchAllHousesFromApi(),
    ])
      .then(([apiContracts, apiBookings, apiHouses]) => {
        if (!active) return;
        setContracts(apiContracts);
        setBookings(apiBookings);
        if (apiHouses) setListings(apiHouses);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeContract =
    contracts.find((c) => c.status === "active") || null;
  const pendingContract =
    contracts.find((c) => c.status === "pending") || null;
  const bookingIdNum = activeContract
    ? activeContract.propertyId.replace("booking_", "")
    : "";
  const matchedBooking = bookings.find((b) => b.id === `bk_${bookingIdNum}`);
  const house = matchedBooking
    ? listings.find((l) => l.id === matchedBooking.listingId)
    : undefined;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Phòng Đang Thuê Của Bạn
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thông tin chi tiết căn phòng hiện tại, hợp đồng cư trú và các tiện ích sinh hoạt từ SQL Server.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-surface rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">
          Đang tải thông tin phòng đang thuê...
        </div>
      ) : !activeContract ? (
        <EmptyState
          icon={KeyRound}
          title={
            pendingContract
              ? `Bạn có hợp đồng ${pendingContract.contractNumber} đang chờ xác nhận ký`
              : "Bạn chưa có phòng đang thuê"
          }
          description={
            pendingContract
              ? "Vui lòng vào mục Hợp đồng của tôi để kiểm tra giá thuê/tiền cọc và bấm 'Đồng ý & Ký hợp đồng' để kích hoạt cư trú."
              : "Khi bạn đặt lịch xem phòng, chủ nhà gửi hợp đồng và bạn xác nhận ký, thông tin phòng đang cư trú sẽ xuất hiện tại đây."
          }
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="relative h-72 sm:h-64 w-full bg-slate-200">
            <Image
              src={
                house?.images[0] ||
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80"
              }
              alt={house?.title || "Phòng đang thuê"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 960px"
              className="object-cover"
            />
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                ĐANG CƯ TRÚ
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10 bg-black/65 backdrop-blur-xs text-white p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-heading text-base sm:text-lg font-bold truncate">
                  {house?.title || `Hợp đồng ${activeContract.contractNumber}`}
                </h2>
                <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {house
                      ? [house.address, house.district, house.city].filter(Boolean).join(", ")
                      : activeContract.terms}
                  </span>
                </p>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="font-extrabold text-base sm:text-lg text-emerald-400">
                  {formatVND(activeContract.monthlyRent)}
                </span>
                <span className="text-xs text-slate-300">/tháng</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-background">
                <span className="text-muted-foreground">Diện tích phòng</span>
                <p className="font-bold text-foreground text-sm mt-1">
                  {house?.area || 28} m²
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background">
                <span className="text-muted-foreground">Tiền cọc phòng</span>
                <p className="font-bold text-foreground text-sm mt-1">
                  {formatVND(activeContract.deposit)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Thời hạn hợp đồng
                </span>
                <p className="font-semibold text-foreground text-xs mt-1">
                  {activeContract.startDate} - {activeContract.endDate}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background">
                <span className="text-muted-foreground">Mã hợp đồng</span>
                <p className="font-bold text-primary text-sm mt-1">
                  {activeContract.contractNumber}
                </p>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link
                href="/account/invoices"
                className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">Hóa đơn tháng này</p>
                  <p className="text-[11px] text-muted-foreground">Xem chi tiết tiền điện nước</p>
                </div>
              </Link>

              <Link
                href="/account/contracts"
                className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">Hợp đồng điện tử</p>
                  <p className="text-[11px] text-muted-foreground">
                    Số HĐ: {activeContract.contractNumber}
                  </p>
                </div>
              </Link>

              <Link
                href="/account/issues"
                className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">Báo hỏng & Sửa chữa</p>
                  <p className="text-[11px] text-muted-foreground">Gửi yêu cầu thợ sửa thiết bị</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
