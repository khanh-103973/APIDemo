"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Bell, PlusCircle, LogOut, Menu } from "lucide-react";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/role-guard";
import { useMockAuth } from "@/lib/auth/mock-auth";
import { useRouter } from "next/navigation";

export default function LandlordDashboardLayout({
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
    <RoleGuard requiredRole="landlord">
      <div className="min-h-screen flex flex-col bg-background">
        {/* Landlord Top Bar */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-white px-4 sm:px-6 shadow-xs">
          <div className="flex h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer shrink-0"
                aria-label="Mở menu chủ nhà"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/" className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <Home className="h-4 w-4" />
                </div>
                <span className="font-heading text-base sm:text-lg font-bold truncate">
                  House<span className="text-primary">Rental</span>
                </span>
              </Link>
              <div className="h-5 w-[1px] bg-border mx-1 hidden sm:block" />
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 hidden sm:inline-block border border-purple-200">
                Khu Vực Chủ Nhà
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link href="/dashboard/listings/new">
                <Button variant="accent" size="sm" className="gap-1.5 hidden sm:flex">
                  <PlusCircle className="h-4 w-4" />
                  Tạo tin đăng mới
                </Button>
              </Link>
              <button
                className="relative p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                aria-label="Thông báo"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "CN"}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-foreground leading-none">
                    {user?.name || "Chủ nhà"}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {user?.email || "minhduc.tran@gmail.com"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Layout Area */}
        <div className="flex-1 flex w-full min-w-0">
          <div className="hidden md:block">
            <DashboardSidebar role="landlord" />
          </div>
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-surface/50 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Mobile Landlord Drawer */}
        <Sheet
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          side="left"
          title="Khu Vực Chủ Nhà"
        >
          <DashboardSidebar
            role="landlord"
            onNavigate={() => setMobileNavOpen(false)}
            className="w-full border-r-0 min-h-0 bg-transparent"
          />
        </Sheet>
      </div>
    </RoleGuard>
  );
}
