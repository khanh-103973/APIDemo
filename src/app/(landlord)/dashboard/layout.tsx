import Link from "next/link";
import { Home, Bell, PlusCircle } from "lucide-react";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { Button } from "@/components/ui/button";

export default function LandlordDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Landlord Operational Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Home className="h-4 w-4" />
              </div>
              <span className="font-heading text-lg font-bold">
                House<span className="text-primary">Rental</span>
              </span>
            </Link>
            <div className="h-5 w-[1px] bg-border mx-1 hidden sm:block" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700 hidden sm:inline-block">
              Cổng Chủ Nhà
            </span>
          </div>

          <div className="flex items-center gap-3">
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
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
              MĐ
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex w-full">
        <div className="hidden md:block">
          <DashboardSidebar role="landlord" />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-surface/50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
