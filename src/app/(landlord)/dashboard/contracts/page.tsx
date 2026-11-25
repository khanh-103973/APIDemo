"use client";

import * as React from "react";
import {
  FileText,
  PlusCircle,
  Search,
  CheckCircle2,
  Check,
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
import { formatVND } from "@/lib/format/currency";
import { mockContracts } from "@/mocks/contracts";
import { mockProperties, mockRooms } from "@/mocks/properties";
import { mockUsers } from "@/mocks/users";
import { Contract } from "@/types";

export default function LandlordContractsPage() {
  const [contracts, setContracts] = React.useState<Contract[]>(mockContracts);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [showNewModal, setShowNewModal] = React.useState<boolean>(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  // New contract form state
  const [newCt, setNewCt] = React.useState({
    contractNumber: "HD-2026/0401",
    roomId: "room_102",
    tenantId: "usr_tenant_1",
    startDate: "01/04/2026",
    endDate: "31/03/2027",
    monthlyRent: 5500000,
    deposit: 5500000,
    terms: "Tiền phòng thanh toán từ ngày 01 đến ngày 05 hàng tháng. Giữ gìn vệ sinh chung và an toàn PCCC.",
  });

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const filteredContracts = contracts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!c.contractNumber.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Contract = {
      id: `ct_${Date.now()}`,
      contractNumber: newCt.contractNumber,
      propertyId: "prop_1",
      roomId: newCt.roomId,
      landlordId: "usr_landlord_1",
      tenantId: newCt.tenantId,
      startDate: newCt.startDate,
      endDate: newCt.endDate,
      monthlyRent: Number(newCt.monthlyRent),
      deposit: Number(newCt.deposit),
      billingCycle: "monthly",
      paymentDueDay: 5,
      status: "active",
      terms: newCt.terms,
      createdAt: "25/11/2026",
    };

    setContracts([created, ...contracts]);
    setShowNewModal(false);
    showNotification("Đã tạo hợp đồng cho thuê mới thành công!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Quản Lý Hợp Đồng Cho Thuê
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi thời hạn hợp đồng, tiền cọc, giá thuê thỏa thuận và các điều khoản pháp lý.
          </p>
        </div>

        <Button
          variant="accent"
          onClick={() => setShowNewModal(true)}
          className="gap-2 shadow-xs cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Tạo hợp đồng mới
        </Button>
      </div>

      {/* Notification Toast */}
      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "all", label: "Tất cả hợp đồng" },
            { key: "active", label: "Đang hiệu lực" },
            { key: "expired", label: "Đã hết hạn" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo số hợp đồng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background h-9 text-xs"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-4">Số Hợp Đồng</th>
                <th className="p-3.5">Phòng / Bất động sản</th>
                <th className="p-3.5">Khách thuê</th>
                <th className="p-3.5">Thời hạn thuê</th>
                <th className="p-3.5">Tiền thuê / tháng</th>
                <th className="p-3.5">Tiền cọc</th>
                <th className="p-3.5 text-center">Trạng thái</th>
                <th className="p-3.5 pr-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredContracts.map((contract) => {
                const room = mockRooms.find((r) => r.id === contract.roomId);
                const property = mockProperties.find((p) => p.id === contract.propertyId);
                const tenant = mockUsers.find((u) => u.id === contract.tenantId);

                return (
                  <tr key={contract.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-4 font-bold text-foreground">
                      {contract.contractNumber}
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-foreground">
                        {room?.roomNumber || "P.101"}
                      </span>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                        {property?.name}
                      </p>
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-foreground">
                        {tenant?.name || "Khách thuê"}
                      </span>
                      <p className="text-[11px] text-muted-foreground">{tenant?.phone}</p>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                      <span>{contract.startDate} — {contract.endDate}</span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap font-bold text-primary">
                      {formatVND(contract.monthlyRent)}
                    </td>

                    <td className="p-3.5 whitespace-nowrap font-medium text-foreground">
                      {formatVND(contract.deposit)}
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <StatusBadge status={contract.status} size="sm" />
                    </td>

                    <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedContract(contract)}
                          className="h-7 text-xs px-2.5 cursor-pointer"
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Detail Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
        {selectedContract && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <DialogTitle className="text-lg font-bold">
                    Hợp Đồng {selectedContract.contractNumber}
                  </DialogTitle>
                </div>
                <StatusBadge status={selectedContract.status} size="sm" />
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Được ký kết ngày: {selectedContract.createdAt}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <span className="text-muted-foreground">Phòng thuê:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {mockRooms.find((r) => r.id === selectedContract.roomId)?.roomNumber || "P.101"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Khách thuê:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {mockUsers.find((u) => u.id === selectedContract.tenantId)?.name}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tiền thuê / tháng:</span>
                  <p className="font-bold text-primary mt-0.5">
                    {formatVND(selectedContract.monthlyRent)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tiền cọc giữ chỗ:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {formatVND(selectedContract.deposit)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày bắt đầu:</span>
                  <p className="font-semibold text-foreground mt-0.5">{selectedContract.startDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày kết thúc:</span>
                  <p className="font-semibold text-foreground mt-0.5">{selectedContract.endDate}</p>
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg border border-border bg-background">
                <span className="font-bold text-foreground">Điều khoản cam kết:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedContract.terms}
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedContract(null)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* New Contract Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-bold">Lập Hợp Đồng Thuê Mới</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Soạn thảo hợp đồng cho thuê phòng với khách thuê và xác lập mức giá, tiền cọc.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateContract} className="space-y-4 my-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Số hợp đồng</label>
              <Input
                required
                value={newCt.contractNumber}
                onChange={(e) => setNewCt({ ...newCt, contractNumber: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Phòng cho thuê</label>
              <select
                value={newCt.roomId}
                onChange={(e) => setNewCt({ ...newCt, roomId: e.target.value })}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {mockRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} ({formatVND(r.basePrice)}/tháng)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Khách thuê</label>
            <select
              value={newCt.tenantId}
              onChange={(e) => setNewCt({ ...newCt, tenantId: e.target.value })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {mockUsers
                .filter((u) => u.role === "tenant")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.phone}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Tiền thuê / tháng (VND)</label>
              <Input
                type="number"
                step={100000}
                required
                value={newCt.monthlyRent}
                onChange={(e) => setNewCt({ ...newCt, monthlyRent: Number(e.target.value) })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Tiền cọc (VND)</label>
              <Input
                type="number"
                step={100000}
                required
                value={newCt.deposit}
                onChange={(e) => setNewCt({ ...newCt, deposit: Number(e.target.value) })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Ngày bắt đầu</label>
              <Input
                required
                value={newCt.startDate}
                onChange={(e) => setNewCt({ ...newCt, startDate: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Ngày kết thúc</label>
              <Input
                required
                value={newCt.endDate}
                onChange={(e) => setNewCt({ ...newCt, endDate: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Điều khoản hợp đồng</label>
            <Textarea
              rows={3}
              value={newCt.terms}
              onChange={(e) => setNewCt({ ...newCt, terms: e.target.value })}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewModal(false)}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1">
              <Check className="h-4 w-4" />
              Lưu hợp đồng
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
