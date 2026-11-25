"use client";

import * as React from "react";
import {
  QrCode,
  Copy,
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatVND } from "@/lib/format/currency";
import { getAllInvoices, saveAllInvoices } from "@/lib/api/invoices";
import { useMockAuth } from "@/lib/auth/mock-auth";
import { Invoice } from "@/types";

export default function TenantInvoicesPage() {
  const { user } = useMockAuth();
  const tenantId = user?.id || "usr_tenant_1";

  const [invoices, setInvoices] = React.useState<Invoice[]>(() =>
    getAllInvoices().filter((i) => i.tenantId === tenantId)
  );

  React.useEffect(() => {
    const handleUpdate = () => {
      setInvoices(getAllInvoices().filter((i) => i.tenantId === tenantId));
    };
    handleUpdate();
    window.addEventListener("house_rental_invoices_change", handleUpdate);
    return () => window.removeEventListener("house_rental_invoices_change", handleUpdate);
  }, [tenantId]);

  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const unpaidInvoice = invoices.find((i) => i.status === "unpaid" || i.status === "overdue");

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleConfirmPaid = (invoiceId: string) => {
    const all = getAllInvoices();
    const updatedAll = all.map((i) =>
      i.id === invoiceId
        ? {
            ...i,
            status: "paid" as const,
            paidAmount: i.totalAmount,
            paymentRecords: [
              ...i.paymentRecords,
              {
                id: `pr_${Date.now()}`,
                invoiceId: i.id,
                amount: i.totalAmount,
                paymentDate: "25/11/2026",
                paymentMethod: "bank_transfer" as const,
                referenceCode: `MB${Date.now().toString().slice(-6)}`,
                note: "Khách xác nhận đã chuyển khoản thành công",
                recordedBy: `${user?.name || "Khách thuê"} (Khách thuê)`,
              },
            ],
          }
        : i
    );

    saveAllInvoices(updatedAll);
    setInvoices(updatedAll.filter((i) => i.tenantId === tenantId));
    setNotice("Đã ghi nhận yêu cầu xác thực thanh toán của bạn!");
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Hóa Đơn & Thanh Toán Tiền Thuê
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi bảng kê chi tiết tiền phòng, chỉ số điện nước hàng tháng và thanh toán qua mã VietQR.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Unpaid Invoice Card with VietQR Box */}
      {unpaidInvoice && (
        <div className="bg-surface rounded-2xl border-2 border-primary/40 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    Hóa Đơn Kỳ {unpaidInvoice.billingPeriod}
                  </h2>
                  <StatusBadge status={unpaidInvoice.status} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Số HĐ: <strong>{unpaidInvoice.invoiceNumber}</strong> • Hạn thanh toán:{" "}
                  <strong className="text-danger">{unpaidInvoice.dueDate}</strong>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-muted-foreground">Tổng số tiền cần thanh toán:</span>
              <p className="font-heading text-2xl font-extrabold text-primary">
                {formatVND(unpaidInvoice.totalAmount)}
              </p>
            </div>
          </div>

          {/* Breakdown & VietQR Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Itemized fees */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Chi tiết các khoản thu
              </h3>
              <div className="rounded-xl border border-border overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3 pl-3.5">Mục chi phí</th>
                      <th className="p-3 pr-3.5 text-right">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {unpaidInvoice.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 pl-3.5 text-foreground font-medium">
                          {item.description}
                        </td>
                        <td className="p-3 pr-3.5 text-right font-bold text-foreground">
                          {formatVND(item.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-primary/5 font-extrabold text-foreground">
                      <td className="p-3 pl-3.5 text-primary text-sm">Cần thanh toán:</td>
                      <td className="p-3 pr-3.5 text-right text-primary text-sm">
                        {formatVND(unpaidInvoice.totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Smart VietQR Payment Box */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <QrCode className="h-4 w-4 text-primary" />
                    Chuyển Khoản Nhanh VietQR (NAPAS 247)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Miễn phí giao dịch
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Mở ứng dụng ngân hàng bất kỳ (VCB, Techcombank, MB, BIDV, MoMo) để quét mã:
                </p>
              </div>

              {/* QR Image representation */}
              <div className="flex items-center gap-4 bg-white p-3.5 rounded-lg border border-border">
                <div className="h-28 w-28 rounded-md bg-slate-100 border border-border flex items-center justify-center shrink-0 p-1">
                  <div className="h-full w-full bg-slate-900 rounded flex flex-col items-center justify-center text-white text-[10px] text-center p-2">
                    <QrCode className="h-8 w-8 mb-1 text-white" />
                    <span className="font-bold">VietQR NAPAS</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs flex-1">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Ngân hàng:</span>
                    <p className="font-bold text-foreground">Vietcombank (VCB)</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Số tài khoản:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-primary">0071001234567</span>
                      <button
                        onClick={() => copyToClipboard("0071001234567", "account")}
                        className="p-1 hover:bg-slate-100 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === "account" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Chủ tài khoản:</span>
                    <p className="font-bold text-foreground uppercase">TRAN MINH DUC</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Nội dung chuyển khoản:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-foreground bg-slate-100 px-1 rounded">
                        {unpaidInvoice.invoiceNumber}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(unpaidInvoice.invoiceNumber, "memo")
                        }
                        className="p-1 hover:bg-slate-100 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Sao chép nội dung"
                      >
                        {copiedField === "memo" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="accent"
                size="sm"
                onClick={() => handleConfirmPaid(unpaidInvoice.id)}
                className="w-full text-xs gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="h-4 w-4" />
                Tôi đã chuyển khoản xong hóa đơn này
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices History */}
      <div className="space-y-3 pt-2">
        <h2 className="font-heading text-base font-bold text-foreground">
          Lịch Sử Hóa Đơn & Biên Lai Thu Phí
        </h2>

        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
                  <th className="p-3.5 pl-4">Mã Hóa Đơn</th>
                  <th className="p-3.5">Kỳ Thanh Toán</th>
                  <th className="p-3.5">Số tiền</th>
                  <th className="p-3.5">Hạn nộp</th>
                  <th className="p-3.5 text-center">Trạng thái</th>
                  <th className="p-3.5 pr-4 text-right">Biên lai thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-4 font-bold text-foreground">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3.5 font-semibold text-foreground">
                      {inv.billingPeriod}
                    </td>
                    <td className="p-3.5 font-bold text-primary">
                      {formatVND(inv.totalAmount)}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {inv.dueDate}
                    </td>
                    <td className="p-3.5 text-center">
                      <StatusBadge status={inv.status} size="sm" />
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      {inv.status === "paid" ? (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đã thanh toán (VCB)
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-semibold">
                          Chờ thanh toán
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
