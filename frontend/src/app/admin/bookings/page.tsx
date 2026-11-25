"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  Home,
  User as UserIcon,
  Phone,
  Mail,
  Check,
  XCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getViewingRequests, updateViewingStatusAsync } from "@/lib/api/viewings";
import { fetchAllHousesFromApi } from "@/lib/api/listings";
import { fetchAdminUsersFromApi } from "@/lib/api/admin";
import { Listing, User, ViewingRequest, ViewingStatus } from "@/types";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = React.useState<ViewingRequest[]>([]);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [apiBookings, apiHouses, apiUsers] = await Promise.all([
        getViewingRequests(),
        fetchAllHousesFromApi(),
        fetchAdminUsersFromApi(),
      ]);
      setBookings(apiBookings);
      if (apiHouses) setListings(apiHouses);
      if (apiUsers) setUsers(apiUsers);
    } catch {
      setErrorMsg("Không thể tải danh sách lịch hẹn từ Backend API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    void Promise.all([
      getViewingRequests(),
      fetchAllHousesFromApi(),
      fetchAdminUsersFromApi(),
    ])
      .then(([apiBookings, apiHouses, apiUsers]) => {
        if (!active) return;
        setBookings(apiBookings);
        if (apiHouses) setListings(apiHouses);
        if (apiUsers) setUsers(apiUsers);
      })
      .catch(() => {
        if (active) setErrorMsg("Không thể tải danh sách lịch hẹn từ Backend API.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleUpdateStatus = async (booking: ViewingRequest, nextStatus: ViewingStatus) => {
    setBusyId(booking.id);
    setErrorMsg(null);
    const res = await updateViewingStatusAsync(booking, nextStatus);
    setBusyId(null);

    if (!res.success) {
      setErrorMsg(res.error || "Không thể cập nhật trạng thái lịch hẹn.");
      return;
    }

    setNotice(
      nextStatus === "confirmed"
        ? `Đã xác nhận lịch hẹn #${booking.id} thành công!`
        : nextStatus === "completed"
        ? `Đã đánh dấu hoàn thành lịch hẹn #${booking.id}!`
        : `Đã hủy/từ chối lịch hẹn #${booking.id}.`
    );
    setTimeout(() => setNotice(null), 3500);
    await loadData();
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Quản Lý Lịch Hẹn Xem Phòng (Bookings)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Toàn bộ yêu cầu đặt lịch xem phòng/thuê nhà từ SQL Server ({bookings.length} lịch hẹn, {pendingCount} chờ xác nhận).
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadData()}
          className="gap-1.5 cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới dữ liệu
        </Button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
        {[
          { key: "all", label: `Tất cả (${bookings.length})` },
          { key: "pending", label: `Chờ xác nhận (${pendingCount})` },
          {
            key: "confirmed",
            label: `Đã xác nhận (${bookings.filter((b) => b.status === "confirmed").length})`,
          },
          {
            key: "completed",
            label: `Hoàn thành (${bookings.filter((b) => b.status === "completed").length})`,
          },
          {
            key: "cancelled",
            label: `Đã hủy (${bookings.filter((b) => b.status === "cancelled" || b.status === "rejected").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
              statusFilter === tab.key
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
          Đang tải danh sách lịch hẹn từ SQL Server...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Chưa có lịch hẹn nào trong mục này"
          description="Khi khách thuê đặt lịch xem phòng trên các tin đăng Đà Nẵng, dữ liệu sẽ tự động hiển thị tại đây."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const listing = listings.find((l) => l.id === item.listingId);
            const tenant = users.find((u) => u.id === item.tenantId);

            return (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-border bg-white hover:border-primary/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-primary bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      #{item.id}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                    <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <UserIcon className="h-4 w-4 text-primary" />
                      {tenant?.fullName || tenant?.name || `Khách thuê #${item.tenantId}`}
                    </span>
                    {tenant?.email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {tenant.email}
                      </span>
                    )}
                    {tenant?.phone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {tenant.phone}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Home className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      {listing?.title || `Nhà cho thuê (${item.listingId})`}
                    </span>
                    {listing && (
                      <Link
                        href={`/listings/${listing.id}`}
                        target="_blank"
                        className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        Xem phòng <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  {listing && (
                    <p className="text-xs text-muted-foreground">
                      Địa chỉ: {[listing.address, listing.district, listing.city].filter(Boolean).join(", ")}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Ngày bắt đầu / xem phòng: <strong>{item.preferredDate}</strong> ({item.preferredTimeSlot})
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  {item.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={busyId === item.id}
                        onClick={() => void handleUpdateStatus(item, "confirmed")}
                        className="gap-1 text-xs cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Duyệt lịch hẹn
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id}
                        onClick={() => void handleUpdateStatus(item, "cancelled")}
                        className="gap-1 text-xs text-danger hover:bg-danger-subtle cursor-pointer"
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
                      disabled={busyId === item.id}
                      onClick={() => void handleUpdateStatus(item, "completed")}
                      className="gap-1 text-xs cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Đánh dấu hoàn thành
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
