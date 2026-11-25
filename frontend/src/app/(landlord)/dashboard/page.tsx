"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  DoorOpen,
  CalendarCheck,
  Receipt,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ExternalLink,
  Eye,
  AlertCircle,
  Home,
  Check,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatVND } from "@/lib/format/currency";
import {
  getLandlordStats,
  getLandlordListings,
  fetchLandlordListingsFromApi,
  getLandlordViewings,
  updateViewingStatus,
  LandlordStats,
} from "@/lib/api/landlord";
import { getViewingRequests } from "@/lib/api/viewings";
import { Listing, ViewingRequest } from "@/types";
import { useMockAuth, getAllUsers } from "@/lib/auth/mock-auth";
import { mockUsers } from "@/mocks/users";

export default function LandlordDashboardPage() {
  const { user } = useMockAuth();
  const [stats, setStats] = React.useState<LandlordStats>({
    occupancyRate: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    monthlyRevenue: 0,
    revenueGrowth: 8.2,
    pendingViewingsCount: 0,
    unpaidInvoicesCount: 0,
    unpaidInvoicesAmount: 0,
  });
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [viewings, setViewings] = React.useState<ViewingRequest[]>([]);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const handleSync = () => {
      setStats(getLandlordStats());
      setListings(getLandlordListings());
      setViewings(getLandlordViewings());
    };
    handleSync();
    void Promise.all([fetchLandlordListingsFromApi(), getViewingRequests()]).then(
      ([apiListings, apiViewings]) => {
        if (!active) return;
        if (apiListings.length > 0) setListings(apiListings);
        if (apiViewings.length > 0) setViewings(apiViewings);
        const total = apiListings.length;
        const rented = apiListings.filter((l) => l.status === "rented").length;
        const available = Math.max(0, total - rented);
        const pending = apiViewings.filter((v) => v.status === "pending").length;
        if (total > 0) {
          setStats((prev) => ({
            ...prev,
            totalRooms: total,
            occupiedRooms: rented,
            availableRooms: available,
            occupancyRate: Math.round((rented / total) * 1000) / 10,
            pendingViewingsCount: pending,
          }));
        }
      }
    );
    window.addEventListener("house_rental_viewings_change", handleSync);
    window.addEventListener("house_rental_listings_change", handleSync);
    window.addEventListener("house_rental_invoices_change", handleSync);
    return () => {
      active = false;
      window.removeEventListener("house_rental_viewings_change", handleSync);
      window.removeEventListener("house_rental_listings_change", handleSync);
      window.removeEventListener("house_rental_invoices_change", handleSync);
    };
  }, []);

  const pendingViewings = viewings.filter((v) => v.status === "pending");

  const handleConfirmViewing = (id: string) => {
    const updated = updateViewingStatus(id, "confirmed", "Đã xác nhận lịch hẹn. Hẹn gặp bạn đúng giờ!");
    setViewings(updated);
    setStats(getLandlordStats());
    setActionMessage("Đã xác nhận lịch hẹn xem phòng thành công!");
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleRejectViewing = (id: string) => {
    const updated = updateViewingStatus(id, "rejected", "Chủ nhà bận vào khung giờ này, vui lòng chọn giờ khác.");
    setViewings(updated);
    setStats(getLandlordStats());
    setActionMessage("Đã từ chối lịch hẹn xem phòng.");
    setTimeout(() => setActionMessage(null), 3500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Bảng Điều Khiển Quản Lý
            </h1>
            <span className="bg-purple-100 text-purple-700 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-purple-200">
              Chủ nhà đã xác minh
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Chào mừng trở lại, <strong className="text-foreground">{user?.fullName || "Chủ nhà"}</strong>. Hệ thống phòng trọ của bạn đang hoạt động ổn định.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/listings/new">
            <Button variant="accent" className="gap-2 shadow-xs cursor-pointer">
              <PlusCircle className="h-4 w-4" />
              Đăng tin cho thuê mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Action notification toast */}
      {actionMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* 4 Operational KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Occupancy Rate */}
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tỷ lệ lấp đầy phòng
              </span>
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <DoorOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-foreground">
                {stats.occupancyRate}%
              </span>
              <span className="text-xs font-medium text-emerald-700 flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                Mức tối ưu
              </span>
            </div>
            <div className="mt-3">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1.5">
                <span>{stats.occupiedRooms} phòng đang ở</span>
                <span>{stats.availableRooms} phòng trống</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Total Monthly Revenue */}
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Doanh thu tháng 03/2026
              </span>
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold text-foreground">
                {formatVND(stats.monthlyRevenue)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span className="text-emerald-700 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +{stats.revenueGrowth}%
              </span>
              <span>so với tháng 02/2026</span>
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Pending Viewing Requests */}
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lịch hẹn xem phòng
              </span>
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <CalendarCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-foreground">
                {pendingViewings.length}
              </span>
              <span className="text-xs text-amber-700 font-medium">chờ xác nhận</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {pendingViewings.length > 0 ? "Cần phản hồi sớm cho khách thuê" : "Đã xử lý tất cả lịch hẹn"}
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Unpaid Invoices */}
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hóa đơn chưa thu
              </span>
              <div className="p-2 rounded-lg bg-red-100 text-red-700">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold text-foreground">
                {formatVND(stats.unpaidInvoicesAmount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong className="text-foreground">{stats.unpaidInvoicesCount}</strong> hóa đơn kỳ tháng 04/2026
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Operational Shortcuts Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Tác vụ vận hành nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/dashboard/listings/new"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <PlusCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Đăng tin mới</p>
              <p className="text-[11px] text-muted-foreground">Tạo tin cho thuê</p>
            </div>
          </Link>

          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="p-2 rounded-md bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Hóa đơn & Thu phí</p>
              <p className="text-[11px] text-muted-foreground">Thu tiền phòng, điện nước</p>
            </div>
          </Link>

          <Link
            href="/dashboard/properties"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Bất động sản</p>
              <p className="text-[11px] text-muted-foreground">Quản lý 2 tòa nhà</p>
            </div>
          </Link>

          <Link
            href="/dashboard/rooms"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="p-2 rounded-md bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <DoorOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Danh sách phòng</p>
              <p className="text-[11px] text-muted-foreground">Sơ đồ 16 phòng trọ</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Left 2/3 Content, Right 1/3 Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Pending Viewing Requests */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Lịch Hẹn Xem Phòng Cần Phản Hồi
                </CardTitle>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                {pendingViewings.length} yêu cầu
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {pendingViewings.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  Bạn đã phản hồi tất cả lịch hẹn xem phòng.
                </div>
              ) : (
                pendingViewings.map((viewing) => {
                  const listing = listings.find((l) => l.id === viewing.listingId);
                  const allKnownUsers = getAllUsers();
                  const tenant =
                    allKnownUsers.find((u) => u.id === viewing.tenantId) ||
                    mockUsers.find((u) => u.id === viewing.tenantId) || {
                      fullName: "Nguyễn Văn Khang",
                      phoneNumber: "0912 345 678",
                    };
                  return (
                    <div
                      key={viewing.id}
                      className="p-4 rounded-lg border border-border bg-background hover:border-border-focus transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-sm">
                            Khách thuê: {tenant.fullName || (tenant as any).name || "Khách thuê"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            (SĐT: {tenant.phoneNumber || (tenant as any).phone || "0912 345 678"})
                          </span>
                          <StatusBadge status={viewing.status} size="sm" />
                        </div>
                        <p className="text-xs text-foreground font-medium flex items-center gap-1.5">
                          <Home className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{listing?.title || "Phòng Trọ D2 Bình Thạnh"}</span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {viewing.preferredDate} — {viewing.preferredTimeSlot}
                          </span>
                        </p>
                        {viewing.tenantNote && (
                          <p className="text-xs italic text-muted-foreground bg-muted/60 p-2 rounded border border-border/50">
                            &ldquo;{viewing.tenantNote}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="accent"
                          className="gap-1 cursor-pointer"
                          onClick={() => handleConfirmViewing(viewing.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Xác nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-danger hover:bg-danger-subtle cursor-pointer"
                          onClick={() => handleRejectViewing(viewing.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Section: Active Listings Overview */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Tin Đăng Cho Thuê Gần Đây
                </CardTitle>
              </div>
              <Link
                href="/dashboard/listings"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Xem tất cả ({listings.length})
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {listings.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-18 rounded-md overflow-hidden bg-slate-200 shrink-0 border border-border">
                      {item.images[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                          No img
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground line-clamp-1 hover:text-primary">
                        <Link href={`/listings/${item.id}`}>{item.title}</Link>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.address}, {item.district}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="font-bold text-primary">
                          {formatVND(item.rentPrice)}/tháng
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.viewsCount} lượt xem
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={item.status} size="sm" />
                    <Link href={`/listings/${item.id}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Xem trên web">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Invoices Status Mini Card */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                <span>Thu phí tháng 04/2026</span>
                <span className="text-xs font-normal text-muted-foreground">Kỳ hiện tại</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Đã thu (Tháng 3)</span>
                  <span className="font-semibold text-emerald-700">62.500.000 ₫ (100%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Đang chờ thu (Tháng 4)</span>
                  <span className="font-semibold text-amber-700">6.180.000 ₫</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[45%]" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Hạn nộp: <strong className="text-foreground">05/04/2026</strong> (còn 10 ngày)
                </p>
              </div>

              <div className="pt-2">
                <Link href="/dashboard/invoices">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Xem tất cả hóa đơn & ghi nhận
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground">
                Nhật Ký Hoạt Động Vận Hành
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                {/* Event 1 */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-600 border-2 border-background" />
                  <p className="text-xs font-semibold text-foreground">
                    Nguyễn Văn Khang đã thanh toán hóa đơn
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hóa đơn INV-202603-001 (6.250.000 ₫) qua chuyển khoản VCB.
                  </p>
                  <span className="text-[10px] text-muted-foreground">04/03/2026 09:18</span>
                </div>

                {/* Event 2 */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-amber-500 border-2 border-background" />
                  <p className="text-xs font-semibold text-foreground">
                    Lịch hẹn xem phòng mới
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Lê Thị Mai đặt lịch xem Studio Đa Kao (10:00 ngày 05/03).
                  </p>
                  <span className="text-[10px] text-muted-foreground">03/03/2026 14:20</span>
                </div>

                {/* Event 3 */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background" />
                  <p className="text-xs font-semibold text-foreground">
                    Hợp đồng CT-1001 có hiệu lực
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Phòng 102 D2 Bình Thạnh - Thời hạn 12 tháng.
                  </p>
                  <span className="text-[10px] text-muted-foreground">01/03/2026 08:00</span>
                </div>

                {/* Event 4 */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-purple-600 border-2 border-background" />
                  <p className="text-xs font-semibold text-foreground">
                    Tin đăng đã được kiểm duyệt
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Ban quản trị đã duyệt xuất bản tin &ldquo;Studio Hiện Đại Phong Cách Bắc Âu&rdquo;.
                  </p>
                  <span className="text-[10px] text-muted-foreground">24/02/2026 16:45</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Help & Support Box */}
          <div className="p-4 rounded-xl border border-primary/20 bg-purple-50/50 text-xs space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Users className="h-4 w-4" />
              <span>Cần trợ giúp vận hành?</span>
            </div>
            <p className="text-muted-foreground">
              Đội ngũ hỗ trợ đối tác chủ nhà hoạt động 24/7. Hỗ trợ chụp ảnh 3D, soạn thảo hợp đồng và tư vấn giá thuê tối ưu.
            </p>
            <p className="font-semibold text-foreground">
              Hotline: <span className="text-primary">1900 8888</span> (Nhánh 2)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
