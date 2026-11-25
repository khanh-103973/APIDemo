"use client";

import * as React from "react";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getAdminVerifications,
  moderateAdminVerification,
  VerificationRequest,
} from "@/lib/api/admin";

export default function AdminVerificationsPage() {
  const [requests, setRequests] = React.useState<VerificationRequest[]>(getAdminVerifications);
  const [selectedDoc, setSelectedDoc] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleApprove = (id: string, name: string) => {
    const updated = moderateAdminVerification(id, "verified");
    setRequests(updated);
    showNotification(`Đã cấp huy hiệu 'Chủ nhà đã xác minh' thành công cho ${name}!`);
  };

  const handleReject = (id: string) => {
    const updated = moderateAdminVerification(id, "rejected");
    setRequests(updated);
    showNotification("Đã từ chối hồ sơ xác thực do giấy tờ chưa đạt chuẩn.");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Duyệt Hồ Sơ Xác Thực Chủ Nhà
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kiểm định giấy tờ định danh CCCD và quyền sở hữu để cấp huy hiệu uy tín, ngăn ngừa chủ nhà ảo.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-border p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base font-bold text-foreground">
                    {item.userName}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Thương hiệu / Tên cơ sở: <strong className="text-foreground">{item.businessName || "Nhà trọ tư nhân"}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Địa chỉ thường trú: {item.address}
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-muted-foreground">
                <p>Ngày nộp: <strong>{item.submittedAt}</strong></p>
                <p className="mt-0.5">Số BĐS khai báo: <strong className="text-primary">{item.propertiesCount}</strong></p>
              </div>
            </div>

            {/* Verification Documents & Identity Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-slate-50 space-y-1">
                <span className="text-muted-foreground">Thông tin CCCD / CMND:</span>
                <p className="font-bold text-foreground text-sm font-mono mt-0.5">{item.idCardNumber}</p>
                <p className="text-[11px] text-muted-foreground">Đã kiểm tra đối chiếu dữ liệu công dân</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-slate-50 space-y-1">
                <span className="text-muted-foreground">Liên hệ chủ nhà:</span>
                <p className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {item.userPhone}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {item.userEmail}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-slate-50 space-y-2">
                <span className="text-muted-foreground">Giấy tờ đính kèm ({item.documents.length}):</span>
                <div className="flex gap-2">
                  {item.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedDoc(doc)}
                      className="relative h-14 w-20 rounded-lg overflow-hidden border border-border bg-slate-200 cursor-pointer hover:opacity-90"
                      title="Nhấn để phóng to ảnh CCCD"
                    >
                      <Image src={doc} alt="Tài liệu CCCD" fill sizes="80px" className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {item.status === "pending" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(item.id)}
                    className="text-xs text-danger hover:bg-danger-subtle cursor-pointer"
                  >
                    Từ chối hồ sơ
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(item.id, item.userName)}
                    className="text-xs gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="h-4 w-4" />
                    Phê duyệt xác thực ngay
                  </Button>
                </>
              ) : item.status === "verified" ? (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Đã được cấp chứng nhận xác minh
                </span>
              ) : (
                <span className="text-xs text-danger font-semibold flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Hồ sơ đã bị từ chối
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Doc Preview Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        {selectedDoc && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Tài Liệu Minh Chứng Xác Thực</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Bản scan ảnh CCCD / Giấy đăng ký kinh doanh căn hộ dịch vụ
              </DialogDescription>
            </DialogHeader>
            <div className="relative h-72 w-full rounded-xl overflow-hidden my-2 border border-border bg-slate-100">
              <Image src={selectedDoc} alt="CCCD Scan" fill sizes="600px" className="object-contain" />
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)}>
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
