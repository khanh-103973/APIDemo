"use client";

import * as React from "react";
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { mockUsers, mockLandlordProfiles } from "@/mocks/users";
import { useMockAuth } from "@/lib/auth/mock-auth";

export default function LandlordProfilePage() {
  const { user } = useMockAuth();
  const landlordUser = user || mockUsers.find((u) => u.id === "usr_landlord_1");
  const landlordProfile = mockLandlordProfiles[landlordUser?.id || "usr_landlord_1"] || mockLandlordProfiles["usr_landlord_1"];

  const [formData, setFormData] = React.useState({
    name: landlordUser?.name || "Trần Minh Đức",
    email: landlordUser?.email || "minhduc.tran@gmail.com",
    phone: landlordUser?.phone || "0912345678",
    businessName: landlordProfile?.businessName || "Hệ Thống Nhà Trọ & Căn Hộ Minh Đức",
    identityCardNumber: landlordProfile?.identityCardNumber || "079085001234",
    taxNumber: landlordProfile?.taxNumber || "8492019283",
    bankName: "Vietcombank (Chi nhánh TP.HCM)",
    bankAccountNumber: "0071001234567",
    bankAccountHolder: "TRAN MINH DUC",
  });

  const [syncedUserId, setSyncedUserId] = React.useState<string | null>(
    user?.id ?? null
  );
  if (user && user.id !== syncedUserId) {
    setSyncedUserId(user.id);
    setFormData((prev) => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
    }));
  }

  const [notice, setNotice] = React.useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("Đã lưu thông tin hồ sơ chủ nhà thành công!");
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Hồ Sơ Chủ Nhà & Tài Khoản Thu Tiền
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cập nhật thông tin định danh, tài khoản ngân hàng nhận tiền thuê và trạng thái xác thực.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Verification Status Card */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 text-sm">
              Tài Khoản Đã Xác Thực Danh Tính
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              Hồ sơ đã được kiểm định bởi ban quản trị sàn. Tin đăng của bạn được gắn huy hiệu uy tín.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-600 text-white hidden sm:inline-block">
          ĐÃ XÁC THỰC
        </span>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal info */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-heading text-base font-bold text-foreground border-b border-border pb-2">
              Thông Tin Định Danh Cá Nhân
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Họ và tên</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Số điện thoại liên hệ</label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Email</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Số CCCD / CMND</label>
                <Input
                  value={formData.identityCardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, identityCardNumber: e.target.value })
                  }
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Bank Account for receiving rent */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="border-b border-border pb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-base font-bold text-foreground">
                Tài Khoản Ngân Hàng Nhận Tiền Thuê
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Thông tin này được dùng để tự động tạo mã VietQR trên hóa đơn hàng tháng gửi cho khách thuê.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Ngân hàng thụ hưởng</label>
                <Input
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Số tài khoản</label>
                <Input
                  required
                  value={formData.bankAccountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAccountNumber: e.target.value })
                  }
                  className="text-xs font-bold text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Tên chủ tài khoản</label>
                <Input
                  required
                  value={formData.bankAccountHolder}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAccountHolder: e.target.value })
                  }
                  className="text-xs uppercase"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" className="gap-2 shadow-xs cursor-pointer">
            <Save className="h-4 w-4" />
            Lưu thay đổi hồ sơ
          </Button>
        </div>
      </form>
    </div>
  );
}
