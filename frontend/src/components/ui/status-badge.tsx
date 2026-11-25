import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";

export type SupportedStatus =
  // Listing
  | "draft"
  | "pending"
  | "active"
  | "rejected"
  | "rented"
  | "hidden"
  | "changes_requested"
  | "approved"
  // Viewing
  | "confirmed"
  | "cancelled"
  | "completed"
  // Room
  | "available"
  | "reserved"
  | "occupied"
  | "maintenance"
  | "inactive"
  // Contract
  | "expired"
  | "terminated"
  // Invoice
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "overdue"
  // Issue
  | "accepted"
  | "in_progress"
  | "resolved"
  // Verification & User
  | "verified"
  | "not_submitted"
  | "suspended"
  | "pending_verification";

interface StatusConfig {
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
}

const statusMap: Record<SupportedStatus, StatusConfig> = {
  // Success (Green)
  active: { label: "Đang hoạt động", variant: "success" },
  available: { label: "Còn trống", variant: "success" },
  paid: { label: "Đã thanh toán", variant: "success" },
  verified: { label: "Đã xác thực", variant: "success" },
  approved: { label: "Đã phê duyệt", variant: "success" },
  resolved: { label: "Đã giải quyết", variant: "success" },

  // Warning (Amber)
  unpaid: { label: "Chưa thanh toán", variant: "warning" },
  pending: { label: "Chờ duyệt", variant: "warning" },
  pending_verification: { label: "Chờ xác thực", variant: "warning" },
  partially_paid: { label: "Thanh toán 1 phần", variant: "warning" },
  reserved: { label: "Đã đặt chỗ", variant: "warning" },
  maintenance: { label: "Bảo trì", variant: "warning" },
  in_progress: { label: "Đang xử lý", variant: "warning" },
  changes_requested: { label: "Yêu cầu sửa đổi", variant: "warning" },

  // Danger (Red)
  overdue: { label: "Quá hạn", variant: "danger" },
  rejected: { label: "Bị từ chối", variant: "danger" },
  terminated: { label: "Đã chấm dứt", variant: "danger" },
  suspended: { label: "Đã khóa", variant: "danger" },
  cancelled: { label: "Đã hủy", variant: "danger" },

  // Info (Blue)
  confirmed: { label: "Đã xác nhận", variant: "info" },
  accepted: { label: "Đã tiếp nhận", variant: "info" },

  // Neutral (Gray)
  draft: { label: "Bản nháp", variant: "neutral" },
  inactive: { label: "Tạm dừng", variant: "neutral" },
  hidden: { label: "Đã ẩn", variant: "neutral" },
  rented: { label: "Đã cho thuê", variant: "neutral" },
  occupied: { label: "Đang ở", variant: "neutral" },
  expired: { label: "Đã hết hạn", variant: "neutral" },
  completed: { label: "Đã hoàn tất", variant: "neutral" },
  not_submitted: { label: "Chưa gửi", variant: "neutral" },
};

export interface StatusBadgeProps {
  status: string;
  customLabel?: string;
  appearance?: "subtle" | "solid";
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status,
  customLabel,
  appearance = "subtle",
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = statusMap[status as SupportedStatus] || {
    label: customLabel || status,
    variant: "neutral" as const,
  };

  return (
    <Badge
      variant={config.variant}
      appearance={appearance}
      size={size}
      className={className}
    >
      {customLabel || config.label}
    </Badge>
  );
}
