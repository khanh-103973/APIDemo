"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Building,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { setMockCurrentUser, getAllUsers } from "@/lib/auth/mock-auth";
import { User as UserType } from "@/types";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = React.useState<"tenant" | "landlord">("tenant");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(true);

  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    const allKnown = getAllUsers();
    if (allKnown.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError("Địa chỉ email này đã tồn tại trong hệ thống. Vui lòng đăng nhập hoặc chọn email khác.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Vui lòng nhập số điện thoại hợp lệ (tối thiểu 10 chữ số).");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có độ dài tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!acceptTerms) {
      setError("Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      // Create new mock user session
      const newUser: UserType = {
        id: `usr_${Date.now()}`,
        name: fullName.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        phoneNumber: phone.trim(),
        role: role,
        status: "active",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
        createdAt: "25/11/2026",
      };
      setMockCurrentUser(newUser);

      // Automatically route after 1.5s
      setTimeout(() => {
        if (role === "landlord") {
          router.push("/dashboard");
        } else {
          router.push("/account/favorites");
        }
      }, 1500);
    }, 800);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-md space-y-6">
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            Đăng ký tài khoản thành công!
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {role === "landlord"
              ? "Tài khoản của bạn đã được khởi tạo. Đang chuyển hướng đến Bảng điều khiển Chủ nhà để hoàn thiện hồ sơ..."
              : "Chào mừng bạn đến với House Rental! Đang chuyển hướng bạn đến khu vực khách thuê..."}
          </p>
        </div>
      ) : (
        <>
          <div className="text-center space-y-1.5">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Đăng ký tài khoản mới
            </h1>
            <p className="text-sm text-muted-foreground">
              Tham gia mạng lưới thuê phòng và quản lý bất động sản
            </p>
          </div>

          {error && (
            <Alert variant="danger" title="Lỗi đăng ký">
              {error}
            </Alert>
          )}

          {/* Role Choice Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tôi tham gia với vai trò:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  role === "tenant"
                    ? "border-primary bg-purple-50/50 text-foreground ring-1 ring-primary font-semibold"
                    : "border-input bg-surface text-muted-foreground hover:bg-slate-100"
                }`}
              >
                <KeyRound className={`h-5 w-5 ${role === "tenant" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm">Người thuê phòng</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("landlord")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  role === "landlord"
                    ? "border-primary bg-purple-50/50 text-foreground ring-1 ring-primary font-semibold"
                    : "border-input bg-surface text-muted-foreground hover:bg-slate-100"
                }`}
              >
                <Building className={`h-5 w-5 ${role === "landlord" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm">Chủ nhà cho thuê</span>
              </button>
            </div>
            {role === "landlord" && (
              <p className="text-xs text-purple-700 bg-purple-50 p-2.5 rounded border border-purple-200 mt-2">
                <strong>Ghi chú:</strong> Tài khoản Chủ nhà sẽ được kích hoạt quyền đăng tin và quản lý phòng trọ sau khi hoàn thiện thông tin xác thực.
              </p>
            )}
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {role === "landlord" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tên cơ sở / Tòa nhà cho thuê (không bắt buộc)
                </label>
                <Input
                  type="text"
                  placeholder="Ví dụ: Tòa nhà Căn hộ dịch vụ Sen Vàng"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="ten@vidu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Số điện thoại
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="0912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                  required
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded border-input text-primary focus:ring-primary accent-primary"
              />
              <span className="text-xs text-muted-foreground leading-normal">
                Tôi đồng ý với{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Chính sách bảo mật
                </Link>
                .
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full gap-2 font-bold mt-2"
              isLoading={isLoading}
            >
              <span>Đăng ký ngay</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-2">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
