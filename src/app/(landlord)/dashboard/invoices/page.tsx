"use client";

import * as React from "react";
import {
  Receipt,
  PlusCircle,
  Search,
  CheckCircle2,
  CreditCard,
  Check,
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
import { getAllInvoices, saveAllInvoices } from "@/lib/api/invoices";
import { mockContracts } from "@/mocks/contracts";
import { mockRooms } from "@/mocks/properties";
import { mockUsers } from "@/mocks/users";
import { Invoice, InvoiceStatus } from "@/types";

export default function LandlordInvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>(getAllInvoices);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [periodFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = React.useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState<boolean>(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  // Payment record form state
  const [payForm, setPayForm] = React.useState({
    amount: 0,
    paymentMethod: "bank_transfer" as "bank_transfer" | "cash",
    referenceCode: "VCB2026889922",
    note: "Khách chuyển khoản thanh toán tiền phòng",
  });

  // Create invoice form state
  const [newInv, setNewInv] = React.useState({
    contractId: "ct_1001",
    billingPeriod: "04/2026",
    dueDate: "05/04/2026",
    rentAmount: 5500000,
    oldElectricity: 1380,
    newElectricity: 1492,
    electricityRate: 3800,
    waterAmount: 100000,
    serviceAmount: 154400,
  });

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Filter
  const filteredInvoices = invoices.filter((i) => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (periodFilter !== "all" && i.billingPeriod !== periodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!i.invoiceNumber.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Financial Stats
  const stats = React.useMemo(() => {
    const totalBilled = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
    const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
    const totalPending = totalBilled - totalCollected;
    const unpaidCount = invoices.filter((i) => i.status === "unpaid" || i.status === "overdue").length;
    return { totalBilled, totalCollected, totalPending, unpaidCount };
  }, [invoices]);

  // Handle offline payment recording
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    const updated = invoices.map((inv) => {
      if (inv.id === payingInvoice.id) {
        const paidAmount = payingInvoice.totalAmount;
        return {
          ...inv,
          paidAmount,
          status: "paid" as InvoiceStatus,
          paymentRecords: [
            ...inv.paymentRecords,
            {
              id: `pr_${Date.now()}`,
              invoiceId: inv.id,
              amount: payForm.amount || paidAmount,
              paymentDate: "25/11/2026",
              paymentMethod: payForm.paymentMethod,
              referenceCode: payForm.referenceCode,
              note: payForm.note,
              recordedBy: "Trần Minh Đức (Chủ nhà)",
            },
          ],
        };
      }
      return inv;
    });

    setInvoices(updated);
    saveAllInvoices(updated);
    setPayingInvoice(null);
    showNotification("Đã ghi nhận thanh toán hóa đơn thành công!");
  };

  // Handle create invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const contract = mockContracts.find((c) => c.id === newInv.contractId);
    const elecDiff = Math.max(0, newInv.newElectricity - newInv.oldElectricity);
    const elecCost = elecDiff * newInv.electricityRate;
    const total =
      Number(newInv.rentAmount) +
      elecCost +
      Number(newInv.waterAmount) +
      Number(newInv.serviceAmount);

    const created: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-202604-00${invoices.length + 1}`,
      contractId: newInv.contractId,
      landlordId: "usr_landlord_1",
      tenantId: contract?.tenantId || "usr_tenant_1",
      billingPeriod: newInv.billingPeriod,
      dueDate: newInv.dueDate,
      totalAmount: total,
      paidAmount: 0,
      status: "unpaid",
      lineItems: [
        {
          id: `li_rent_${Date.now()}`,
          description: `Tiền thuê phòng kỳ ${newInv.billingPeriod}`,
          type: "rent",
          amount: Number(newInv.rentAmount),
        },
        {
          id: `li_elec_${Date.now()}`,
          description: `Tiền điện (${newInv.oldElectricity} -> ${newInv.newElectricity} = ${elecDiff} kWh)`,
          type: "electricity",
          oldReading: newInv.oldElectricity,
          newReading: newInv.newElectricity,
          unitPrice: newInv.electricityRate,
          amount: elecCost,
        },
        {
          id: `li_water_${Date.now()}`,
          description: "Tiền nước sinh hoạt",
          type: "water",
          amount: Number(newInv.waterAmount),
        },
        {
          id: `li_svc_${Date.now()}`,
          description: "Phí dịch vụ & internet",
          type: "service",
          amount: Number(newInv.serviceAmount),
        },
      ],
      paymentRecords: [],
      createdAt: "25/11/2026",
    };

    const nextInvoices = [created, ...invoices];
    setInvoices(nextInvoices);
    saveAllInvoices(nextInvoices);
    setShowCreateModal(false);
    showNotification("Đã lập và phát hành hóa đơn thu phí mới thành công!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Hóa Đơn & Thu Phí Hàng Tháng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý thu tiền phòng, chốt chỉ số điện nước và ghi nhận thanh toán chuyển khoản/tiền mặt.
          </p>
        </div>

        <Button
          variant="accent"
          onClick={() => setShowCreateModal(true)}
          className="gap-2 shadow-xs cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Lập hóa đơn thu phí
        </Button>
      </div>

      {/* Action Notice */}
      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Tổng tiền đã thu
          </span>
          <p className="font-heading text-2xl font-bold text-emerald-700 mt-2">
            {formatVND(stats.totalCollected)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Đã chốt thu tiền mặt & chuyển khoản</p>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Đang chờ thanh toán
          </span>
          <p className="font-heading text-2xl font-bold text-amber-700 mt-2">
            {formatVND(stats.totalPending)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong className="text-foreground">{stats.unpaidCount}</strong> hóa đơn chưa thu
          </p>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Tổng giá trị phát hành
          </span>
          <p className="font-heading text-2xl font-bold text-foreground mt-2">
            {formatVND(stats.totalBilled)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Kỳ tháng 03/2026 và 04/2026</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "all", label: "Tất cả" },
            { key: "unpaid", label: "Chưa thanh toán" },
            { key: "paid", label: "Đã thanh toán" },
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
            placeholder="Tìm theo số hóa đơn (INV-...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background h-9 text-xs"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-4">Mã Hóa Đơn</th>
                <th className="p-3.5">Kỳ Thu</th>
                <th className="p-3.5">Phòng / Khách thuê</th>
                <th className="p-3.5">Tổng số tiền</th>
                <th className="p-3.5">Đã thanh toán</th>
                <th className="p-3.5">Hạn nộp</th>
                <th className="p-3.5 text-center">Trạng thái</th>
                <th className="p-3.5 pr-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((inv) => {
                const contract = mockContracts.find((c) => c.id === inv.contractId);
                const room = contract ? mockRooms.find((r) => r.id === contract.roomId) : null;
                const tenant = mockUsers.find((u) => u.id === inv.tenantId);

                return (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-4 font-bold text-foreground">
                      {inv.invoiceNumber}
                    </td>

                    <td className="p-3.5 font-semibold text-foreground">
                      {inv.billingPeriod}
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-foreground">
                        {room?.roomNumber || "P.101"}
                      </span>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                        {tenant?.name || "Khách thuê"}
                      </p>
                    </td>

                    <td className="p-3.5 font-bold text-primary">
                      {formatVND(inv.totalAmount)}
                    </td>

                    <td className="p-3.5 font-semibold text-emerald-700">
                      {formatVND(inv.paidAmount)}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                      {inv.dueDate}
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <StatusBadge status={inv.status} size="sm" />
                    </td>

                    <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(inv)}
                          className="h-7 text-xs px-2 cursor-pointer"
                        >
                          Chi tiết
                        </Button>

                        {inv.status !== "paid" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setPayingInvoice(inv);
                              setPayForm((prev) => ({
                                ...prev,
                                amount: inv.totalAmount - inv.paidAmount,
                              }));
                            }}
                            className="h-7 text-xs px-2 cursor-pointer"
                          >
                            Ghi nhận thu
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        {selectedInvoice && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  <DialogTitle className="text-lg font-bold">
                    Hóa Đơn {selectedInvoice.invoiceNumber}
                  </DialogTitle>
                </div>
                <StatusBadge status={selectedInvoice.status} size="sm" />
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Kỳ thanh toán: {selectedInvoice.billingPeriod} • Hạn nộp: {selectedInvoice.dueDate}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              {/* Itemized Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-2.5 pl-3">Khoản mục chi phí</th>
                      <th className="p-2.5 pr-3 text-right">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedInvoice.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5 pl-3 text-foreground font-medium">
                          {item.description}
                        </td>
                        <td className="p-2.5 pr-3 text-right font-bold text-foreground">
                          {formatVND(item.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-primary/5 font-extrabold text-foreground">
                      <td className="p-3 pl-3 text-primary text-sm">Tổng cộng thanh toán:</td>
                      <td className="p-3 pr-3 text-right text-primary text-sm">
                        {formatVND(selectedInvoice.totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment History */}
              {selectedInvoice.paymentRecords.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                    Lịch sử thanh toán đã ghi nhận:
                  </span>
                  {selectedInvoice.paymentRecords.map((pr) => (
                    <p key={pr.id} className="text-[11px]">
                      • {pr.paymentDate}: Đã thu <strong>{formatVND(pr.amount)}</strong> qua{" "}
                      {pr.paymentMethod === "bank_transfer" ? "Chuyển khoản ngân hàng" : "Tiền mặt"}{" "}
                      (Mã GD: {pr.referenceCode})
                    </p>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={!!payingInvoice} onOpenChange={(open) => !open && setPayingInvoice(null)}>
        {payingInvoice && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-5 w-5 text-primary" />
                <DialogTitle className="text-lg font-bold">
                  Ghi Nhận Thu Tiền Hóa Đơn
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Xác nhận thu tiền cho hóa đơn <strong>{payingInvoice.invoiceNumber}</strong> (Tổng tiền:{" "}
                <strong>{formatVND(payingInvoice.totalAmount)}</strong>)
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRecordPayment} className="space-y-4 my-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Số tiền thực thu (VND)</label>
                <Input
                  type="number"
                  required
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                  className="text-xs font-bold text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Hình thức thu</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      paymentMethod: e.target.value as "bank_transfer" | "cash",
                    })
                  }
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                  <option value="cash">Tiền mặt tại phòng</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Mã tham chiếu / Mã giao dịch</label>
                <Input
                  value={payForm.referenceCode}
                  onChange={(e) => setPayForm({ ...payForm, referenceCode: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Ghi chú xác nhận</label>
                <Input
                  value={payForm.note}
                  onChange={(e) => setPayForm({ ...payForm, note: e.target.value })}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPayingInvoice(null)}
                >
                  Hủy bỏ
                </Button>
                <Button type="submit" variant="primary" size="sm" className="gap-1">
                  <Check className="h-4 w-4" />
                  Xác nhận đã thu tiền
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </Dialog>

      {/* Create New Invoice Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-bold">Lập Hóa Đơn Thu Phí Mới</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Chốt chỉ số điện, nước và tính tổng tiền phát hành cho khách thuê.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateInvoice} className="space-y-4 my-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Phòng / Hợp đồng</label>
              <select
                value={newInv.contractId}
                onChange={(e) => setNewInv({ ...newInv, contractId: e.target.value })}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {mockContracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    P.101 — {c.contractNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Kỳ thu phí</label>
              <Input
                required
                value={newInv.billingPeriod}
                onChange={(e) => setNewInv({ ...newInv, billingPeriod: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Tiền thuê phòng (VND)</label>
              <Input
                type="number"
                required
                value={newInv.rentAmount}
                onChange={(e) => setNewInv({ ...newInv, rentAmount: Number(e.target.value) })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Hạn nộp tiền</label>
              <Input
                required
                value={newInv.dueDate}
                onChange={(e) => setNewInv({ ...newInv, dueDate: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          {/* Electricity calculation */}
          <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-2">
            <span className="font-bold text-foreground">Chỉ số điện (kWh):</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground">Chỉ số cũ</label>
                <Input
                  type="number"
                  value={newInv.oldElectricity}
                  onChange={(e) =>
                    setNewInv({ ...newInv, oldElectricity: Number(e.target.value) })
                  }
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Chỉ số mới</label>
                <Input
                  type="number"
                  value={newInv.newElectricity}
                  onChange={(e) =>
                    setNewInv({ ...newInv, newElectricity: Number(e.target.value) })
                  }
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Đơn giá (đ/kWh)</label>
                <Input
                  type="number"
                  value={newInv.electricityRate}
                  onChange={(e) =>
                    setNewInv({ ...newInv, electricityRate: Number(e.target.value) })
                  }
                  className="text-xs h-8"
                />
              </div>
            </div>
            <p className="text-[11px] text-primary font-semibold">
              Tiêu thụ: {Math.max(0, newInv.newElectricity - newInv.oldElectricity)} kWh ={" "}
              {formatVND(
                Math.max(0, newInv.newElectricity - newInv.oldElectricity) * newInv.electricityRate
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Tiền nước sinh hoạt (VND)</label>
              <Input
                type="number"
                value={newInv.waterAmount}
                onChange={(e) => setNewInv({ ...newInv, waterAmount: Number(e.target.value) })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Phí dịch vụ & internet (VND)</label>
              <Input
                type="number"
                value={newInv.serviceAmount}
                onChange={(e) => setNewInv({ ...newInv, serviceAmount: Number(e.target.value) })}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(false)}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1">
              <Check className="h-4 w-4" />
              Phát hành hóa đơn
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
