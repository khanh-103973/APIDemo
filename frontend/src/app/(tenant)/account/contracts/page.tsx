"use client";

import * as React from "react";
import {
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  signContractOnApi,
  rejectContractOnApi,
} from "@/lib/api/contracts";
import { getViewingRequests } from "@/lib/api/viewings";
import { fetchAllHousesFromApi } from "@/lib/api/listings";
import { Contract, Listing, ViewingRequest } from "@/types";

export default function TenantContractsPage() {
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<Contract | null>(null);
  const [myContracts, setMyContracts] = React.useState<Contract[]>([]);
  const [bookings, setBookings] = React.useState<ViewingRequest[]>([]);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [apiContracts, apiBookings, apiHouses] = await Promise.all([
        getContracts(),
        getViewingRequests(),
        fetchAllHousesFromApi(),
      ]);
      setMyContracts(apiContracts);
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
        setMyContracts(apiContracts);
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

  const handleSign = async (contract: Contract) => {
    setBusyId(contract.id);
    setErrorMsg(null);
    const res = await signContractOnApi(contract.id);
    setBusyId(null);

    if (!res.success) {
      setErrorMsg(res.error || "Không thể xác nhận ký hợp đồng.");
      return;
    }

    setNotice(res.message || "Bạn đã xác nhận ký hợp đồng thành công! Hợp đồng đã có hiệu lực.");
    setTimeout(() => setNotice(null), 4000);
    await loadData();
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);
    setErrorMsg(null);
    const res = await rejectContractOnApi(rejectTarget.id);
    setBusyId(null);

    if (!res.success) {
      setErrorMsg(res.error || "Không thể từ chối hợp đồng.");
      return;
    }

    setRejectTarget(null);
    setNotice(res.message || "Đã từ chối hợp đồng. Căn phòng đã trở về trạng thái còn trống.");
    setTimeout(() => setNotice(null), 4000);
    await loadData();
  };

  const resolveHouseTitle = (contract: Contract) => {
    const bookingIdNum = contract.propertyId.replace("booking_", "");
    const booking = bookings.find((b) => b.id === `bk_${bookingIdNum}`);
    const house = booking ? listings.find((l) => l.id === booking.listingId) : undefined;
    if (house) {
      return `${house.title} — ${[house.address, house.district].filter(Boolean).join(", ")}`;
    }
    return `Hợp đồng gắn với mã đặt lịch #${bookingIdNum}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Hợp Đồng Thuê Của Tôi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kiểm tra điều khoản, xác nhận ký hợp đồng do chủ nhà gửi và theo dõi hiệu lực cư trú từ SQL Server.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="bg-surface rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
          Đang tải hợp đồng của bạn...
        </div>
      ) : myContracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Bạn chưa có hợp đồng thuê nào"
          description="Sau khi đặt lịch xem phòng và chủ nhà gửi hợp đồng cho bạn, hợp đồng sẽ hiển thị tại đây để bạn xác nhận ký."
        />
      ) : (
        <div className="space-y-4">
          {myContracts.map((contract) => {
            const isPendingSign = contract.status === "pending";

            return (
              <div
                key={contract.id}
                className={`bg-surface rounded-xl border p-5 transition-all flex flex-col gap-4 shadow-xs ${
                  isPendingSign
                    ? "border-amber-300 ring-1 ring-amber-200"
                    : "border-border hover:border-border-focus"
                }`}
              >
                {isPendingSign && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Chờ bạn xác nhận ký:</strong> Vui lòng kiểm tra giá thuê, tiền cọc và thời hạn rồi bấm <strong>Đồng ý &amp; Ký hợp đồng</strong> để kích hoạt.
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                        Hợp đồng số: {contract.contractNumber}
                      </span>
                      <StatusBadge status={contract.status} size="sm" />
                    </div>

                    <p className="text-xs text-foreground font-semibold">
                      {resolveHouseTitle(contract)}
                    </p>

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Thời hạn: <strong>{contract.startDate}</strong> đến <strong>{contract.endDate}</strong>
                    </p>

                    <div className="flex items-center gap-4 text-xs pt-1">
                      <span className="text-muted-foreground">
                        Tiền thuê: <strong className="text-primary">{formatVND(contract.monthlyRent)}/tháng</strong>
                      </span>
                      <span>•</span>
                      <span className="text-muted-foreground">
                        Tiền cọc: <strong className="text-foreground">{formatVND(contract.deposit)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedContract(contract)}
                      className="text-xs cursor-pointer"
                    >
                      Xem điều khoản
                    </Button>

                    {isPendingSign && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={busyId === contract.id}
                          onClick={() => void handleSign(contract)}
                          className="text-xs gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đồng ý &amp; Ký hợp đồng
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === contract.id}
                          onClick={() => setRejectTarget(contract)}
                          className="text-xs gap-1 text-danger hover:bg-danger-subtle cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Từ chối
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contract Terms Dialog */}
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
                Hiệu lực từ {selectedContract.startDate} đến {selectedContract.endDate}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <span className="text-muted-foreground">Giá thuê hàng tháng:</span>
                  <p className="font-bold text-primary mt-0.5">
                    {formatVND(selectedContract.monthlyRent)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tiền đặt cọc phòng:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {formatVND(selectedContract.deposit)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày nộp tiền phòng:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    Từ ngày 01 đến ngày 05 hàng tháng
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Chu kỳ thanh toán:</span>
                  <p className="font-semibold text-foreground mt-0.5">Hàng tháng</p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-background space-y-1.5">
                <span className="font-bold text-foreground">Điều khoản thỏa thuận chung:</span>
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
        )}
      </Dialog>

      {/* Reject Contract Confirmation */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        {rejectTarget && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-destructive mb-1">
                <AlertTriangle className="h-5 w-5" />
                <DialogTitle className="text-lg font-bold">
                  Từ chối ký hợp đồng {rejectTarget.contractNumber}?
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Nếu từ chối, hợp đồng này sẽ bị hủy và căn phòng sẽ mở lại cho khách khác thuê.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-3">
              <Button variant="outline" size="sm" onClick={() => setRejectTarget(null)}>
                Quay lại
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={busyId === rejectTarget.id}
                onClick={() => void handleConfirmReject()}
              >
                Xác nhận từ chối
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
