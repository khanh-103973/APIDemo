"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getAdminReports,
  resolveAdminReport,
  UserReport,
} from "@/lib/api/admin";

export default function AdminReportsPage() {
  const [reports, setReports] = React.useState<UserReport[]>(getAdminReports);
  const [notice, setNotice] = React.useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleResolve = (id: string, action: "resolved" | "dismissed") => {
    const updated = resolveAdminReport(id, action);
    setReports(updated);
    showNotification(
      action === "resolved"
        ? "Đã ghi nhận giải quyết báo cáo vi phạm thành công!"
        : "Đã bác bỏ báo cáo vi phạm do không đủ căn cứ."
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Xử Lý Báo Cáo Vi Phạm & Khiếu Nại
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tiếp nhận và xử lý phản ánh của người thuê về tình trạng tin đăng ảo, sai lệch giá hoặc lừa đảo cọc.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-border p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">
                    Khiếu nại: {item.targetTitle}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Lý do phản ánh:{" "}
                  <strong className="text-danger">
                    {item.reason === "wrong_price"
                      ? "Báo sai giá thuê thực tế"
                      : item.reason === "duplicate"
                      ? "Tin đăng trùng lặp"
                      : item.reason === "fake_listing"
                      ? "Tin đăng phòng ảo"
                      : "Dấu hiệu lừa đảo"}
                  </strong>
                </p>
              </div>

              <span className="text-xs text-muted-foreground">
                Ngày gửi: <strong>{item.createdAt}</strong>
              </span>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-xl border border-border bg-slate-50 space-y-1 text-xs">
              <span className="font-bold text-foreground">Nội dung người thuê phản ánh:</span>
              <p className="text-muted-foreground leading-relaxed">
                &ldquo;{item.description}&rdquo;
              </p>
              <div className="pt-1 text-[11px] text-muted-foreground flex items-center gap-3">
                <span>Người báo: <strong>{item.reporterName}</strong></span>
                <span>•</span>
                <span>SĐT liên hệ: <strong>{item.reporterPhone}</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <Link href={`/listings/${item.targetId}`} target="_blank">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 cursor-pointer">
                  <ExternalLink className="h-3 w-3" />
                  Xem tin bị báo cáo
                </Button>
              </Link>

              {item.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(item.id, "dismissed")}
                    className="h-7 text-xs cursor-pointer"
                  >
                    Bác bỏ
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleResolve(item.id, "resolved")}
                    className="h-7 text-xs gap-1 cursor-pointer shadow-xs"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Xử lý & Cảnh cáo tin
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
