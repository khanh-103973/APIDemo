"use client";

import * as React from "react";
import { Calendar, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { Listing } from "@/types";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createViewingRequestAsync } from "@/lib/api/viewings";
import { useMockAuth } from "@/lib/auth/mock-auth";

export interface ViewingModalProps {
  listing: Listing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeSlotOptions = [
  { label: "09:00 - 10:00 (Sáng)", value: "09:00 - 10:00" },
  { label: "10:30 - 11:30 (Trưa)", value: "10:30 - 11:30" },
  { label: "14:00 - 15:00 (Chiều)", value: "14:00 - 15:00" },
  { label: "16:30 - 17:30 (Chiều muộn)", value: "16:30 - 17:30" },
  { label: "18:00 - 19:00 (Tối)", value: "18:00 - 19:00" },
];

function getLocalIsoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function ViewingModal({ listing, open, onOpenChange }: ViewingModalProps) {
  const { user } = useMockAuth();
  const [date, setDate] = React.useState("");
  const [minDate, setMinDate] = React.useState("");
  const [timeSlot, setTimeSlot] = React.useState("09:00 - 10:00");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Initialize date lazily when modal opens on client to avoid SSR/client timezone hydration mismatches
  React.useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      setMinDate(getLocalIsoDate(0));
      setDate((prev) => prev || getLocalIsoDate(1));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const preferredDate = date.split("-").reverse().join("/");
    const result = await createViewingRequestAsync({
      listingId: listing.id,
      tenantId: user?.id || "",
      landlordId: listing.landlordId,
      preferredDate,
      dateIso: date,
      preferredTimeSlot: timeSlot,
      tenantNote: note.trim(),
    });

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error || "Không thể tạo lịch hẹn. Vui lòng thử lại.");
      return;
    }
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setError(null);
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl">Yêu cầu xem phòng đã gửi!</DialogTitle>
          <DialogDescription className="max-w-sm mx-auto text-sm leading-relaxed">
            Chủ nhà sẽ nhận được thông báo và liên hệ xác nhận cuộc hẹn với bạn trong thời gian sớm nhất.
          </DialogDescription>

          <div className="bg-surface rounded-lg p-3 text-left text-xs space-y-1.5 border border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tin đăng:</span>
              <span className="font-semibold text-foreground truncate max-w-[200px]">
                {listing.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày xem:</span>
              <span className="font-semibold text-foreground">
                {date.split("-").reverse().join("/")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Khung giờ:</span>
              <span className="font-semibold text-foreground">{timeSlot}</span>
            </div>
          </div>

          <Button variant="primary" className="w-full mt-4" onClick={handleReset}>
            Hoàn tất & Đóng
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Đặt lịch hẹn xem phòng</DialogTitle>
            <DialogDescription>
              Gửi yêu cầu tới chủ nhà với ngày và khung giờ bạn muốn đến xem trực tiếp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}
            <div className="p-3 bg-surface rounded-md border border-border text-xs">
              <span className="text-muted-foreground block">Phòng đang xem:</span>
              <span className="font-semibold text-foreground line-clamp-1">{listing.title}</span>
              <span className="text-muted-foreground block mt-0.5 truncate">{listing.address}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                Ngày muốn xem phòng
              </label>
              <Input
                type="date"
                required
                value={date}
                min={minDate || undefined}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Khung giờ thuận tiện
              </label>
              <Select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                options={timeSlotOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-primary" />
                Lời nhắn cho chủ nhà (không bắt buộc)
              </label>
              <Textarea
                placeholder="Ví dụ: Tôi muốn kiểm tra vị trí để xe máy và áp lực nước nóng lạnh..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="accent"
              isLoading={isSubmitting}
            >
              Xác nhận gửi yêu cầu
            </Button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
}
