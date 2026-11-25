"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  LogOut,
  Home,
  CheckCircle2,
  Building,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useMockAuth } from "@/lib/auth/mock-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

interface RoleGuardProps {
  requiredRole: "admin" | "landlord" | "tenant";
  children: React.ReactNode;
}

const roleConfig = {
  admin: {
    name: "Quản trị viên (Admin)",
    description: "Khu vực quản lý hệ thống, kiểm duyệt tin đăng và hồ sơ định danh.",
    icon: ShieldCheck,
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
    exampleEmail: "admin@houserental.vn",
  },
  landlord: {
    name: "Chủ nhà / Quản lý trọ (Landlord)",
    description: "Khu vực quản lý bất động sản, phòng trọ, lập hóa đơn và hợp đồng.",
    icon: Building,
    badgeBg: "bg-purple-100 text-purple-700 border-purple-300",
    exampleEmail: "minhduc.tran@gmail.com",
  },
  tenant: {
    name: "Khách thuê phòng (Tenant)",
    description: "Khu vực quản lý phòng đang thuê, lịch hẹn xem phòng và hóa đơn thanh toán.",
    icon: KeyRound,
    badgeBg: "bg-emerald-100 text-emerald-700 border-emerald-300",
    exampleEmail: "khang.pham@dev.vn",
  },
};

export function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const { user, isLoading, login, logout } = useMockAuth();
  const router = useRouter();

  const [inputEmail, setInputEmail] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const config = roleConfig[requiredRole];
  const RequiredIcon = config.icon;

  const handleQuickLogin = (emailToUse: string) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(emailToUse);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.error || "Đăng nhập không thành công.");
      }
    }, 300);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickLogin(inputEmail);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  // Case 1: Unauthenticated (No user logged in)
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
              Yêu cầu xác thực tài khoản
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Giao diện này chỉ hiển thị sau khi nhập email thuộc nhóm{" "}
              <strong className="text-foreground">{config.name}</strong>.
            </p>
          </div>

          {errorMsg && (
            <Alert variant="danger" title="Lỗi xác thực">
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Nhập email tài khoản của bạn:
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder={`Ví dụ: ${config.exampleEmail}`}
                  className="pl-9 h-11"
                  required
                />
                <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 font-bold gap-2"
              isLoading={isSubmitting}
            >
              <span>Xác thực & Vào giao diện</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick email hints for role verification */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Email mẫu được cấp cho nhóm này:
            </p>
            <button
              type="button"
              onClick={() => {
                setInputEmail(config.exampleEmail);
                handleQuickLogin(config.exampleEmail);
              }}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-purple-50/50 transition-colors cursor-pointer text-xs flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-foreground group-hover:text-primary">
                  {config.exampleEmail}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  (Nhấp để điền & xác thực nhanh)
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Quay lại trang chủ sàn</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Authenticated but with WRONG role (e.g. Tenant accessing Admin or Landlord)
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
              Quyền truy cập không hợp lệ
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
              Bạn không thể xem giao diện của nhóm{" "}
              <strong className="text-foreground">{config.name}</strong> khi đang đăng nhập bằng tài khoản thuộc nhóm khác.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <Button
              variant="accent"
              onClick={() => handleQuickLogin(config.exampleEmail)}
              isLoading={isSubmitting}
              className="w-full gap-2 font-bold cursor-pointer"
            >
              <RequiredIcon className="h-4 w-4" />
              <span>Chuyển sang tài khoản {config.name} trên tab này</span>
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="w-full sm:w-1/2 gap-2 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất tài khoản này</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (user.role === "admin") router.push("/admin");
                  else if (user.role === "landlord") router.push("/dashboard");
                  else router.push("/account/favorites");
                }}
                className="w-full sm:w-1/2 gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <span>Về trang đúng quyền hiện tại</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Authorized! Render the role's actual interface
  return <>{children}</>;
}
