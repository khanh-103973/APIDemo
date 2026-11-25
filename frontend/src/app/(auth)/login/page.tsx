"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { loginWithApi } from "@/lib/auth/mock-auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Vui lòng nhập tên đăng nhập hoặc địa chỉ email.");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setIsLoading(true);
    const result = await loginWithApi(email, password);
    setIsLoading(false);

    if (!result.success || !result.user) {
      setError(
        result.error ||
          "Tài khoản hoặc mật khẩu không chính xác. Bạn có thể sử dụng các tài khoản mẫu bên dưới."
      );
      return;
    }

    if (returnTo) {
      router.push(returnTo);
    } else if (result.user.role === "admin") {
      router.push("/admin");
    } else if (result.user.role === "landlord") {
      router.push("/dashboard");
    } else {
      router.push("/account/rentals");
    }
  };

  const handleSelectQuickAccount = (identifier: string, pwd: string) => {
    setEmail(identifier);
    setPassword(pwd);
    setError(null);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-md space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Đăng nhập tài khoản
        </h1>
        <p className="text-sm text-muted-foreground">
          Truy cập hệ thống quản lý phòng thuê và hồ sơ của bạn
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="Lỗi đăng nhập">
          {error}
        </Alert>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Tên đăng nhập hoặc Email
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="admin hoặc admin@rental.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              autoComplete="username"
              required
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">
              Mật khẩu
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary font-medium hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              autoComplete="current-password"
              required
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary"
            />
            <span className="text-xs text-muted-foreground">Ghi nhớ đăng nhập</span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full gap-2 font-bold"
          isLoading={isLoading}
        >
          <span>Đăng nhập</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {/* Quick Login Helpers (Synced with Backend Seed Data) */}
      <div className="pt-4 border-t border-border space-y-2">
        <span className="text-xs font-semibold text-muted-foreground block text-center">
          Tài khoản mẫu (Backend Seed Data - mật khẩu 123456):
        </span>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => handleSelectQuickAccount("tenant_an", "123456")}
            className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium bg-surface hover:bg-slate-200/70 border border-border text-foreground transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Khách thuê: <strong>tenant_an</strong></span>
            </div>
            <span className="text-[10px] text-muted-foreground">Điền sẵn</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectQuickAccount("owner_nam", "123456")}
            className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium bg-surface hover:bg-slate-200/70 border border-border text-foreground transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-purple-600" />
              <span>Chủ nhà: <strong>owner_nam</strong></span>
            </div>
            <span className="text-[10px] text-muted-foreground">Điền sẵn</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectQuickAccount("admin", "123456")}
            className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium bg-surface hover:bg-slate-200/70 border border-border text-foreground transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>Admin: <strong>admin</strong></span>
            </div>
            <span className="text-[10px] text-muted-foreground">Điền sẵn</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="bg-card rounded-xl border border-border p-8 shadow-md text-center text-muted-foreground text-sm">
          Đang tải trang đăng nhập...
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
