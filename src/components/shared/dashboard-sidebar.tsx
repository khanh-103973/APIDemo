"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  { title: "Tin đã lưu", href: "/account/favorites", icon: Heart },
  { title: "Lịch hẹn xem phòng", href: "/account/viewings", icon: CalendarCheck, badge: "1" },
  { title: "Phòng đang thuê", href: "/account/rentals", icon: KeyRound },
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

  const navItems =
    role === "landlord"
      ? landlordNav
      : role === "tenant"
      ? tenantNav
      : adminNav;

  const roleTitles = {
    landlord: {
      name: "Khu vực Chủ nhà",
      tag: "Quản trị vận hành",
      badgeClass: "bg-purple-100 text-purple-700",
    },
    tenant: {
      name: "Tài khoản Khách thuê",
      tag: "Dịch vụ phòng thuê",
      badgeClass: "bg-emerald-100 text-emerald-700",
    },
    admin: {
      name: "Hệ thống Admin",
      tag: "Quản trị nền tảng",
      badgeClass: "bg-amber-100 text-amber-800",
    },
  };

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col h-full min-h-[calc(100vh-4rem)]">
      {/* Header Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm font-bold text-foreground">
            {roleTitles[role].name}
          </span>
          <span
            className={cn(
              "px-2 py-0.5 text-[11px] font-semibold rounded-[4px]",
              roleTitles[role].badgeClass
            )}
          >
            {role.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
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
                "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-slate-200/60 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                    isActive
                      ? "bg-white text-primary"
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

      {/* Footer Switcher */}
      <div className="p-3 border-t border-border bg-background/50 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Chuyển vai trò thử nghiệm:</p>
        <div className="grid grid-cols-3 gap-1">
          <Link
            href="/account/favorites"
            className={cn(
              "px-1.5 py-1 text-center rounded border",
              role === "tenant" ? "bg-muted font-bold text-foreground border-slate-300" : "hover:bg-muted"
            )}
          >
            Khách
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "px-1.5 py-1 text-center rounded border",
              role === "landlord" ? "bg-muted font-bold text-foreground border-slate-300" : "hover:bg-muted"
            )}
          >
            Chủ nhà
          </Link>
          <Link
            href="/admin"
            className={cn(
              "px-1.5 py-1 text-center rounded border",
              role === "admin" ? "bg-muted font-bold text-foreground border-slate-300" : "hover:bg-muted"
            )}
          >
            Admin
          </Link>
        </div>
      </div>
    </aside>
  );
}
