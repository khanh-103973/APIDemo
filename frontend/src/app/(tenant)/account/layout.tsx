"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { Sheet } from "@/components/ui/sheet";
import { RoleGuard } from "@/components/auth/role-guard";

export default function TenantAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <RoleGuard requiredRole="tenant">
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        {/* Mobile Tenant Portal Bar */}
        <div className="md:hidden border-b border-border bg-white px-4 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted cursor-pointer"
          >
            <Menu className="h-4 w-4 text-emerald-600" />
            <span>Menu cổng khách thuê</span>
          </button>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Khách thuê
          </span>
        </div>

        <div className="flex-1 flex max-w-7xl w-full mx-auto min-w-0">
          <div className="hidden md:block">
            <DashboardSidebar role="tenant" />
          </div>
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-surface/50 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>

        <Sheet
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          side="left"
          title="Cổng Khách Thuê"
        >
          <DashboardSidebar
            role="tenant"
            onNavigate={() => setMobileNavOpen(false)}
            className="w-full border-r-0 min-h-0 bg-transparent"
          />
        </Sheet>
        <Footer />
      </div>
    </RoleGuard>
  );
}
