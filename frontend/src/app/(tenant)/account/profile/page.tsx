"use client";

import * as React from "react";
import {
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { mockUsers } from "@/mocks/users";
import { useMockAuth } from "@/lib/auth/mock-auth";

export default function TenantProfilePage() {
  const { user } = useMockAuth();
  const tenant = user || mockUsers.find((u) => u.id === "usr_tenant_1");

  const [form, setForm] = React.useState({
    name: tenant?.name || "Phạm Văn Khang",
    email: tenant?.email || "khang.pham@dev.vn",
    phone: tenant?.phone || "0933456789",
    identityCard: "079201008899",
    dateOfBirth: "15/08/1998",
    occupation: "Kỹ sư phần mềm (Software Engineer)",
    emergencyName: "Nguyễn Văn Bình",
    emergencyPhone: "0903112233",
  });

  React.useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const [notice, setNotice] = React.useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("Đã cập nhật hồ sơ cá nhân thành công!");
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Hồ Sơ Cá Nhân Khách Thuê
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thông tin liên hệ, giấy tờ tùy thân CCCD dùng để soạn thảo hợp đồng thuê phòng.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-heading text-base font-bold text-foreground border-b border-border pb-2">
              Thông Tin Cơ Bản
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Họ và tên</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Số điện thoại</label>
                <Input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Email</label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Số CCCD / CMND</label>
                <Input
                  required
                  value={form.identityCard}
                  onChange={(e) => setForm({ ...form, identityCard: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Ngày sinh</label>
                <Input
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Nghề nghiệp / Công việc</label>
                <Input
                  value={form.occupation}
                  onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency contact */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-heading text-base font-bold text-foreground border-b border-border pb-2">
              Liên Hệ Khẩn Cấp (Người thân / Gia đình)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Họ tên người thân</label>
                <Input
                  value={form.emergencyName}
                  onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Số điện thoại khẩn cấp</label>
                <Input
                  value={form.emergencyPhone}
                  onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" className="gap-2 shadow-xs cursor-pointer">
            <Save className="h-4 w-4" />
            Lưu hồ sơ cá nhân
          </Button>
        </div>
      </form>
    </div>
  );
}
