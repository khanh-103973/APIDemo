"use client";

import * as React from "react";
import Image from "next/image";
import {
  Search,
  CheckCircle2,
  Lock,
  Unlock,
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
import { getAdminUsers, fetchAdminUsersFromApi, toggleAdminUserStatus } from "@/lib/api/admin";
import { User } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setUsers(getAdminUsers());
    void fetchAdminUsersFromApi().then((data) => {
      if (active && data.length > 0) setUsers(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleToggleStatus = (userId: string) => {
    const updated = toggleAdminUserStatus(userId);
    setUsers(updated);
    const target = updated.find((u) => u.id === userId);
    showNotification(
      target?.status === "suspended"
        ? `Đã tạm khóa tài khoản của ${target.name}.`
        : `Đã mở khóa hoạt động cho tài khoản ${target?.name}.`
    );
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.phone.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Quản Lý Tài Khoản Người Dùng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi danh sách người dùng toàn hệ thống, phân quyền vai trò và quản lý tình trạng khóa tài khoản.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-border flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background h-9 text-xs"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="tenant">Khách tìm thuê</option>
            <option value="landlord">Chủ nhà cho thuê</option>
            <option value="admin">Quản trị viên</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="suspended">Đã tạm khóa</option>
          </select>
        </div>

        <span className="text-xs text-muted-foreground self-end md:self-center">
          Tổng cộng: <strong className="text-foreground">{filteredUsers.length}</strong> tài khoản
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-4">Họ và tên</th>
                <th className="p-3.5">Thông tin liên hệ</th>
                <th className="p-3.5">Vai trò</th>
                <th className="p-3.5 text-center">Trạng thái</th>
                <th className="p-3.5">Ngày tham gia</th>
                <th className="p-3.5 pr-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-border">
                        {user.avatar ? (
                          <Image src={user.avatar} alt={user.name} fill sizes="36px" className="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-primary">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="font-bold text-foreground hover:text-primary transition-colors text-xs cursor-pointer text-left"
                        >
                          {user.name}
                        </button>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <p className="font-medium text-foreground">{user.email}</p>
                    <p className="text-[11px] text-muted-foreground">{user.phone}</p>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        user.role === "admin"
                          ? "bg-slate-900 text-amber-300"
                          : user.role === "landlord"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {user.role === "admin"
                        ? "Admin"
                        : user.role === "landlord"
                        ? "Chủ nhà"
                        : "Khách thuê"}
                    </span>
                  </td>

                  <td className="p-3.5 text-center whitespace-nowrap">
                    <StatusBadge status={user.status} size="sm" />
                  </td>

                  <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                    {user.createdAt}
                  </td>

                  <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="h-7 text-xs px-2 cursor-pointer"
                      >
                        Chi tiết
                      </Button>

                      {user.role !== "admin" && (
                        <Button
                          variant={user.status === "suspended" ? "primary" : "destructive"}
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                          className="h-7 text-xs px-2 cursor-pointer gap-1"
                        >
                          {user.status === "suspended" ? (
                            <>
                              <Unlock className="h-3 w-3" />
                              Mở khóa
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              Khóa
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        {selectedUser && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-200 border border-border">
                  {selectedUser.avatar && (
                    <Image src={selectedUser.avatar} alt={selectedUser.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">{selectedUser.name}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Vai trò: {selectedUser.role.toUpperCase()} • Ngày tạo: {selectedUser.createdAt}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedUser.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Địa chỉ Email:</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái tài khoản:</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedUser.status} size="sm" />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Mã định danh hệ thống:</span>
                  <p className="font-mono text-muted-foreground mt-0.5">{selectedUser.id}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(null)}
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
