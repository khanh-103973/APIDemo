"use client";

import * as React from "react";
import {
  Wrench,
  CheckCircle2,
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
import { mockIssueReports } from "@/mocks/issues";
import { mockRooms, mockProperties } from "@/mocks/properties";
import { mockUsers } from "@/mocks/users";
import { IssueReport, IssueStatus } from "@/types";

export default function LandlordMaintenancePage() {
  const [issues, setIssues] = React.useState<IssueReport[]>(mockIssueReports);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedIssue, setSelectedIssue] = React.useState<IssueReport | null>(null);
  const [noteInput, setNoteInput] = React.useState<string>("");
  const [notice, setNotice] = React.useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleUpdateStatus = (id: string, status: IssueStatus) => {
    const updated = issues.map((iss) =>
      iss.id === id ? { ...iss, status, landlordNote: noteInput || iss.landlordNote } : iss
    );
    setIssues(updated);
    if (selectedIssue && selectedIssue.id === id) {
      setSelectedIssue((prev) => (prev ? { ...prev, status, landlordNote: noteInput || prev.landlordNote } : null));
    }
    showNotification("Đã cập nhật tiến độ xử lý bảo trì!");
  };

  const filtered = issues.filter((iss) => {
    if (statusFilter !== "all" && iss.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Yêu Cầu Bảo Trì & Sự Cố
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tiếp nhận và theo dõi tiến độ sửa chữa thiết bị, điện nước từ khách thuê tại các phòng.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm scrollbar-none">
        {[
          { key: "all", label: "Tất cả yêu cầu" },
          { key: "pending", label: "Chờ tiếp nhận" },
          { key: "in_progress", label: "Đang sửa chữa" },
          { key: "resolved", label: "Đã hoàn thành" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
              statusFilter === tab.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-surface text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const room = mockRooms.find((r) => r.id === item.roomId);
          const property = mockProperties.find((p) => p.id === item.propertyId);
          const tenant = mockUsers.find((u) => u.id === item.tenantId);

          return (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-border bg-surface hover:border-border-focus transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-sm">
                    {item.title}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                  <span className="px-2 py-0.5 rounded bg-muted text-[11px] text-muted-foreground font-medium">
                    {item.category === "appliance"
                      ? "Điện lạnh & Thiết bị"
                      : item.category === "plumbing"
                      ? "Đường ống nước"
                      : "Điện & Chiếu sáng"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                  <span>
                    Vị trí: <strong className="text-foreground">{room?.roomNumber || "P.101"}</strong> ({property?.name})
                  </span>
                  <span>•</span>
                  <span>
                    Người báo: <strong className="text-foreground">{tenant?.name}</strong>
                  </span>
                  <span>•</span>
                  <span>Ngày gửi: {item.createdAt}</span>
                </div>

                {item.landlordNote && (
                  <div className="p-2.5 rounded-md bg-purple-50/60 border border-purple-200 text-xs text-purple-900 mt-2">
                    <strong>Ghi chú xử lý:</strong> {item.landlordNote}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedIssue(item);
                    setNoteInput(item.landlordNote || "");
                  }}
                  className="text-xs cursor-pointer"
                >
                  Cập nhật tiến độ
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Update Progress Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
        {selectedIssue && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="h-5 w-5 text-primary" />
                <DialogTitle className="text-lg font-bold">
                  Cập Nhật Tiến Độ Bảo Trì
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Sự cố: <strong>{selectedIssue.title}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Ghi chú cho khách thuê</label>
                <Input
                  placeholder="VD: Đã hẹn thợ 9h sáng mai qua kiểm tra..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className="font-bold text-foreground">Trạng thái xử lý:</span>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Button
                    type="button"
                    variant={selectedIssue.status === "pending" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedIssue.id, "pending")}
                    className="text-xs"
                  >
                    Chờ tiếp nhận
                  </Button>
                  <Button
                    type="button"
                    variant={selectedIssue.status === "in_progress" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedIssue.id, "in_progress")}
                    className="text-xs"
                  >
                    Đang sửa chữa
                  </Button>
                  <Button
                    type="button"
                    variant={selectedIssue.status === "resolved" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedIssue.id, "resolved")}
                    className="text-xs"
                  >
                    Đã hoàn thành
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIssue(null)}
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
