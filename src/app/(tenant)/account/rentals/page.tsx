"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  KeyRound,
  MapPin,
  Receipt,
  FileText,
  Wrench,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format/currency";
import { mockProperties, mockRooms } from "@/mocks/properties";
import { mockContracts } from "@/mocks/contracts";
import { mockUsers } from "@/mocks/users";
import { useMockAuth } from "@/lib/auth/mock-auth";

export default function TenantRentalsPage() {
  const { user } = useMockAuth();
  const tenantId = user?.id || "usr_tenant_1";
  // Current rental for active tenant
  const contract = mockContracts.find((c) => c.tenantId === tenantId && c.status === "active") || mockContracts[0];
  const room = contract ? mockRooms.find((r) => r.id === contract.roomId) : mockRooms[0];
  const property = room ? mockProperties.find((p) => p.id === room.propertyId) : mockProperties[0];
  const landlord = mockUsers.find((u) => u.id === (contract?.landlordId || "usr_landlord_1"));
  const landlordName = landlord?.fullName || (landlord as any)?.name || "Trần Minh Đức";
  const landlordPhone = landlord?.phoneNumber || (landlord as any)?.phone || "0912345678";
  const landlordInitials = landlordName
    .split(" ")
    .map((w: string) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Phòng Đang Thuê Của Bạn
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thông tin chi tiết căn phòng hiện tại, hợp đồng cư trú và các tiện ích sinh hoạt.
        </p>
      </div>

      {/* Main Rental Card */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="relative h-64 w-full bg-slate-200">
          <Image
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80"
            alt="Phòng đang thuê"
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              ĐANG CƯ TRÚ
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xs text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-lg font-bold">
                Phòng {room?.roomNumber || "P.101"} — {property?.name}
              </h2>
              <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{property?.address}, {property?.district}, {property?.city}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-lg text-emerald-400">
                {formatVND(contract?.monthlyRent || 5500000)}
              </span>
              <span className="text-xs text-slate-300">/tháng</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-border bg-background">
              <span className="text-muted-foreground">Diện tích phòng</span>
              <p className="font-bold text-foreground text-sm mt-1">{room?.area || 28} m²</p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background">
              <span className="text-muted-foreground">Tiền cọc phòng</span>
              <p className="font-bold text-foreground text-sm mt-1">
                {formatVND(contract?.deposit || 5500000)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background">
              <span className="text-muted-foreground">Thời hạn hợp đồng</span>
              <p className="font-semibold text-foreground text-xs mt-1">
                {contract?.startDate} - {contract?.endDate}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background">
              <span className="text-muted-foreground">Hạn nộp tiền phòng</span>
              <p className="font-bold text-primary text-sm mt-1">Ngày 05 hàng tháng</p>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link
              href="/account/invoices"
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-foreground">Hóa đơn tháng này</p>
                <p className="text-[11px] text-muted-foreground">Xem chi tiết tiền điện nước</p>
              </div>
            </Link>

            <Link
              href="/account/contracts"
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-foreground">Hợp đồng điện tử</p>
                <p className="text-[11px] text-muted-foreground">Số HĐ: {contract?.contractNumber}</p>
              </div>
            </Link>

            <Link
              href="/account/issues"
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-foreground">Báo hỏng & Sửa chữa</p>
                <p className="text-[11px] text-muted-foreground">Gửi yêu cầu thợ sửa thiết bị</p>
              </div>
            </Link>
          </div>

          {/* Landlord Contact Box */}
          <div className="p-4 rounded-xl border border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                {landlordInitials}
              </div>
              <div>
                <span className="font-bold text-xs text-foreground">
                  Chủ nhà: {landlordName}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Đã xác thực danh tính • Quản lý {property?.name || "Tòa nhà cho thuê"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a href={`tel:${landlordPhone}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Phone className="h-3.5 w-3.5" />
                  Gọi: {landlordPhone}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
