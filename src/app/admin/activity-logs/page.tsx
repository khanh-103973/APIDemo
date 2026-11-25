"use client";

import * as React from "react";
import {
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAdminActivityLogs } from "@/lib/api/admin";
import { ActivityLog } from "@/types";

export default function AdminActivityLogsPage() {
  const [logs] = React.useState<ActivityLog[]>(getAdminActivityLogs);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filtered = logs.filter((log) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Nhật Ký Hoạt Động & Kiểm Toán Hệ Thống
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi toàn bộ lịch sử các tác vụ quản trị, phê duyệt tin đăng và can thiệp tài khoản trên sàn.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-border flex items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo hành động, nội dung, quản trị viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background h-9 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Tổng cộng: <strong className="text-foreground">{filtered.length}</strong> sự kiện
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-4">Thời gian</th>
                <th className="p-3.5">Quản trị viên</th>
                <th className="p-3.5">Hành động can thiệp</th>
                <th className="p-3.5">Đối tượng</th>
                <th className="p-3.5 pr-4">Nội dung chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 pl-4 whitespace-nowrap text-muted-foreground font-mono">
                    {item.timestamp}
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-bold text-foreground">{item.userName}</span>
                    <span className="block text-[10px] text-amber-700 font-semibold uppercase">
                      {item.userRole}
                    </span>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-semibold text-primary">{item.action}</span>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-semibold text-muted-foreground uppercase">
                      {item.entityType}
                    </span>
                  </td>

                  <td className="p-3.5 pr-4 text-foreground">
                    {item.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
