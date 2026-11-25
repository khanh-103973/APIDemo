"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Search,
  Eye,
  ExternalLink,
  EyeOff,
  Trash2,
  CheckCircle,
  AlertTriangle,
  LayoutGrid,
  List,
  Check,
  RefreshCw,
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
import {
  getLandlordListings,
  fetchLandlordListingsFromApi,
  updateLandlordListingStatus,
  deleteLandlordListing,
} from "@/lib/api/landlord";
import { Listing, ListingStatus } from "@/types";

export default function LandlordListingsPage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [propertyFilter, setPropertyFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [listingToDelete, setListingToDelete] = React.useState<Listing | null>(null);
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setListings(getLandlordListings());
    void fetchLandlordListingsFromApi().then((data) => {
      if (active && data.length > 0) setListings(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Filter listings
  const filteredListings = React.useMemo(() => {
    return listings.filter((item) => {
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      // Property filter
      if (propertyFilter !== "all" && item.propertyId !== propertyFilter) {
        return false;
      }
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesAddress = item.address.toLowerCase().includes(q);
        const matchesDistrict = item.district.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAddress && !matchesDistrict) return false;
      }
      return true;
    });
  }, [listings, statusFilter, propertyFilter, searchQuery]);

  // Counts for pills
  const counts = React.useMemo(() => {
    return {
      all: listings.length,
      active: listings.filter((l) => l.status === "active").length,
      pending: listings.filter((l) => l.status === "pending").length,
      rented: listings.filter((l) => l.status === "rented").length,
      draft: listings.filter((l) => l.status === "draft").length,
      hidden: listings.filter((l) => l.status === "hidden").length,
    };
  }, [listings]);

  // Status toggle handler
  const handleToggleHide = (id: string, currentStatus: ListingStatus) => {
    const nextStatus = currentStatus === "hidden" ? "active" : "hidden";
    const updated = updateLandlordListingStatus(id, nextStatus);
    setListings(updated);
    showNotification(
      nextStatus === "hidden"
        ? "Đã tạm ẩn tin đăng khỏi trang tìm kiếm công khai."
        : "Đã bật hiển thị lại tin đăng trên sàn."
    );
  };

  const handleMarkRented = (id: string, currentStatus: ListingStatus) => {
    const nextStatus = currentStatus === "rented" ? "active" : "rented";
    const updated = updateLandlordListingStatus(id, nextStatus);
    setListings(updated);
    showNotification(
      nextStatus === "rented"
        ? "Đã chuyển trạng thái sang Đã cho thuê."
        : "Đã chuyển trạng thái sang Đang hoạt động."
    );
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!listingToDelete) return;
    const updated = deleteLandlordListing(listingToDelete.id);
    setListings(updated);
    setListingToDelete(null);
    showNotification("Đã xóa tin đăng thành công.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Quản Lý Tin Đăng Cho Thuê
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi danh sách tin đăng, lượt xem, tình trạng duyệt và trạng thái hiển thị của bạn.
          </p>
        </div>

        <Link href="/dashboard/listings/new">
          <Button variant="accent" className="gap-2 shadow-xs cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            Tạo tin đăng mới
          </Button>
        </Link>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Status Filter Tabs / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm scrollbar-none">
        {[
          { key: "all", label: "Tất cả", count: counts.all },
          { key: "active", label: "Đang hiển thị", count: counts.active },
          { key: "pending", label: "Chờ kiểm duyệt", count: counts.pending },
          { key: "rented", label: "Đã cho thuê", count: counts.rented },
          { key: "hidden", label: "Đã tạm ẩn", count: counts.hidden },
          { key: "draft", label: "Bản nháp", count: counts.draft },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-surface text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="bg-surface p-4 rounded-xl border border-border flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tiêu đề, địa chỉ, quận/huyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background h-9 text-xs"
            />
          </div>

          <div className="w-48 hidden sm:block">
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Tất cả Bất Động Sản</option>
              <option value="prop_1">Tòa nhà D2 Bình Thạnh</option>
              <option value="prop_2">Sunrise City View Q7</option>
              <option value="prop_3">Hương House Q1</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-background">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                viewMode === "table" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Dạng bảng chi tiết"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Dạng lưới thẻ"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Listing Content: Table or Grid View */}
      {filteredListings.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-muted-foreground flex items-center justify-center mx-auto">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">
              Không tìm thấy tin đăng phù hợp
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Không có tin nào khớp với tiêu chí tìm kiếm hoặc bộ lọc trạng thái hiện tại của bạn.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
                setPropertyFilter("all");
              }}
              className="text-xs gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Đặt lại bộ lọc
            </Button>
            <Link href="/dashboard/listings/new">
              <Button variant="accent" size="sm" className="text-xs gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                Tạo tin mới
              </Button>
            </Link>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
                  <th className="p-3.5 pl-4">Tin đăng & Địa chỉ</th>
                  <th className="p-3.5">Giá thuê / tháng</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 text-center">Lượt xem</th>
                  <th className="p-3.5">Ngày tạo</th>
                  <th className="p-3.5 pr-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredListings.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* Column 1: Info & Image */}
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-18 rounded-md overflow-hidden bg-slate-200 shrink-0 border border-border">
                          {item.images[0] ? (
                            <Image
                              src={item.images[0]}
                              alt={item.title}
                              fill
                              sizes="72px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                              Không ảnh
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/listings/${item.id}`}
                            className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1 text-xs"
                          >
                            {item.title}
                          </Link>
                          <p className="text-muted-foreground text-[11px] mt-0.5 line-clamp-1">
                            {item.address}, {item.district}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                            <span>{item.area}m²</span>
                            <span>•</span>
                            <span>{item.bedrooms} PN</span>
                            <span>•</span>
                            <span>{item.bathrooms} WC</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Price */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-bold text-foreground">
                        {formatVND(item.rentPrice)}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Cọc: {formatVND(item.deposit)}
                      </p>
                    </td>

                    {/* Column 3: Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Column 4: Views */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{item.viewsCount}</span>
                      </div>
                    </td>

                    {/* Column 5: Date */}
                    <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                      {item.createdAt}
                    </td>

                    {/* Column 6: Actions */}
                    <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/listings/${item.id}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Xem trang tin trên web"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleHide(item.id, item.status)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                          title={item.status === "hidden" ? "Hiển thị lại" : "Tạm ẩn tin"}
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkRented(item.id, item.status)}
                          className={`h-8 w-8 p-0 cursor-pointer ${
                            item.status === "rented" ? "text-emerald-600" : "text-muted-foreground hover:text-foreground"
                          }`}
                          title={item.status === "rented" ? "Bỏ đánh dấu đã thuê" : "Đánh dấu đã thuê"}
                        >
                          <Check className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setListingToDelete(item)}
                          className="h-8 w-8 p-0 text-danger/80 hover:text-danger hover:bg-danger-subtle cursor-pointer"
                          title="Xóa tin đăng"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-xl border border-border overflow-hidden hover:border-border-focus transition-all flex flex-col shadow-xs"
            >
              <div className="relative h-44 w-full bg-slate-200">
                {item.images[0] && (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute top-2.5 left-2.5">
                  <StatusBadge status={item.status} size="sm" appearance="solid" />
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{item.viewsCount} lượt xem</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-foreground text-sm line-clamp-1 hover:text-primary">
                    <Link href={`/listings/${item.id}`}>{item.title}</Link>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {item.address}, {item.district}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{item.area} m²</span>
                    <span>•</span>
                    <span>{item.bedrooms} Phòng ngủ</span>
                    <span>•</span>
                    <span>{item.bathrooms} WC</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-primary">
                      {formatVND(item.rentPrice)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">/tháng</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link href={`/listings/${item.id}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Xem trên web">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleHide(item.id, item.status)}
                      className="h-8 w-8 p-0"
                      title="Tạm ẩn"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setListingToDelete(item)}
                      className="h-8 w-8 p-0 text-danger hover:bg-danger-subtle"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!listingToDelete} onOpenChange={(open) => !open && setListingToDelete(null)}>
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-danger mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            Xác nhận xóa tin đăng
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground mt-1">
            Bạn có chắc chắn muốn xóa tin đăng &ldquo;
            <strong className="text-foreground">{listingToDelete?.title}</strong>
            &rdquo;? Thao tác này sẽ gỡ tin khỏi hệ thống và không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setListingToDelete(null)}
            className="w-full sm:w-auto"
          >
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirmDelete}
            className="w-full sm:w-auto"
          >
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
