"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Building,
  ClipboardList,
  ShieldCheck,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatVND } from "@/lib/format/currency";
import {
  getAdminStats,
  fetchAdminStatsFromApi,
  getAdminListings,
  fetchAdminListingsFromApi,
  getAdminActivityLogs,
  moderateAdminListing,
} from "@/lib/api/admin";
import { Listing } from "@/types";

export default function AdminOverviewPage() {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    tenantsCount: 0,
    landlordsCount: 0,
    totalListings: 0,
    activeListings: 0,
    pendingModeration: 0,
    pendingVerifications: 0,
    pendingReports: 0,
    moderationSpeedHours: "1.8",
  });
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [logs, setLogs] = React.useState<ReturnType<typeof getAdminActivityLogs>>([]);
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setStats(getAdminStats());
    setListings(getAdminListings());
    setLogs(getAdminActivityLogs());
    void fetchAdminStatsFromApi().then((data) => {
      if (active) setStats(data);
    });
    void fetchAdminListingsFromApi().then((data) => {
      if (active && data.length > 0) setListings(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const pendingListings = listings.filter(
    (l) => l.moderationStatus === "pending" || l.status === "pending"
  );

  const handleQuickApprove = (id: string) => {
    const updated = moderateAdminListing(id, "approved", "Duyệt xuất bản tự động qua Admin Dashboard");
    setListings(updated);
    setStats(getAdminStats());
    setNotice("Đã phê duyệt tin đăng thành công! Tin hiện đã công khai trên sàn.");
    setTimeout(() => setNotice(null), 3500);
  };

  const handleQuickReject = (id: string) => {
    const updated = moderateAdminListing(id, "rejected", "Thông tin chưa đầy đủ hoặc không hợp lệ");
    setListings(updated);
    setStats(getAdminStats());
    setNotice("Đã từ chối tin đăng vi phạm.");
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Trung Tâm Điều Hành & Quản Trị Hệ Thống
            </h1>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Platform Admin
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Theo dõi lưu lượng sàn, hàng đợi kiểm duyệt tin đăng và mức độ an toàn giao dịch toàn quốc.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
              Tốc độ duyệt trung bình
            </span>
            <span className="font-heading text-base font-bold text-amber-400">
              {stats.moderationSpeedHours} giờ / tin
            </span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 4 Primary Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Users */}
        <Card className="border-border bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Người dùng hệ thống
              </span>
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-foreground">
                {stats.totalUsers}
              </span>
              <span className="text-xs text-muted-foreground">tài khoản</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/60">
              <span>{stats.landlordsCount} Chủ nhà</span>
              <span>•</span>
              <span>{stats.tenantsCount} Khách thuê</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Total Listings */}
        <Card className="border-border bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tin đăng trên sàn
              </span>
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <Building className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-foreground">
                {stats.totalListings}
              </span>
              <span className="text-xs text-emerald-700 font-medium">
                {stats.activeListings} đang mở
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/60">
              Bao phủ TP.HCM và Hà Nội
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Pending Moderation */}
        <Card className="border-border bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tin chờ kiểm duyệt
              </span>
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <ClipboardList className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-amber-600">
                {stats.pendingModeration}
              </span>
              <span className="text-xs text-amber-700 font-medium">yêu cầu mới</span>
            </div>
            <div className="mt-2 pt-2 border-t border-border/60">
              <Link
                href="/admin/listings/pending"
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Vào hàng đợi duyệt
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Pending Verifications & Reports */}
        <Card className="border-border bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Xác minh & Báo cáo
              </span>
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-foreground">
                {stats.pendingVerifications + stats.pendingReports}
              </span>
              <span className="text-xs text-purple-700 font-medium">chờ xử lý</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/60">
              <span>{stats.pendingVerifications} Xác thực CCCD</span>
              <span>•</span>
              <span>{stats.pendingReports} Báo cáo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/listings/pending"
          className="p-4 rounded-xl border border-border bg-white hover:border-primary/50 hover:bg-primary/5 transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Kiểm duyệt tin</p>
            <p className="text-[11px] text-muted-foreground">{stats.pendingModeration} tin đang chờ</p>
          </div>
        </Link>

        <Link
          href="/admin/verifications"
          className="p-4 rounded-xl border border-border bg-white hover:border-primary/50 hover:bg-primary/5 transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Duyệt xác thực</p>
            <p className="text-[11px] text-muted-foreground">{stats.pendingVerifications} hồ sơ chủ nhà</p>
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="p-4 rounded-xl border border-border bg-white hover:border-primary/50 hover:bg-primary/5 transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-lg bg-red-100 text-red-700 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Báo cáo vi phạm</p>
            <p className="text-[11px] text-muted-foreground">{stats.pendingReports} khiếu nại</p>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="p-4 rounded-xl border border-border bg-white hover:border-primary/50 hover:bg-primary/5 transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Quản lý tài khoản</p>
            <p className="text-[11px] text-muted-foreground">Phân quyền & khóa</p>
          </div>
        </Link>
      </div>

      {/* Main Two-Column Workflow Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Immediate Moderation Action Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base font-bold text-foreground">
                  Hàng Đợi Kiểm Duyệt Tin Đăng Cần Xử Lý
                </CardTitle>
              </div>
              <Link
                href="/admin/listings/pending"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Xem chi tiết
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {pendingListings.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  Tuyệt vời! Hiện không còn tin đăng nào trong hàng đợi kiểm duyệt.
                </div>
              ) : (
                pendingListings.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-border bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-border">
                        {item.images[0] && (
                          <Image
                            src={item.images[0]}
                            alt={item.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-foreground line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {item.address}, {item.district}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[11px]">
                          <span className="font-bold text-primary">
                            {formatVND(item.rentPrice)}/tháng
                          </span>
                          <span className="text-muted-foreground">{item.area} m²</span>
                          <StatusBadge status={item.status} size="sm" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleQuickApprove(item.id)}
                        className="h-8 text-xs gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Phê duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickReject(item.id)}
                        className="h-8 text-xs text-danger hover:bg-danger-subtle cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Audit Activity Log Timeline */}
        <div className="space-y-6">
          <Card className="border-border bg-white">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <History className="h-4 w-4 text-primary" />
                  Nhật Ký Kiểm Toán Gần Đây
                </CardTitle>
                <Link
                  href="/admin/activity-logs"
                  className="text-xs text-primary hover:underline"
                >
                  Tất cả
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                {logs.slice(0, 4).map((log) => (
                  <div key={log.id} className="relative">
                    <span className="absolute -left-5 top-1 h-3 w-3 rounded-full bg-primary border-2 border-white" />
                    <p className="text-xs font-semibold text-foreground">{log.action}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                      {log.details}
                    </p>
                    <span className="text-[10px] text-muted-foreground block mt-1">
                      {log.timestamp} • {log.userName}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
