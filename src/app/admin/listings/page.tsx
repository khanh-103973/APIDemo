"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building,
  Search,
  CheckCircle2,
  ExternalLink,
  Star,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatVND } from "@/lib/format/currency";
import {
  getAdminListings,
  toggleListingFeatured,
} from "@/lib/api/admin";
import { Listing } from "@/types";

export default function AdminListingsPage() {
  const [listings, setListings] = React.useState<Listing[]>(getAdminListings);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [cityFilter, setCityFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [notice, setNotice] = React.useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleToggleFeatured = (id: string) => {
    const updated = toggleListingFeatured(id);
    setListings(updated);
    const target = updated.find((l) => l.id === id);
    showNotification(
      target?.isFeatured
        ? `Đã gắn huy hiệu Tin Nổi Bật cho '${target.title}'.`
        : `Đã gỡ huy hiệu Tin Nổi Bật.`
    );
  };

  const filtered = listings.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (cityFilter !== "all" && item.city !== cityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.address.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Tất Cả Tin Đăng Trên Hệ Thống
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tra cứu, kiểm soát hiển thị và quản lý nhãn tin nổi bật trên toàn bộ sàn giao dịch.
          </p>
        </div>

        <Link href="/admin/listings/pending">
          <Button variant="accent" className="gap-2 shadow-xs cursor-pointer">
            <Building className="h-4 w-4" />
            Hàng đợi duyệt tin
          </Button>
        </Link>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-border flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tiêu đề, địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background h-9 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="pending">Chờ kiểm duyệt</option>
            <option value="rented">Đã cho thuê</option>
            <option value="rejected">Bị từ chối</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả tỉnh / thành</option>
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Hà Nội">Hà Nội</option>
          </select>
        </div>

        <span className="text-xs text-muted-foreground self-end md:self-center">
          Tổng cộng: <strong className="text-foreground">{filtered.length}</strong> tin đăng
        </span>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-4">Tin đăng</th>
                <th className="p-3.5">Giá thuê / tháng</th>
                <th className="p-3.5">Khu vực</th>
                <th className="p-3.5 text-center">Trạng thái</th>
                <th className="p-3.5 text-center">Nổi bật</th>
                <th className="p-3.5 text-center">Lượt xem</th>
                <th className="p-3.5 pr-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 rounded-md overflow-hidden bg-slate-200 shrink-0 border border-border">
                        {item.images[0] && (
                          <Image src={item.images[0]} alt={item.title} fill sizes="64px" className="object-cover" />
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/listings/${item.id}`}
                          target="_blank"
                          className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1 max-w-xs"
                        >
                          {item.title}
                        </Link>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{item.address}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 whitespace-nowrap font-bold text-primary">
                    {formatVND(item.rentPrice)}
                  </td>

                  <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                    {item.district}, {item.city}
                  </td>

                  <td className="p-3.5 text-center whitespace-nowrap">
                    <StatusBadge status={item.status} size="sm" />
                  </td>

                  <td className="p-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleToggleFeatured(item.id)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        item.isFeatured
                          ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                          : "text-slate-300 hover:text-amber-500"
                      }`}
                      title={item.isFeatured ? "Bỏ nhãn nổi bật" : "Gắn nhãn nổi bật"}
                    >
                      <Star className={`h-4 w-4 ${item.isFeatured ? "fill-amber-500" : ""}`} />
                    </button>
                  </td>

                  <td className="p-3.5 text-center whitespace-nowrap text-muted-foreground">
                    <span className="flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.viewsCount}
                    </span>
                  </td>

                  <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                    <Link href={`/listings/${item.id}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1 cursor-pointer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Xem web
                      </Button>
                    </Link>
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
