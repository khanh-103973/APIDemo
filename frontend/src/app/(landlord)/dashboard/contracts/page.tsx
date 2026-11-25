"use client";

import * as React from "react";
import {
  FileText,
  PlusCircle,
  Search,
  CheckCircle2,
  Check,
  AlertCircle,
  Pencil,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatVND } from "@/lib/format/currency";
import {
  getContracts,
  createContractOnApi,
  updateContractOnApi,
  viDateToIsoInput,
} from "@/lib/api/contracts";
import { getViewingRequests } from "@/lib/api/viewings";
import { fetchAllHousesFromApi } from "@/lib/api/listings";
import { Contract, Listing, ViewingRequest } from "@/types";

export default function LandlordContractsPage() {
  const [contracts, setContracts] = React.useState<Contract[]>([]);
  const [bookings, setBookings] = React.useState<ViewingRequest[]>([]);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [showNewModal, setShowNewModal] = React.useState<boolean>(false);
  const [editingContract, setEditingContract] = React.useState<Contract | null>(null);
  const [terminatingContract, setTerminatingContract] = React.useState<Contract | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const getDefaultContractDates = () => {
    const today = new Date();
    const nextYr = new Date(today);
    nextYr.setFullYear(nextYr.getFullYear() + 1);
    return {
      startDate: today.toISOString().split("T")[0],
      endDate: nextYr.toISOString().split("T")[0],
    };
  };

  const [newCt, setNewCt] = React.useState({
    bookingId: "",
    startDate: "",
    endDate: "",
    monthlyRent: 4500000,
    deposit: 4500000,
    terms: "Tiền phòng thanh toán từ ngày 01 đến ngày 05 hàng tháng. Giữ gìn vệ sinh chung và an toàn PCCC.",
  });

  const [editForm, setEditForm] = React.useState({
    monthlyRent: 4500000,
    deposit: 4500000,
    startDate: "",
    endDate: "",
  });

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [apiContracts, apiBookings, apiHouses] = await Promise.all([
        getContracts(),
        getViewingRequests(),
        fetchAllHousesFromApi(),
      ]);
      setContracts(apiContracts);
      setBookings(apiBookings);
      if (apiHouses) setListings(apiHouses);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    void Promise.all([
      getContracts(),
      getViewingRequests(),
      fetchAllHousesFromApi(),
    ])
      .then(([apiContracts, apiBookings, apiHouses]) => {
        if (!active) return;
        setContracts(apiContracts);
        setBookings(apiBookings);
        if (apiHouses) setListings(apiHouses);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const usedBookingIds = React.useMemo(() => {
    return new Set(
      contracts
        .map((c) => c.propertyId.replace("booking_", ""))
        .filter((id) => /^\d+$/.test(id))
    );
  }, [contracts]);

  const eligibleBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      if (!b.id.startsWith("bk_")) return false;
      const numericId = b.id.replace("bk_", "");
      return !usedBookingIds.has(numericId) && b.status !== "cancelled" && b.status !== "rejected";
    });
  }, [bookings, usedBookingIds]);

  const handleOpenNewModal = () => {
    setFormError(null);
    const defaultDates = getDefaultContractDates();
    setNewCt((prev) => ({
      ...prev,
      startDate: prev.startDate || defaultDates.startDate,
      endDate: prev.endDate || defaultDates.endDate,
    }));
    if (eligibleBookings.length > 0) {
      const first = eligibleBookings[0];
      const numericId = first.id.replace("bk_", "");
      const house = listings.find((l) => l.id === first.listingId);
      const rent = house?.rentPrice || 4500000;
      setNewCt((prev) => ({
        ...prev,
        bookingId: numericId,
        monthlyRent: rent,
        deposit: rent,
      }));
    } else {
      setNewCt((prev) => ({ ...prev, bookingId: "" }));
    }
    setShowNewModal(true);
  };

  const handleOpenEditModal = (contract: Contract) => {
    setEditError(null);
    setEditForm({
      monthlyRent: contract.monthlyRent,
      deposit: contract.deposit,
      startDate: viDateToIsoInput(contract.startDate),
      endDate: viDateToIsoInput(contract.endDate),
    });
    setEditingContract(contract);
  };

  const handleSelectBooking = (bookingIdStr: string) => {
    const matched = eligibleBookings.find((b) => b.id === `bk_${bookingIdStr}`);
    const house = matched ? listings.find((l) => l.id === matched.listingId) : undefined;
    setNewCt((prev) => ({
      ...prev,
      bookingId: bookingIdStr,
      monthlyRent: house?.rentPrice || prev.monthlyRent,
      deposit: house?.rentPrice || prev.deposit,
    }));
  };

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredContracts = contracts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !c.contractNumber.toLowerCase().includes(q) &&
        !c.terms.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numericBookingId = Number(newCt.bookingId);
    if (!Number.isInteger(numericBookingId) || numericBookingId <= 0) {
      setFormError("Chưa có lịch đặt phòng (Booking) hợp lệ thuộc nhà của bạn để lập hợp đồng.");
      return;
    }

    const startObj = new Date(`${newCt.startDate}T00:00:00`);
    const endObj = new Date(`${newCt.endDate}T00:00:00`);
    if (Number.isNaN(startObj.getTime()) || Number.isNaN(endObj.getTime()) || endObj <= startObj) {
      setFormError("Ngày kết thúc hợp đồng phải lớn hơn ngày bắt đầu.");
      return;
    }

    setIsSaving(true);
    const result = await createContractOnApi({
      bookingId: numericBookingId,
      monthlyRent: Number(newCt.monthlyRent),
      deposit: Number(newCt.deposit),
      startDateIso: startObj.toISOString(),
      endDateIso: endObj.toISOString(),
      status: "Pending",
    });
    setIsSaving(false);

    if (!result.success) {
      setFormError(result.error || "Không thể tạo hợp đồng. Vui lòng kiểm tra lại.");
      return;
    }

    setShowNewModal(false);
    await loadData();
    showNotification("Đã lập hợp đồng (Chờ khách thuê xác nhận ký) thành công!");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;
    setEditError(null);

    const bookingIdNum = Number(editingContract.propertyId.replace("booking_", ""));
    const startObj = new Date(`${editForm.startDate}T00:00:00`);
    const endObj = new Date(`${editForm.endDate}T00:00:00`);
    if (Number.isNaN(startObj.getTime()) || Number.isNaN(endObj.getTime()) || endObj <= startObj) {
      setEditError("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
      return;
    }

    const backendStatus =
      editingContract.status === "pending"
        ? "Pending"
        : editingContract.status === "expired"
        ? "Expired"
        : editingContract.status === "terminated"
        ? "Terminated"
        : "Active";

    setIsSaving(true);
    const res = await updateContractOnApi(editingContract.id, {
      bookingId: Number.isInteger(bookingIdNum) && bookingIdNum > 0 ? bookingIdNum : 1,
      monthlyRent: Number(editForm.monthlyRent),
      deposit: Number(editForm.deposit),
      startDateIso: startObj.toISOString(),
      endDateIso: endObj.toISOString(),
      status: backendStatus,
    });
    setIsSaving(false);

    if (!res.success) {
      setEditError(res.error || "Không thể cập nhật hợp đồng.");
      return;
    }

    setEditingContract(null);
    await loadData();
    showNotification("Đã cập nhật giá thuê, tiền cọc và thời hạn hợp đồng thành công!");
  };

  const handleConfirmTerminate = async () => {
    if (!terminatingContract) return;
    const bookingIdNum = Number(terminatingContract.propertyId.replace("booking_", ""));
    const startIso = new Date(`${viDateToIsoInput(terminatingContract.startDate)}T00:00:00`).toISOString();
    const endDateObj = new Date(`${viDateToIsoInput(terminatingContract.endDate)}T00:00:00`);
    const startDateObj = new Date(startIso);
    if (endDateObj <= startDateObj) {
      endDateObj.setMonth(startDateObj.getMonth() + 1);
    }

    setIsSaving(true);
    const res = await updateContractOnApi(terminatingContract.id, {
      bookingId: Number.isInteger(bookingIdNum) && bookingIdNum > 0 ? bookingIdNum : 1,
      monthlyRent: terminatingContract.monthlyRent,
      deposit: terminatingContract.deposit,
      startDateIso: startIso,
      endDateIso: endDateObj.toISOString(),
      status: "Terminated",
    });
    setIsSaving(false);

    if (!res.success) {
      showNotification(res.error || "Không thể thanh lý hợp đồng.");
      return;
    }

    setTerminatingContract(null);
    await loadData();
    showNotification("Đã thanh lý hợp đồng! Căn nhà đã tự động mở lại trạng thái Còn trống (Available).");
  };

  const resolveContractMeta = (contract: Contract) => {
    const bookingIdNum = contract.propertyId.replace("booking_", "");
    const booking = bookings.find((b) => b.id === `bk_${bookingIdNum}`);
    const house = booking ? listings.find((l) => l.id === booking.listingId) : undefined;
    return {
      bookingLabel: /^\d+$/.test(bookingIdNum) ? `Booking #${bookingIdNum}` : contract.propertyId,
      houseTitle: house?.title || `Phòng cho thuê (${contract.propertyId})`,
      houseAddress: house ? [house.address, house.district].filter(Boolean).join(", ") : "",
      tenantLabel: booking ? `Khách thuê #${booking.tenantId}` : "Khách thuê",
    };
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
            Lập hợp đồng, thỏa thuận giá thuê/tiền cọc, theo dõi xác nhận ký của khách và thanh lý mở lại phòng.
          </p>
        </div>

        <Button
          variant="accent"
          onClick={handleOpenNewModal}
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
            { key: "all", label: "Tất cả" },
            { key: "pending", label: "Chờ khách ký" },
            { key: "active", label: "Đang hiệu lực" },
            { key: "terminated", label: "Đã thanh lý" },
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
      {isLoading ? (
        <div className="bg-surface rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
          Đang tải danh sách hợp đồng từ SQL Server...
        </div>
      ) : filteredContracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có hợp đồng cho thuê nào"
          description="Khi khách thuê đặt lịch trên nhà của bạn, bạn có thể chốt thuê ở Lịch hẹn hoặc bấm 'Tạo hợp đồng mới'."
          actionLabel="Tạo hợp đồng mới"
          onAction={handleOpenNewModal}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
                  <th className="p-3.5 pl-4">Số Hợp Đồng</th>
                  <th className="p-3.5">Nhà / Booking</th>
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
                  const meta = resolveContractMeta(contract);
                  const canManage = contract.status === "pending" || contract.status === "active";

                  return (
                    <tr key={contract.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 pl-4 font-bold text-foreground">
                        {contract.contractNumber}
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-foreground line-clamp-1 max-w-[200px]">
                          {meta.houseTitle}
                        </span>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {meta.bookingLabel}{meta.houseAddress ? ` • ${meta.houseAddress}` : ""}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-foreground">
                          {meta.tenantLabel}
                        </span>
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
                            className="h-7 text-xs px-2 cursor-pointer"
                          >
                            Chi tiết
                          </Button>
                          {canManage && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEditModal(contract)}
                                className="h-7 text-xs px-2 gap-1 cursor-pointer"
                                title="Sửa giá thuê / tiền cọc / thời hạn"
                              >
                                <Pencil className="h-3 w-3" />
                                Sửa
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTerminatingContract(contract)}
                                className="h-7 text-xs px-2 gap-1 text-danger hover:bg-danger-subtle cursor-pointer"
                                title="Thanh lý hợp đồng và mở lại phòng trống"
                              >
                                <Ban className="h-3 w-3" />
                                Thanh lý
                              </Button>
                            </>
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
      )}

      {/* Contract Detail Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
        {selectedContract && (() => {
          const meta = resolveContractMeta(selectedContract);
          return (
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
                  Ngày lập: {selectedContract.createdAt} ({meta.bookingLabel})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <span className="text-muted-foreground">Nhà cho thuê:</span>
                    <p className="font-bold text-foreground mt-0.5">{meta.houseTitle}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Khách thuê:</span>
                    <p className="font-bold text-foreground mt-0.5">{meta.tenantLabel}</p>
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
                <Button variant="outline" size="sm" onClick={() => setSelectedContract(null)}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          );
        })()}
      </Dialog>

      {/* Edit Rent/Deposit/Dates Modal */}
      <Dialog open={!!editingContract} onOpenChange={(open) => !open && setEditingContract(null)}>
        {editingContract && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Pencil className="h-5 w-5 text-primary" />
                <DialogTitle className="text-lg font-bold">
                  Chỉnh Sửa Hợp Đồng {editingContract.contractNumber}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Điều chỉnh giá thuê, tiền cọc thỏa thuận hoặc thời hạn thuê (lưu trực tiếp qua PUT /api/contracts).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 my-2 text-xs">
              {editError && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Tiền thuê / tháng (VND)</label>
                  <Input
                    type="number"
                    min={100000}
                    step={50000}
                    required
                    value={editForm.monthlyRent}
                    onChange={(e) => setEditForm({ ...editForm, monthlyRent: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Tiền cọc thỏa thuận (VND)</label>
                  <Input
                    type="number"
                    min={0}
                    step={50000}
                    required
                    value={editForm.deposit}
                    onChange={(e) => setEditForm({ ...editForm, deposit: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Ngày bắt đầu</label>
                  <Input
                    type="date"
                    required
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Ngày kết thúc</label>
                  <Input
                    type="date"
                    required
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingContract(null)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving} className="gap-1">
                  <Check className="h-4 w-4" />
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </Dialog>

      {/* Terminate Contract Confirmation Modal */}
      <Dialog open={!!terminatingContract} onOpenChange={(open) => !open && setTerminatingContract(null)}>
        {terminatingContract && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-destructive mb-1">
                <AlertTriangle className="h-5 w-5" />
                <DialogTitle className="text-lg font-bold">
                  Thanh Lý / Kết Thúc Hợp Đồng {terminatingContract.contractNumber}?
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Hợp đồng sẽ chuyển sang trạng thái <strong>Đã thanh lý (Terminated)</strong> và căn nhà gắn với hợp đồng này sẽ tự động mở lại trạng thái <strong>Còn trống (Available)</strong> để khách mới có thể thuê tiếp.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-3">
              <Button variant="outline" size="sm" onClick={() => setTerminatingContract(null)}>
                Không, giữ lại
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={isSaving}
                onClick={() => void handleConfirmTerminate()}
              >
                Xác nhận thanh lý
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
            Chọn Booking thuộc nhà do bạn sở hữu. Hợp đồng sẽ gửi ở trạng thái <strong>Chờ khách ký (Pending)</strong> để khách thuê xác nhận.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateContract} className="space-y-4 my-2 text-xs">
          {formError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {eligibleBookings.length === 0 ? (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <p className="font-bold">Chưa có lịch đặt phòng (Booking) nào thuộc nhà của bạn để lập hợp đồng.</p>
              <p className="text-[11px] leading-relaxed">
                Chủ nhà chỉ được lập hợp đồng cho các Booking của chính căn nhà mình sở hữu (và chưa có hợp đồng trước đó).
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Lịch đặt phòng (Booking của bạn)</label>
              <select
                required
                value={newCt.bookingId}
                onChange={(e) => handleSelectBooking(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {eligibleBookings.map((b) => {
                  const idNum = b.id.replace("bk_", "");
                  const house = listings.find((l) => l.id === b.listingId);
                  return (
                    <option key={b.id} value={idNum}>
                      Booking #{idNum} — {house?.title || b.listingId} (Khách #{b.tenantId})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Tiền thuê / tháng (VND)</label>
              <Input
                type="number"
                min={100000}
                step={50000}
                required
                value={newCt.monthlyRent}
                onChange={(e) => setNewCt({ ...newCt, monthlyRent: Number(e.target.value) })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Tiền cọc thỏa thuận (VND)</label>
              <Input
                type="number"
                min={0}
                step={50000}
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
                type="date"
                required
                value={newCt.startDate}
                onChange={(e) => setNewCt({ ...newCt, startDate: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Ngày kết thúc</label>
              <Input
                type="date"
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
            <Button type="button" variant="outline" size="sm" onClick={() => setShowNewModal(false)}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="gap-1"
              isLoading={isSaving}
              disabled={eligibleBookings.length === 0}
            >
              <Check className="h-4 w-4" />
              Gửi hợp đồng chờ ký
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
