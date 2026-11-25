"use client";

import Link from "next/link";
import { Home, ShieldCheck, Bell, LogOut } from "lucide-react";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen flex flex-col bg-background">
        {/* Admin Top Bar */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-slate-900 text-white px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="font-heading text-lg font-bold text-white tracking-tight">
                  HRental <span className="text-amber-400 text-xs uppercase px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 ml-1">Admin Ops</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4 text-sm">
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
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Admin Body */}
        <div className="flex-1 flex w-full">
          <div className="hidden md:block">
            <DashboardSidebar role="admin" />
          </div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
