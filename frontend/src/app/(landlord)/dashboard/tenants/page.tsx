"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Phone,
  Mail,
  Home,
  FileText,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatVND } from "@/lib/format/currency";
import { mockUsers } from "@/mocks/users";
import { mockProperties, mockRooms } from "@/mocks/properties";
import { mockContracts } from "@/mocks/contracts";
import { User } from "@/types";

export default function LandlordTenantsPage() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedTenant, setSelectedTenant] = React.useState<User | null>(null);

  // All tenants
  const tenants = mockUsers.filter((u) => u.role === "tenant");

  const filteredTenants = tenants.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        t.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Quản Lý Khách Thuê Phòng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Danh bạ người thuê, thông tin hợp đồng liên kết và trạng thái cư trú tại các phòng trọ.
          </p>
        </div>

        <Link href="/dashboard/contracts">
          <Button variant="outline" className="gap-2 shadow-xs cursor-pointer">
            <FileText className="h-4 w-4" />
            Xem tất cả hợp đồng
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên khách, số điện thoại, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background h-9 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Tổng cộng: <strong className="text-foreground">{filteredTenants.length}</strong> khách thuê
        </span>
      </div>

      {/* Tenants Table / Card List */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-4">Khách thuê</th>
                <th className="p-3.5">Liên hệ</th>
                <th className="p-3.5">Phòng đang thuê</th>
                <th className="p-3.5">Hợp đồng</th>
                <th className="p-3.5">Tiền thuê / tháng</th>
                <th className="p-3.5 text-center">Trạng thái</th>
                <th className="p-3.5 pr-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTenants.map((tenant) => {
                const room = mockRooms.find((r) => r.currentTenantId === tenant.id);
                const property = room ? mockProperties.find((p) => p.id === room.propertyId) : null;
                const contract = mockContracts.find(
                  (c) => c.tenantId === tenant.id && c.status === "active"
                );

                return (
                  <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                    {/* Name & Avatar */}
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-border">
                          {tenant.avatar ? (
                            <Image
                              src={tenant.avatar}
                              alt={tenant.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold text-primary">
                              {tenant.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <button
                            onClick={() => setSelectedTenant(tenant)}
                            className="font-bold text-foreground hover:text-primary transition-colors text-left text-xs cursor-pointer"
                          >
                            {tenant.name}
                          </button>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Cư trú từ: {contract?.startDate || "01/02/2026"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{tenant.phone}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{tenant.email}</span>
                        </p>
                      </div>
                    </td>

                    {/* Room */}
                    <td className="p-3.5">
                      {room ? (
                        <div>
                          <span className="font-bold text-foreground">
                            {room.roomNumber}
                          </span>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                            {property?.name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Chưa gán phòng</span>
                      )}
                    </td>

                    {/* Contract */}
                    <td className="p-3.5 whitespace-nowrap">
                      {contract ? (
                        <div>
                          <span className="font-semibold text-foreground">
                            {contract.contractNumber}
                          </span>
                          <p className="text-[10px] text-muted-foreground">
                            Hạn: {contract.endDate}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </td>

                    {/* Rent price */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-bold text-primary">
                        {contract ? formatVND(contract.monthlyRent) : "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <StatusBadge status="occupied" customLabel="Đang thuê" size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTenant(tenant)}
                          className="h-7 text-xs px-2.5 cursor-pointer"
                        >
                          Hồ sơ
                        </Button>
                        <Link href={`/dashboard/invoices`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 text-primary hover:bg-primary/10 cursor-pointer"
                            title="Lập hóa đơn thu phí"
                          >
                            <Receipt className="h-3.5 w-3.5 mr-1" />
                            Thu phí
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Profile Dialog */}
      <Dialog open={!!selectedTenant} onOpenChange={(open) => !open && setSelectedTenant(null)}>
        {selectedTenant && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-200 border border-border">
                  {selectedTenant.avatar && (
                    <Image
                      src={selectedTenant.avatar}
                      alt={selectedTenant.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">
                    {selectedTenant.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Khách thuê phòng trọ chính thức • Đã ký hợp đồng
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedTenant.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedTenant.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Số CCCD / CMND:</span>
                  <p className="font-bold text-foreground mt-0.5">079201008899</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Liên hệ khẩn cấp:</span>
                  <p className="font-semibold text-foreground mt-0.5">Nguyễn Văn Bình (Bố - 0903 112 233)</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-1.5">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5" />
                  Thông tin phòng đang ở
                </span>
                <p className="text-foreground">
                  Phòng <strong>P.101</strong> — Tòa nhà D2 Bình Thạnh (48/12 Nguyễn Gia Trí, P.25, Bình Thạnh)
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Hợp đồng <strong>HD-2026/0101</strong> • Giá thuê: <strong>5.500.000 ₫/tháng</strong> • Tiền cọc: <strong>5.500.000 ₫</strong>
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTenant(null)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
