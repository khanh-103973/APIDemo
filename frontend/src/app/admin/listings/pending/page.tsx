"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Check,
  MapPin,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatVND } from "@/lib/format/currency";
import { fetchAdminListingsFromApi, moderateAdminListingAsync } from "@/lib/api/admin";
import { mockUsers } from "@/mocks/users";
import { Listing } from "@/types";

export default function AdminPendingListingsPage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [rejectingListing, setRejectingListing] = React.useState<Listing | null>(null);
  const [rejectReason, setRejectReason] = React.useState<string>("Hình ảnh không rõ ràng hoặc giá thuê chưa chính xác");
  const [requestingChangesListing, setRequestingChangesListing] = React.useState<Listing | null>(null);
  const [changeNotes, setChangeNotes] = React.useState<string>("Vui lòng bổ sung thêm ảnh khu vực nhà vệ sinh và chốt rõ tiền cọc.");
  const [notice, setNotice] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  const refreshPending = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchAdminListingsFromApi();
      setListings(data);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    void fetchAdminListingsFromApi().then((data) => {
      if (active) setListings(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const pendingListings = listings.filter(
    (l) => l.moderationStatus === "pending" || l.status === "pending"
  );

  const handleApprove = async (item: Listing) => {
    const updated = await moderateAdminListingAsync(item, "approved", "Đã kiểm duyệt đạt chuẩn chất lượng và tính xác thực");
    setListings(updated);
    showNotification("Đã phê duyệt xuất bản tin đăng thành công! Tin hiện đã hiển thị công khai.");
  };

  const handleConfirmReject = async () => {
    if (!rejectingListing) return;
    const updated = await moderateAdminListingAsync(rejectingListing, "rejected", rejectReason);
    setListings(updated);
    setRejectingListing(null);
    showNotification("Đã từ chối tin đăng vi phạm quy chuẩn kiểm duyệt.");
  };

  const handleConfirmRequestChanges = async () => {
    if (!requestingChangesListing) return;
    const updated = await moderateAdminListingAsync(requestingChangesListing, "changes_requested", changeNotes);
    setListings(updated);
    setRequestingChangesListing(null);
    showNotification("Đã gửi thông báo yêu cầu sửa đổi đến chủ nhà.");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Hàng Đợi Kiểm Duyệt Tin Đăng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kiểm định nghiêm ngặt tính xác thực, giá thuê và hình ảnh thực tế để bảo vệ người thuê khỏi lừa đảo.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void refreshPending()}
          className="gap-1.5 cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Counter banner */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-amber-700" />
          <span>
            Hiện có <strong>{pendingListings.length}</strong> tin đăng đang chờ bạn phê duyệt.
          </span>
        </div>
        <span className="font-semibold text-amber-800">Cam kết SLA: &le; 4 giờ làm việc</span>
      </div>

      {/* Pending Items List */}
      {pendingListings.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-base font-bold text-foreground">
            Hàng đợi kiểm duyệt trống
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Tất cả các tin đăng gửi lên đã được xử lý xong. Hệ thống sẽ tự động cập nhật khi có tin đăng mới.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
            <Link href="/admin/listings">
              <Button variant="outline" size="sm" className="text-xs">
                Xem tất cả tin trên sàn
              </Button>
            </Link>
            <Link href="/admin/bookings">
              <Button variant="primary" size="sm" className="text-xs">
                Xem lịch hẹn xem phòng
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingListings.map((item) => {
            const landlord = mockUsers.find((u) => u.id === item.landlordId) || {
              name: "Trần Minh Đức",
              phone: "0912 345 678",
              email: "minhduc.tran@gmail.com",
            };

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs space-y-5 p-6"
              >
                {/* Header: Title, Price, Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading text-lg font-bold text-foreground">
                        {item.title}
                      </span>
                      <StatusBadge status="pending" size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{item.address}, {item.district}, {item.city}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-extrabold text-xl text-primary">
                      {formatVND(item.rentPrice)}
                    </span>
                    <span className="text-xs text-muted-foreground">/tháng</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Cọc: {formatVND(item.deposit)}
                    </p>
                  </div>
                </div>

                {/* Photo Gallery Grid */}
                <div>
                  <span className="text-xs font-bold text-foreground mb-2 block">
                    Hình ảnh phòng ({item.images.length} ảnh):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {item.images.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="relative h-28 rounded-lg overflow-hidden bg-slate-100 border border-border aspect-video"
                      >
                        <Image
                          src={imgUrl}
                          alt={`Ảnh ${i + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover"
                        />
                        {i === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Ảnh bìa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl border border-border bg-slate-50 space-y-1">
                    <span className="text-muted-foreground">Thông số phòng:</span>
                    <p className="font-semibold text-foreground">
                      {item.area} m² • {item.bedrooms} PN • {item.bathrooms} WC
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Loại hình: {item.propertyType}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-slate-50 space-y-1">
                    <span className="text-muted-foreground">Người đăng tin (Chủ nhà):</span>
                    <p className="font-bold text-foreground">{landlord.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {landlord.phone} • {landlord.email}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-slate-50 space-y-1">
                    <span className="text-muted-foreground">Thời gian tạo:</span>
                    <p className="font-semibold text-foreground">{item.createdAt}</p>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                      Chờ duyệt
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3.5 rounded-xl border border-border bg-slate-50/50 text-xs space-y-1">
                  <span className="font-bold text-foreground">Mô tả chi tiết:</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Amenities */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-foreground">Tiện ích cam kết:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-muted text-[11px] text-muted-foreground font-medium"
                      >
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Moderation Actions Footer */}
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Hệ thống đã tự động kiểm tra chống từ khóa nhạy cảm: Đạt chuẩn</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRequestingChangesListing(item)}
                      className="text-xs text-amber-700 hover:bg-amber-50 cursor-pointer"
                    >
                      Yêu cầu sửa đổi
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectingListing(item)}
                      className="text-xs text-danger hover:bg-danger-subtle cursor-pointer"
                    >
                      Từ chối tin
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => void handleApprove(item)}
                      className="text-xs gap-1 shadow-xs cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      Phê duyệt xuất bản ngay
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={!!rejectingListing} onOpenChange={(open) => !open && setRejectingListing(null)}>
        {rejectingListing && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-5 w-5 text-danger" />
                <DialogTitle className="text-lg font-bold">Từ Chối Duyệt Tin Đăng</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Tin: <strong>{rejectingListing.title}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs">
              <label className="font-bold text-foreground">Lý do từ chối (Gửi cho chủ nhà)</label>
              <Textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingListing(null)}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmReject}
              >
                Xác nhận từ chối tin
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* Request Changes Modal */}
      <Dialog
        open={!!requestingChangesListing}
        onOpenChange={(open) => !open && setRequestingChangesListing(null)}
      >
        {requestingChangesListing && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <DialogTitle className="text-lg font-bold">Yêu Cầu Chủ Nhà Chỉnh Sửa</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Tin: <strong>{requestingChangesListing.title}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs">
              <label className="font-bold text-foreground">Nội dung hướng dẫn chỉnh sửa</label>
              <Textarea
                rows={3}
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRequestingChangesListing(null)}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmRequestChanges}
              >
                Gửi yêu cầu sửa đổi
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
