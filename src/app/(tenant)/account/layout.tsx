"use client";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { RoleGuard } from "@/components/auth/role-guard";

export default function TenantAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard requiredRole="tenant">
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <div className="hidden md:block">
            <DashboardSidebar role="tenant" />
          </div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-surface/50 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </RoleGuard>
  );
}
