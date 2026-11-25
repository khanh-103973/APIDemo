"use client";

import * as React from "react";
import {
  FileText,
  Calendar,
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
import { formatVND } from "@/lib/format/currency";
import { mockContracts } from "@/mocks/contracts";
import { mockProperties, mockRooms } from "@/mocks/properties";
import { Contract } from "@/types";

export default function TenantContractsPage() {
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);

  // Contracts for tenant 1
  const myContracts = mockContracts.filter((c) => c.tenantId === "usr_tenant_1");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Hợp Đồng Thuê Của Tôi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi các hợp đồng thuê phòng, điều khoản bảo vệ quyền lợi và biên lai cọc.
        </p>
      </div>

      {/* Contract Cards */}
      <div className="space-y-4">
        {myContracts.map((contract) => {
          const room = mockRooms.find((r) => r.id === contract.roomId);
          const property = mockProperties.find((p) => p.id === contract.propertyId);

          return (
            <div
              key={contract.id}
              className="bg-surface rounded-xl border border-border p-5 hover:border-border-focus transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    Hợp đồng số: {contract.contractNumber}
                  </span>
                  <StatusBadge status={contract.status} size="sm" />
                </div>

                <p className="text-xs text-foreground font-semibold">
                  Phòng {room?.roomNumber || "P.101"} — {property?.name}
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

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedContract(contract)}
                  className="text-xs cursor-pointer"
                >
                  Xem điều khoản
                </Button>
              </div>
            </div>
          );
        })}
      </div>

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
    </div>
  );
}
