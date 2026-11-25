"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  Home,
  Check,
  XCircle,
  CheckCircle2,
  Phone,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAllListingsFromStorage } from "@/lib/api/landlord";
import { getViewingRequests, updateViewingStatusAsync } from "@/lib/api/viewings";
import { fetchAllHousesFromApi } from "@/lib/api/listings";
import { mockListings } from "@/mocks/listings";
import { mockUsers } from "@/mocks/users";
import { getAllUsers } from "@/lib/auth/mock-auth";
import { Listing, ViewingRequest, ViewingStatus } from "@/types";

export default function LandlordViewingsPage() {
  const [viewings, setViewings] = React.useState<ViewingRequest[]>([]);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [notice, setNotice] = React.useState<string | null>(null);

  const loadViewings = React.useCallback(async () => {
    const [houses, apiViewings] = await Promise.all([
      fetchAllHousesFromApi(),
      getViewingRequests(),
    ]);
    if (houses) setListings(houses);
    setViewings(apiViewings);
  }, []);

  React.useEffect(() => {
    let active = true;
    const sync = async () => {
      const [houses, apiViewings] = await Promise.all([
        fetchAllHousesFromApi(),
        getViewingRequests(),
      ]);
      if (!active) return;
      if (houses) setListings(houses);
      setViewings(apiViewings);
    };
    void sync();
    const handleSync = () => {
      void sync();
    };
    window.addEventListener("house_rental_viewings_change", handleSync);
    return () => {
      active = false;
      window.removeEventListener("house_rental_viewings_change", handleSync);
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleUpdate = async (item: ViewingRequest, status: ViewingStatus) => {
    const res = await updateViewingStatusAsync(item, status);
    if (!res.success) {
      showNotification(res.error || "Không thể cập nhật lịch hẹn.");
      return;
    }
    await loadViewings();
    showNotification(
      status === "confirmed"
        ? "Đã xác nhận lịch hẹn xem phòng!"
        : status === "completed"
        ? "Đã chốt thuê và gửi hợp đồng (Chờ khách thuê xác nhận ký)!"
        : "Đã hủy lịch hẹn (khách không thuê). Phòng vẫn giữ trạng thái còn trống."
    );
  };

  const filtered = viewings.filter((v) => {
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Quản Lý Lịch Hẹn Xem Phòng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi và phản hồi các yêu cầu đặt lịch xem phòng trực tiếp từ khách thuê tiềm năng.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm scrollbar-none">
        {[
          { key: "all", label: "Tất cả" },
          { key: "pending", label: "Chờ xác nhận" },
          { key: "confirmed", label: "Đã xác nhận" },
          { key: "completed", label: "Đã hoàn thành" },
          { key: "rejected", label: "Đã từ chối" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
              statusFilter === tab.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-surface text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Viewings List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const allListings = listings.length > 0 ? listings : getAllListingsFromStorage();
          const allUsers = getAllUsers();
          const listing = allListings.find((l) => l.id === item.listingId) || mockListings.find((l) => l.id === item.listingId);
          const tenant: {
            name?: string;
            fullName?: string;
            phone?: string;
            phoneNumber?: string;
          } = allUsers.find((u) => u.id === item.tenantId) || mockUsers.find((u) => u.id === item.tenantId) || {
            fullName: "Khách thuê",
            phoneNumber: "0912 345 678",
          };

          return (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-border bg-surface hover:border-border-focus transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary" />
                    {tenant.fullName || tenant.name || "Khách thuê"}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {tenant.phoneNumber || tenant.phone || "0912 345 678"}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <p className="text-xs text-foreground font-semibold flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{listing?.title || "Phòng Trọ Cho Thuê"}</span>
                </p>

                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    Ngày hẹn: <strong>{item.preferredDate}</strong> ({item.preferredTimeSlot})
                  </span>
                </p>

                {item.tenantNote && (
                  <p className="text-xs italic text-muted-foreground bg-muted/60 p-2.5 rounded-md border border-border/50 max-w-xl">
                    &ldquo;{item.tenantNote}&rdquo;
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {item.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      className="gap-1 cursor-pointer text-xs"
                      onClick={() => void handleUpdate(item, "confirmed")}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Xác nhận hẹn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-danger hover:bg-danger-subtle cursor-pointer text-xs"
                      onClick={() => void handleUpdate(item, "rejected")}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Từ chối
                    </Button>
                  </>
                )}

                {item.status === "confirmed" && (
                  <>
                    <Button
                      size="sm"
                      variant="accent"
                      className="gap-1 cursor-pointer text-xs"
                      onClick={() => void handleUpdate(item, "completed")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Chốt thuê & gửi hợp đồng
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-danger hover:bg-danger-subtle cursor-pointer text-xs"
                      onClick={() => void handleUpdate(item, "rejected")}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Xem xong — Không thuê
                    </Button>
                  </>
                )}

                {item.status === "completed" && (
                  <Link href="/dashboard/contracts">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 cursor-pointer text-xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Xem hợp đồng
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
