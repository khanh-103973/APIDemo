"use client";

import * as React from "react";
import {
  Clock,
  Home,
  Check,
  XCircle,
  CheckCircle2,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getLandlordViewings, updateViewingStatus, getAllListingsFromStorage } from "@/lib/api/landlord";
import { mockListings } from "@/mocks/listings";
import { mockUsers } from "@/mocks/users";
import { getAllUsers } from "@/lib/auth/mock-auth";
import { ViewingRequest, ViewingStatus } from "@/types";

export default function LandlordViewingsPage() {
  const [viewings, setViewings] = React.useState<ViewingRequest[]>(getLandlordViewings);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleSync = () => {
      setViewings(getLandlordViewings());
    };
    window.addEventListener("house_rental_viewings_change", handleSync);
    return () => window.removeEventListener("house_rental_viewings_change", handleSync);
  }, []);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleUpdate = (id: string, status: ViewingStatus) => {
    const updated = updateViewingStatus(
      id,
      status,
      status === "confirmed"
        ? "Đã xác nhận lịch hẹn. Hẹn gặp bạn tại phòng đúng giờ!"
        : "Chủ nhà bận khung giờ này."
    );
    setViewings(updated);
    showNotification(
      status === "confirmed"
        ? "Đã xác nhận lịch hẹn xem phòng!"
        : status === "completed"
        ? "Đã đánh dấu hoàn thành xem phòng!"
        : "Đã từ chối lịch hẹn."
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
          const allListings = getAllListingsFromStorage();
          const allUsers = getAllUsers();
          const listing = allListings.find((l) => l.id === item.listingId) || mockListings.find((l) => l.id === item.listingId);
          const tenant = allUsers.find((u) => u.id === item.tenantId) || mockUsers.find((u) => u.id === item.tenantId) || {
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
                    {tenant.fullName || (tenant as any).name || "Khách thuê"}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {tenant.phoneNumber || (tenant as any).phone || "0912 345 678"}
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
                      onClick={() => handleUpdate(item.id, "confirmed")}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Xác nhận hẹn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-danger hover:bg-danger-subtle cursor-pointer text-xs"
                      onClick={() => handleUpdate(item.id, "rejected")}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Từ chối
                    </Button>
                  </>
                )}

                {item.status === "confirmed" && (
                  <Button
                    size="sm"
                    variant="accent"
                    className="gap-1 cursor-pointer text-xs"
                    onClick={() => handleUpdate(item.id, "completed")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đánh dấu đã xem xong
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
