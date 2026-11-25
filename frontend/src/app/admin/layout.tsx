"use client";

import * as React from "react";
import Link from "next/link";
import { Home, ShieldCheck, Bell, LogOut, Menu } from "lucide-react";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { Sheet } from "@/components/ui/sheet";
import { RoleGuard } from "@/components/auth/role-guard";
import { useMockAuth } from "@/lib/auth/mock-auth";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useMockAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen flex flex-col bg-background">
        {/* Admin Top Bar */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-slate-900 text-white px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer shrink-0"
                aria-label="Mở menu quản trị"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/" className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="font-heading text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  HRental{" "}
                  <span className="text-amber-400 text-[10px] sm:text-xs uppercase px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 ml-1">
                    Admin Ops
                  </span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 text-sm shrink-0">
              <Link
                href="/"
                className="text-slate-400 hover:text-white transition-colors text-xs hidden sm:flex items-center gap-1"
              >
                <Home className="h-3.5 w-3.5" />
                Xem trang người dùng
              </Link>
              <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
              <button
                className="relative p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Thông báo hệ thống"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500" />
              </button>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/30">
                  AD
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-none">
                    {user?.name || "Nguyễn Văn Quản Trị"}
                  </span>
                  <span className="text-[10px] text-amber-400 mt-0.5">
                    {user?.email || "admin@houserental.vn"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Admin Body */}
        <div className="flex-1 flex w-full min-w-0">
          <div className="hidden md:block">
            <DashboardSidebar role="admin" />
          </div>
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Mobile Admin Drawer */}
        <Sheet
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          side="left"
          title="Trung Tâm Admin"
        >
          <DashboardSidebar
            role="admin"
            onNavigate={() => setMobileNavOpen(false)}
            className="w-full border-r-0 min-h-0 bg-transparent"
          />
        </Sheet>
      </div>
    </RoleGuard>
  );
}
