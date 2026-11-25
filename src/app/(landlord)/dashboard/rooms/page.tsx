"use client";

import * as React from "react";
import Link from "next/link";
import {
  DoorOpen,
  PlusCircle,
  Search,
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
import { formatVND } from "@/lib/format/currency";
import { mockRooms, mockProperties } from "@/mocks/properties";
import { mockUsers } from "@/mocks/users";
import { Room, RoomStatus } from "@/types";
import { useMockAuth, getAllUsers } from "@/lib/auth/mock-auth";

export default function LandlordRoomsPage() {
  const { user } = useMockAuth();
  const landlordId = user?.id || "usr_landlord_1";
  const landlordProperties = React.useMemo(() => {
    return mockProperties.filter((p) => p.landlordId === landlordId);
  }, [landlordId]);

  const propertyIds = React.useMemo(() => {
    return new Set(landlordProperties.map((p) => p.id));
  }, [landlordProperties]);

  const [rooms, setRooms] = React.useState<Room[]>(() =>
    mockRooms.filter((r) => propertyIds.has(r.propertyId))
  );

  React.useEffect(() => {
    setRooms(mockRooms.filter((r) => propertyIds.has(r.propertyId)));
  }, [propertyIds]);

  const [propertyFilter, setPropertyFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const filteredRooms = React.useMemo(() => {
    return rooms.filter((r) => {
      if (propertyFilter !== "all" && r.propertyId !== propertyFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!r.roomNumber.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [rooms, propertyFilter, statusFilter, searchQuery]);

  const stats = React.useMemo(() => {
    return {
      total: rooms.length,
      occupied: rooms.filter((r) => r.status === "occupied").length,
      available: rooms.filter((r) => r.status === "available").length,
      maintenance: rooms.filter((r) => r.status === "maintenance").length,
    };
  }, [rooms]);

  const handleUpdateStatus = (roomId: string, newStatus: RoomStatus) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
    );
    if (selectedRoom && selectedRoom.id === roomId) {
      setSelectedRoom((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showNotification(`Đã cập nhật trạng thái phòng thành công.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Sơ Đồ & Danh Sách Phòng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi tình trạng sử dụng, khách thuê hiện tại và quản lý bảo trì từng phòng trọ.
          </p>
        </div>

        <Link href="/dashboard/listings/new">
          <Button variant="accent" className="gap-2 shadow-xs cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            Đăng tin cho thuê phòng
          </Button>
        </Link>
      </div>

      {/* Action Notice */}
      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface p-4 rounded-xl border border-border">
          <span className="text-xs text-muted-foreground font-medium">Tổng số phòng</span>
          <p className="font-heading text-2xl font-bold text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border">
          <span className="text-xs text-emerald-700 font-semibold">Đang có khách thuê</span>
          <p className="font-heading text-2xl font-bold text-emerald-700 mt-1">{stats.occupied}</p>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border">
          <span className="text-xs text-primary font-semibold">Phòng trống</span>
          <p className="font-heading text-2xl font-bold text-primary mt-1">{stats.available}</p>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border">
          <span className="text-xs text-amber-700 font-semibold">Đang bảo trì</span>
          <p className="font-heading text-2xl font-bold text-amber-700 mt-1">{stats.maintenance}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo số phòng (VD: P.101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background h-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-60">
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Tất cả Bất Động Sản</option>
              {landlordProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="occupied">Đang ở</option>
              <option value="available">Còn trống</option>
              <option value="maintenance">Bảo trì</option>
              <option value="reserved">Đã đặt chỗ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const property = landlordProperties.find((p) => p.id === room.propertyId);
          const allUsers = getAllUsers();
          const tenant = room.currentTenantId
            ? allUsers.find((u) => u.id === room.currentTenantId) ||
              mockUsers.find((u) => u.id === room.currentTenantId)
            : null;

          return (
            <div
              key={room.id}
              className="bg-surface rounded-xl border border-border p-4 hover:border-border-focus transition-all flex flex-col justify-between shadow-xs space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-lg font-bold text-foreground">
                      {room.roomNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">Tầng {room.floor}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                    {property?.name}
                  </p>
                </div>
                <StatusBadge status={room.status} size="sm" />
              </div>

              {/* Price & Specs */}
              <div className="space-y-1 py-1 border-y border-border/60 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá thuê:</span>
                  <span className="font-bold text-primary">{formatVND(room.basePrice)}/tháng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diện tích:</span>
                  <span className="font-semibold text-foreground">{room.area} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khách thuê:</span>
                  <span className="font-semibold text-foreground truncate max-w-[120px]">
                    {tenant ? tenant.fullName || (tenant as any).name : "—"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRoom(room)}
                  className="w-full text-[11px] h-7 cursor-pointer"
                >
                  Chi tiết phòng
                </Button>

                {room.status === "available" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpdateStatus(room.id, "occupied")}
                    className="h-7 text-[11px] text-emerald-700 hover:bg-emerald-50 cursor-pointer shrink-0"
                    title="Ghi nhận khách vào ở"
                  >
                    Vào ở
                  </Button>
                ) : room.status === "occupied" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpdateStatus(room.id, "available")}
                    className="h-7 text-[11px] text-muted-foreground hover:bg-muted cursor-pointer shrink-0"
                    title="Khách trả phòng"
                  >
                    Trả phòng
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Details Modal */}
      <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
        {selectedRoom && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-5 w-5 text-primary" />
                  <DialogTitle className="text-lg font-bold">
                    Chi Tiết Phòng {selectedRoom.roomNumber}
                  </DialogTitle>
                </div>
                <StatusBadge status={selectedRoom.status} size="sm" />
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Tòa nhà: {landlordProperties.find((p) => p.id === selectedRoom.propertyId)?.name} (Tầng {selectedRoom.floor})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <span className="text-muted-foreground">Diện tích phòng:</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">{selectedRoom.area} m²</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Giá thuê chuẩn:</span>
                  <p className="font-bold text-primary text-sm mt-0.5">
                    {formatVND(selectedRoom.basePrice)}/tháng
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tiền đặt cọc:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {formatVND(selectedRoom.deposit)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Khách thuê hiện tại:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedRoom.currentTenantId
                      ? mockUsers.find((u) => u.id === selectedRoom.currentTenantId)?.name
                      : "Chưa có"}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-1.5">
                <span className="font-bold text-foreground">Trang thiết bị sẵn có trong phòng:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedRoom.amenities.map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-slate-100 border border-border text-[11px] text-foreground font-medium"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Change Status Controls */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className="font-bold text-foreground">Thay đổi trạng thái phòng:</span>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Button
                    type="button"
                    variant={selectedRoom.status === "available" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedRoom.id, "available")}
                    className="text-xs"
                  >
                    Còn trống
                  </Button>
                  <Button
                    type="button"
                    variant={selectedRoom.status === "occupied" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedRoom.id, "occupied")}
                    className="text-xs"
                  >
                    Đang ở
                  </Button>
                  <Button
                    type="button"
                    variant={selectedRoom.status === "maintenance" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedRoom.id, "maintenance")}
                    className="text-xs"
                  >
                    Bảo trì
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRoom(null)}
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
