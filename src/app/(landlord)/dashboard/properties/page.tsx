"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  MapPin,
  DoorOpen,
  CheckCircle2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { mockProperties } from "@/mocks/properties";
import { Property, PropertyType } from "@/types";
import { useMockAuth } from "@/lib/auth/mock-auth";

export default function LandlordPropertiesPage() {
  const { user } = useMockAuth();
  const landlordId = user?.id || "usr_landlord_1";
  const [properties, setProperties] = React.useState<Property[]>(() =>
    mockProperties.filter((p) => p.landlordId === landlordId)
  );
  const [showAddModal, setShowAddModal] = React.useState<boolean>(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  // Sync if user switches
  React.useEffect(() => {
    setProperties(mockProperties.filter((p) => p.landlordId === landlordId));
  }, [landlordId]);

  // Form State for new property
  const [newProp, setNewProp] = React.useState({
    name: "",
    type: "boarding_house" as PropertyType,
    address: "",
    ward: "Phường 25",
    district: "Quận Bình Thạnh",
    city: "TP. Hồ Chí Minh",
    totalRooms: 8,
    description: "",
    amenities: ["Thang máy", "Bảo vệ 24/7", "Camera an ninh", "Hầm để xe"],
  });

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProp.name.trim() || !newProp.address.trim()) return;

    const created: Property = {
      id: `prop_${Date.now()}`,
      landlordId,
      name: newProp.name,
      type: newProp.type,
      address: newProp.address,
      ward: newProp.ward,
      district: newProp.district,
      city: newProp.city,
      status: "active",
      totalRooms: Number(newProp.totalRooms),
      availableRooms: Number(newProp.totalRooms),
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
      ],
      amenities: newProp.amenities,
      description: newProp.description || "Tòa nhà dịch vụ cho thuê chất lượng cao.",
      createdAt: "25/11/2026",
    };

    setProperties([created, ...properties]);
    setShowAddModal(false);
    setNewProp({
      name: "",
      type: "boarding_house",
      address: "",
      ward: "Phường 25",
      district: "Quận Bình Thạnh",
      city: "TP. Hồ Chí Minh",
      totalRooms: 8,
      description: "",
      amenities: ["Thang máy", "Bảo vệ 24/7", "Camera an ninh", "Hầm để xe"],
    });
    showNotification("Đã thêm bất động sản mới thành công!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Bất Động Sản Quản Lý
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách các tòa nhà căn hộ, khu nhà trọ và dãy phòng do bạn sở hữu và vận hành.
          </p>
        </div>

        <Button
          variant="accent"
          onClick={() => setShowAddModal(true)}
          className="gap-2 shadow-xs cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Thêm bất động sản
        </Button>
      </div>

      {/* Notification Toast */}
      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((prop) => {
          const occupancyRate =
            prop.totalRooms > 0
              ? Math.round(((prop.totalRooms - prop.availableRooms) / prop.totalRooms) * 100)
              : 0;

          return (
            <div
              key={prop.id}
              className="bg-surface rounded-xl border border-border overflow-hidden hover:border-border-focus transition-all flex flex-col shadow-xs"
            >
              {/* Image banner */}
              <div className="relative h-48 w-full bg-slate-200">
                {prop.images[0] && (
                  <Image
                    src={prop.images[0]}
                    alt={prop.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute top-3 left-3">
                  <StatusBadge status={prop.status} size="sm" appearance="solid" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs p-2 rounded-lg flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <DoorOpen className="h-3.5 w-3.5 text-emerald-400" />
                    <strong>{prop.totalRooms - prop.availableRooms}</strong>/{prop.totalRooms} phòng đã thuê
                  </span>
                  <span className="font-semibold text-emerald-300">
                    {occupancyRate}% lấp đầy
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-heading text-base font-bold text-foreground line-clamp-1">
                    {prop.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{prop.address}, {prop.district}, {prop.city}</span>
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {prop.description}
                  </p>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {prop.amenities.slice(0, 4).map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-muted text-[11px] text-muted-foreground font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                    {prop.amenities.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded bg-muted text-[11px] text-muted-foreground font-medium">
                        +{prop.amenities.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <Link href={`/dashboard/rooms`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
                      <DoorOpen className="h-3.5 w-3.5" />
                      Xem sơ đồ phòng ({prop.totalRooms})
                    </Button>
                  </Link>

                  <Link href="/dashboard/listings/new">
                    <Button variant="ghost" size="sm" className="text-xs text-primary cursor-pointer">
                      + Đăng tin phòng
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Property Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-bold">Thêm Bất Động Sản Mới</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Khai báo thông tin tòa nhà căn hộ, khu trọ để dễ dàng quản lý phòng và xuất hóa đơn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateProperty} className="space-y-4 my-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Tên bất động sản / Tòa nhà <span className="text-danger">*</span>
            </label>
            <Input
              required
              placeholder="VD: Tòa nhà Căn hộ Dịch vụ D2 Bình Thạnh"
              value={newProp.name}
              onChange={(e) => setNewProp({ ...newProp, name: e.target.value })}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Loại hình</label>
              <select
                value={newProp.type}
                onChange={(e) => setNewProp({ ...newProp, type: e.target.value as PropertyType })}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="boarding_house">Dãy phòng trọ / KTX</option>
                <option value="apartment">Căn hộ chung cư</option>
                <option value="studio">Căn hộ Studio</option>
                <option value="house">Nhà nguyên căn</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Tổng số phòng</label>
              <Input
                type="number"
                min={1}
                value={newProp.totalRooms}
                onChange={(e) => setNewProp({ ...newProp, totalRooms: Number(e.target.value) })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Địa chỉ chi tiết <span className="text-danger">*</span>
            </label>
            <Input
              required
              placeholder="VD: 48/12 Nguyễn Gia Trí, Phường 25, Quận Bình Thạnh"
              value={newProp.address}
              onChange={(e) => setNewProp({ ...newProp, address: e.target.value })}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Mô tả đặc điểm</label>
            <Textarea
              rows={3}
              placeholder="Tòa nhà có thang máy, giờ giấc tự do, bảo vệ trực 24/7..."
              value={newProp.description}
              onChange={(e) => setNewProp({ ...newProp, description: e.target.value })}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1">
              <Check className="h-4 w-4" />
              Lưu bất động sản
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
