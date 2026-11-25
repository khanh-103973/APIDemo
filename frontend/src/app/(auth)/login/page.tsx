"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { loginWithApi } from "@/lib/auth/mock-auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const reason = searchParams.get("reason");
  const isSessionExpired = reason === "session_expired";

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
    const result = await loginWithApi(email, password, rememberMe);
    setIsLoading(false);

    if (!result.success || !result.user) {
      setError(result.error || "Tên đăng nhập hoặc mật khẩu không chính xác.");
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

      {isSessionExpired && !error && (
        <Alert variant="warning" title="Phiên đăng nhập đã hết hạn">
          Phiên làm việc của bạn đã hết hạn hoặc không còn hợp lệ (401). Vui lòng đăng nhập lại để tiếp tục.
        </Alert>
      )}

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
              placeholder="Nhập tên đăng nhập hoặc email"
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

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
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
