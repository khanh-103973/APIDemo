"use client";

import * as React from "react";
import {
  Wrench,
  PlusCircle,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { mockIssueReports } from "@/mocks/issues";
import { IssueReport, IssueCategory, IssueUrgency } from "@/types";

export default function TenantIssuesPage() {
  const [issues, setIssues] = React.useState<IssueReport[]>(() =>
    mockIssueReports.filter((i) => i.tenantId === "usr_tenant_1")
  );
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    title: "",
    category: "appliance" as IssueCategory,
    urgency: "medium" as IssueUrgency,
    description: "",
  });

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    const created: IssueReport = {
      id: `iss_${Date.now()}`,
      tenantId: "usr_tenant_1",
      landlordId: "usr_landlord_1",
      propertyId: "prop_1",
      roomId: "room_101",
      title: form.title,
      description: form.description,
      category: form.category,
      urgency: form.urgency,
      status: "pending",
      images: [],
      createdAt: "25/11/2026",
    };

    setIssues([created, ...issues]);
    setShowModal(false);
    setForm({
      title: "",
      category: "appliance",
      urgency: "medium",
      description: "",
    });
    showNotification("Đã gửi yêu cầu báo hỏng đến chủ nhà thành công!");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Báo Cáo Sự Cố & Sửa Chữa
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gửi yêu cầu kiểm tra và bảo trì thiết bị trong phòng trực tiếp đến chủ nhà và quản lý tòa nhà.
          </p>
        </div>

        <Button
          variant="accent"
          onClick={() => setShowModal(true)}
          className="gap-2 shadow-xs cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Báo cáo sự cố mới
        </Button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-4">
        {issues.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-border bg-surface hover:border-border-focus transition-all space-y-3 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-foreground text-sm">{item.title}</span>
                <StatusBadge status={item.status} size="sm" />
                <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                  {item.category === "appliance"
                    ? "Điện lạnh & Thiết bị"
                    : item.category === "plumbing"
                    ? "Đường ống nước"
                    : "Điện & Chiếu sáng"}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                    item.urgency === "high"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.urgency === "high" ? "Khẩn cấp" : "Bình thường"}
                </span>
              </div>

              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Gửi ngày: {item.createdAt}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.description}
            </p>

            {item.landlordNote && (
              <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200 text-xs text-purple-900 mt-2">
                <strong>Phản hồi từ chủ nhà:</strong> {item.landlordNote}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-bold">Báo Cáo Sự Cố Phòng</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Phòng P.101 — Tòa nhà D2 Bình Thạnh. Thợ bảo trì sẽ tiếp nhận yêu cầu sớm nhất.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateIssue} className="space-y-4 my-2 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Tiêu đề sự cố</label>
            <Input
              required
              placeholder="VD: Máy lạnh chảy nước / Bóng đèn phòng tắm bị cháy..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Loại sự cố</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as IssueCategory })
                }
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="appliance">Điện lạnh (Máy lạnh, tủ lạnh)</option>
                <option value="plumbing">Đường nước (Vòi sen, bồn cầu)</option>
                <option value="electrical">Điện chiếu sáng, ổ cắm</option>
                <option value="other">Vấn đề khác</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Mức độ khẩn cấp</label>
              <select
                value={form.urgency}
                onChange={(e) =>
                  setForm({ ...form, urgency: e.target.value as IssueUrgency })
                }
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">Thấp (Trong vòng vài ngày)</option>
                <option value="medium">Bình thường (Trong vòng 24h)</option>
                <option value="high">Khẩn cấp (Cần kiểm tra ngay)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Mô tả hiện tượng chi tiết</label>
            <Textarea
              rows={4}
              required
              placeholder="Mô tả cụ thể hiện tượng hỏng hóc để thợ chuẩn bị linh kiện thay thế..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1">
              <Send className="h-4 w-4" />
              Gửi yêu cầu sửa chữa
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
