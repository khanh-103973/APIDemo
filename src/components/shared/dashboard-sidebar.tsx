"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  DoorOpen,
  FileText,
  Receipt,
  CalendarCheck,
  Wrench,
  User,
  Heart,
  KeyRound,
  ShieldCheck,
  Users,
  ClipboardList,
  AlertTriangle,
  History,
  Home,
  PlusCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockAuth } from "@/lib/auth/mock-auth";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string | number;
}

interface DashboardSidebarProps {
  role: "landlord" | "tenant" | "admin";
}

const landlordNav: NavItem[] = [
  { title: "Tổng quan", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Tin đăng cho thuê", href: "/dashboard/listings", icon: Building },
  { title: "Đăng tin mới", href: "/dashboard/listings/new", icon: PlusCircle },
  { title: "Lịch hẹn xem phòng", href: "/dashboard/viewings", icon: CalendarCheck, badge: "1" },
  { title: "Bất động sản", href: "/dashboard/properties", icon: Home },
  { title: "Danh sách phòng", href: "/dashboard/rooms", icon: DoorOpen },
  { title: "Quản lý khách thuê", href: "/dashboard/tenants", icon: Users },
  { title: "Hợp đồng thuê", href: "/dashboard/contracts", icon: FileText },
  { title: "Hóa đơn & Thu phí", href: "/dashboard/invoices", icon: Receipt, badge: "1" },
  { title: "Yêu cầu bảo trì", href: "/dashboard/maintenance", icon: Wrench, badge: "1" },
  { title: "Hồ sơ chủ nhà", href: "/dashboard/profile", icon: User },
];

const tenantNav: NavItem[] = [
  { title: "Phòng đang thuê", href: "/account/rentals", icon: KeyRound },
  { title: "Tin đã lưu", href: "/account/favorites", icon: Heart },
  { title: "Lịch hẹn xem phòng", href: "/account/viewings", icon: CalendarCheck, badge: "1" },
  { title: "Hợp đồng của tôi", href: "/account/contracts", icon: FileText },
  { title: "Hóa đơn thanh toán", href: "/account/invoices", icon: Receipt, badge: "1" },
  { title: "Báo cáo sự cố", href: "/account/issues", icon: Wrench },
  { title: "Hồ sơ cá nhân", href: "/account/profile", icon: User },
];

const adminNav: NavItem[] = [
  { title: "Tổng quan", href: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Quản lý tài khoản", href: "/admin/users", icon: Users },
  { title: "Tất cả tin đăng", href: "/admin/listings", icon: Building, exact: true },
  { title: "Hàng đợi kiểm duyệt", href: "/admin/listings/pending", icon: ClipboardList, badge: "1" },
  { title: "Duyệt xác thực chủ nhà", href: "/admin/verifications", icon: ShieldCheck },
  { title: "Báo cáo vi phạm", href: "/admin/reports", icon: AlertTriangle },
  { title: "Nhật ký hoạt động", href: "/admin/activity-logs", icon: History },
];

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useMockAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems =
    role === "landlord"
      ? landlordNav
      : role === "tenant"
      ? tenantNav
      : adminNav;

  const roleTitles = {
    landlord: {
      name: "Khu vực Chủ nhà",
      tag: "Quản trị vận hành bất động sản",
      badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
      accentBg: "bg-primary text-primary-foreground",
      icon: Building,
    },
    tenant: {
      name: "Cổng Khách thuê",
      tag: "Dịch vụ phòng thuê & tiện ích",
      badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
      accentBg: "bg-emerald-600 text-white",
      icon: KeyRound,
    },
    admin: {
      name: "Trung Tâm Admin",
      tag: "Quản trị & Giám sát hệ thống",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      accentBg: "bg-slate-900 text-white",
      icon: ShieldCheck,
    },
  };

  const CurrentRoleIcon = roleTitles[role].icon;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface/80 backdrop-blur-xs flex flex-col h-full min-h-[calc(100vh-4rem)]">
      {/* Header Info */}
      <div className="p-4 border-b border-border bg-white/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 text-foreground">
              <CurrentRoleIcon className="h-4 w-4" />
            </div>
            <span className="font-heading text-sm font-bold text-foreground">
              {roleTitles[role].name}
            </span>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 text-[10px] font-bold rounded-full border",
              roleTitles[role].badgeClass
            )}
          >
            {role.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {roleTitles[role].tag}
        </p>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer",
                isActive
                  ? `${roleTitles[role].accentBg} font-semibold shadow-xs`
                  : "text-slate-600 hover:bg-slate-100 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-current" : "text-muted-foreground"
                  )}
                />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                    isActive
                      ? "bg-white text-slate-900"
                      : "bg-warning-subtle text-warning-subtle-foreground border border-warning-border"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Authenticated User Session Info & Logout */}
      <div className="p-3 border-t border-border bg-white/70">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "HR"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">
                {user?.name || "Tài khoản"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email || "chưa xác định"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
            title="Đăng xuất tài khoản"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
