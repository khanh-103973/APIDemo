"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { ViewingRequest, Listing } from "@/types";
import { getMockTenantViewings, cancelMockViewing } from "@/lib/auth/mock-auth";
import { mockListings } from "@/mocks/listings";
import { getAllListingsFromStorage } from "@/lib/api/landlord";
import { Card } from "@/components/ui/card";
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

export default function TenantViewingsPage() {
  const router = useRouter();
  const [viewings, setViewings] = React.useState<ViewingRequest[]>(getMockTenantViewings);
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [cancelTargetId, setCancelTargetId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleSync = () => {
      setViewings(getMockTenantViewings());
    };
    window.addEventListener("house_rental_viewings_change", handleSync);
    return () => window.removeEventListener("house_rental_viewings_change", handleSync);
  }, []);

  const handleConfirmCancel = () => {
    if (!cancelTargetId) return;
    const updated = cancelMockViewing(cancelTargetId);
    setViewings(updated);
    setCancelTargetId(null);
  };

  const filteredViewings = viewings.filter((v) => {
    if (activeTab === "all") return true;
    return v.status === activeTab;
  });

  const getListing = (listingId: string): Listing | undefined => {
    return (
      getAllListingsFromStorage().find((l) => l.id === listingId) ||
      mockListings.find((l) => l.id === listingId)
    );
  };

  const tabs: { label: string; value: string; count?: number }[] = [
    { label: "Tất cả", value: "all", count: viewings.length },
    {
      label: "Chờ xác nhận",
      value: "pending",
      count: viewings.filter((v) => v.status === "pending").length,
    },
    {
      label: "Đã xác nhận",
      value: "confirmed",
      count: viewings.filter((v) => v.status === "confirmed").length,
    },
    {
      label: "Đã hoàn thành",
      value: "completed",
      count: viewings.filter((v) => v.status === "completed").length,
    },
    {
      label: "Đã hủy",
      value: "cancelled",
      count: viewings.filter((v) => v.status === "cancelled").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Lịch hẹn xem phòng
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Theo dõi trạng thái các cuộc hẹn xem phòng trực tiếp với chủ nhà
        </p>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-border">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-2 text-xs font-semibold rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-card text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              {Boolean(tab.count) && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive
                      ? "bg-purple-100 text-purple-700 font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Viewings List */}
      {filteredViewings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Không có lịch hẹn nào"
          description="Bạn chưa có lịch hẹn xem phòng nào trong trạng thái này. Hãy tìm phòng phù hợp và đặt lịch hẹn với chủ nhà."
          actionLabel="Tìm phòng cho thuê"
          onAction={() => {
            router.push("/listings");
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredViewings.map((viewing) => {
            const listing = getListing(viewing.listingId);
            const canCancel = viewing.status === "pending" || viewing.status === "confirmed";

            return (
              <Card key={viewing.id} className="overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row gap-5 justify-between">
                  {/* Left: Thumbnail & Listing Info */}
                  <div className="flex gap-4">
                    {listing && (
                      <div className="h-20 w-24 sm:h-24 sm:w-32 rounded-md overflow-hidden bg-muted shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={viewing.status} />
                        <span className="text-xs text-muted-foreground">
                          Mã yêu cầu: #{viewing.id}
                        </span>
                      </div>

                      <h3 className="font-heading text-base font-bold text-foreground truncate max-w-md">
                        {listing?.title || "Tin đăng phòng cho thuê"}
                      </h3>

                      {listing && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{listing.address}, {listing.district}</span>
                        </div>
                      )}

                      {/* Tenant Note */}
                      {viewing.tenantNote && (
                        <p className="text-xs text-slate-600 bg-surface p-2 rounded border border-border mt-1">
                          <strong className="text-foreground">Ghi chú của bạn:</strong> {viewing.tenantNote}
                        </p>
                      )}

                      {/* Landlord Note / Confirmation */}
                      {viewing.landlordNote && (
                        <div className="flex items-start gap-1.5 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded border border-emerald-200 mt-2">
                          <MessageSquare className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                          <p>
                            <strong>Phản hồi từ chủ nhà:</strong> {viewing.landlordNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Appointment Time & Actions */}
                  <div className="flex sm:flex-col justify-between sm:justify-start sm:items-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                    <div className="text-left sm:text-right space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground sm:justify-end">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{viewing.preferredDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{viewing.preferredTimeSlot}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      {listing && (
                        <Link href={`/listings/${listing.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <span>Chi tiết</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}

                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-red-50 hover:text-red-700"
                          onClick={() => setCancelTargetId(viewing.id)}
                        >
                          Hủy hẹn
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Cancelling Viewing */}
      <Dialog
        open={Boolean(cancelTargetId)}
        onOpenChange={(open) => {
          if (!open) setCancelTargetId(null);
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Xác nhận hủy lịch hẹn xem phòng?</DialogTitle>
          </div>
          <DialogDescription>
            Bạn có chắc chắn muốn hủy cuộc hẹn này? Chủ nhà sẽ nhận được thông báo về việc hủy hẹn của bạn.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setCancelTargetId(null)}>
            Không, giữ lại
          </Button>
          <Button variant="destructive" onClick={handleConfirmCancel}>
            Xác nhận hủy hẹn
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
