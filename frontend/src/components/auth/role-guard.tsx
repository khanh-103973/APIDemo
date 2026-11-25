"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  LogOut,
  Home,
  Building,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useMockAuth } from "@/lib/auth/mock-auth";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  requiredRole: "admin" | "landlord" | "tenant";
  children: React.ReactNode;
}

const roleConfig = {
  admin: {
    name: "Quản trị viên (Admin)",
    description: "Khu vực quản lý hệ thống, kiểm duyệt tin đăng và người dùng.",
    icon: ShieldCheck,
  },
  landlord: {
    name: "Chủ nhà / Quản lý (Landlord)",
    description: "Khu vực quản lý bất động sản, phòng trọ, lịch hẹn và hợp đồng.",
    icon: Building,
  },
  tenant: {
    name: "Khách thuê phòng (Tenant)",
    description: "Khu vực quản lý phòng đang thuê, lịch hẹn xem phòng và hợp đồng.",
    icon: KeyRound,
  },
};

export function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const { user, isLoading, logout } = useMockAuth();
  const router = useRouter();
  const pathname = usePathname();

  const config = roleConfig[requiredRole];
  const RequiredIcon = config.icon;
  const loginHref = pathname
    ? `/login?returnTo=${encodeURIComponent(pathname)}`
    : "/login";

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  // Case 1: Chưa đăng nhập -> yêu cầu đăng nhập bằng tài khoản + mật khẩu thật tại /login
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center mx-auto mb-2">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-1">
              <RequiredIcon className="h-3.5 w-3.5" />
              <span>Yêu cầu nhóm: {config.name}</span>
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Yêu cầu đăng nhập
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Vui lòng đăng nhập bằng tài khoản thuộc nhóm{" "}
              <strong className="text-foreground">{config.name}</strong> để tiếp tục truy cập.
            </p>
          </div>

          <div className="space-y-3">
            <Link href={loginHref} className="block">
              <Button variant="primary" className="w-full h-11 font-bold gap-2 cursor-pointer">
                <span>Đến trang đăng nhập</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Quay lại trang chủ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Đã đăng nhập nhưng sai phân quyền (403 Forbidden)
  if (user.role !== requiredRole) {
    const currentConfig = roleConfig[user.role as keyof typeof roleConfig] || {
      name: user.role,
    };

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-red-200 p-6 sm:p-8 shadow-lg space-y-6">
          <div className="text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              403 — Không có quyền truy cập
            </h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tài khoản hiện tại:</span>
                <strong className="text-foreground">{user.name} ({user.email})</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Phân quyền hiện tại:</span>
                <span className="font-bold text-red-600 uppercase">{currentConfig.name}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-muted-foreground">Yêu cầu phân quyền:</span>
                <span className="font-bold text-emerald-700 uppercase">{config.name}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tài khoản của bạn không có quyền truy cập khu vực{" "}
              <strong className="text-foreground">{config.name}</strong>. Vui lòng quay về trang đúng quyền hoặc đăng xuất để đăng nhập tài khoản khác.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                router.push(loginHref);
              }}
              className="w-full sm:w-1/2 gap-2 text-xs cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Đăng xuất & đổi tài khoản</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (user.role === "admin") router.push("/admin");
                else if (user.role === "landlord") router.push("/dashboard");
                else router.push("/account/rentals");
              }}
              className="w-full sm:w-1/2 gap-2 text-xs cursor-pointer"
            >
              <span>Về trang đúng quyền</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Hợp lệ phân quyền
  return <>{children}</>;
}
