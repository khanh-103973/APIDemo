import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Maximize2,
  Bed,
  Bath,
  ShieldCheck,
  Check,
  Clock,
  AlertCircle,
  Zap,
  Droplet,
  Wifi,
  FileCheck,
} from "lucide-react";
import { getListingById, getListings } from "@/lib/api/listings";
import { getUserById, getLandlordProfile } from "@/lib/api/users";
import { ListingGallery } from "@/components/listing/listing-gallery";
import { ListingCard } from "@/components/listing/listing-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { formatVND } from "@/lib/format/currency";
import { ListingDetailsClient } from "./client";

export interface ListingDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ListingDetailsPage({
  params,
}: ListingDetailsPageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const landlord = await getUserById(listing.landlordId);
  const landlordProfile = await getLandlordProfile(listing.landlordId);
  const allListings = await getListings();
  const similarListings = allListings
    .filter((l) => l.id !== listing.id && l.city === listing.city)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-surface/30 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-foreground">
            Phòng cho thuê
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-xs sm:max-w-md">
            {listing.title}
          </span>
        </nav>

        {/* Gallery */}
        <div className="mb-8">
          <ListingGallery images={listing.images} title={listing.title} />
        </div>

        {/* Content Layout: Main Info (Left) + Landlord Action Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Core Metrics */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={listing.status} />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  {listing.propertyType === "boarding_house"
                    ? "Phòng trọ"
                    : listing.propertyType === "studio"
                    ? "Studio"
                    : listing.propertyType === "apartment"
                    ? "Căn hộ chung cư"
                    : "Nhà nguyên căn"}
                </span>
                {listing.isFeatured && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
                    Tin nổi bật
                  </span>
                )}
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-snug">
                {listing.title}
              </h1>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {listing.address}, {listing.district}, {listing.city}
                </span>
              </div>

              {/* Quick Spec Metrics Bar */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-4 border-y border-border">
                <div className="p-3 bg-card rounded-md border border-border">
                  <span className="text-xs text-muted-foreground block">Diện tích</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Maximize2 className="h-4 w-4 text-primary" />
                    <span className="font-heading text-base font-bold text-foreground">
                      {listing.area} m²
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-card rounded-md border border-border">
                  <span className="text-xs text-muted-foreground block">Phòng ngủ</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Bed className="h-4 w-4 text-primary" />
                    <span className="font-heading text-base font-bold text-foreground">
                      {listing.bedrooms} PN
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-card rounded-md border border-border">
                  <span className="text-xs text-muted-foreground block">Phòng vệ sinh</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Bath className="h-4 w-4 text-primary" />
                    <span className="font-heading text-base font-bold text-foreground">
                      {listing.bathrooms} WC
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-card rounded-md border border-border col-span-3 sm:col-span-1">
                  <span className="text-xs text-muted-foreground block">Lượt xem</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-heading text-base font-bold text-foreground">
                      {listing.viewsCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Mô tả chi tiết
              </h2>
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line bg-card p-5 rounded-lg border border-border">
                {listing.description}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Tiện ích & Cơ sở vật chất
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-card p-5 rounded-lg border border-border">
                {listing.amenities.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Estimated Expenses Breakdown */}
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Biểu phí & Điều khoản tham khảo
              </h2>
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="divide-y divide-border text-sm">
                  <div className="flex justify-between items-center p-3.5">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-primary" />
                      <span className="font-medium">Tiền thuê hàng tháng</span>
                    </div>
                    <span className="font-bold text-primary">
                      {formatVND(listing.rentPrice)}/tháng
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">Tiền đặt cọc</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {formatVND(listing.deposit)} (1 tháng)
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3.5">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">Tiền điện sinh hoạt</span>
                    </div>
                    <span className="text-muted-foreground">
                      3.800 đ/kWh (đồng hồ riêng)
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3.5">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Tiền nước sinh hoạt</span>
                    </div>
                    <span className="text-muted-foreground">
                      100.000 đ/người/tháng
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3.5">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium">Internet & Phí dịch vụ chung</span>
                    </div>
                    <span className="text-muted-foreground">
                      Miễn phí / Đã bao gồm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Landlord Sidebar Action Card (Right 1 col) */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24 border-primary/20 shadow-md space-y-6">
              {/* Pricing Box */}
              <div>
                <span className="text-xs text-muted-foreground">Mức giá thuê niêm yết</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-heading text-3xl font-extrabold text-primary">
                    {formatVND(listing.rentPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground">/tháng</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Đặt cọc: {formatVND(listing.deposit)} • Thanh toán trực tiếp
                </p>
              </div>

              {/* Landlord Contact Info */}
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={landlord?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={landlord?.name || "Chủ nhà"}
                    className="h-12 w-12 rounded-full object-cover border border-border"
                  />
                  <div>
                    <h3 className="font-heading font-semibold text-sm text-foreground">
                      {landlord?.name || "Chủ nhà Minh Đức"}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium mt-0.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Chủ nhà đã xác minh</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 bg-surface p-3 rounded-md border border-border">
                  <div className="flex justify-between">
                    <span>Tỷ lệ phản hồi:</span>
                    <span className="font-semibold text-foreground">
                      {landlordProfile?.responseRate || 98}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời gian phản hồi:</span>
                    <span className="font-semibold text-foreground">
                      {landlordProfile?.responseTime || "Trong vòng 1 giờ"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Interactive Actions: Viewing Request Modal & Call */}
              <ListingDetailsClient
                listing={listing}
                phone={landlord?.phone || "0912345678"}
              />

              {/* Safe Rental Advisory Notice */}
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900 flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Khuyến nghị an toàn:</strong> Luôn đến xem phòng trực tiếp và ký hợp đồng trước khi thanh toán tiền cọc.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Similar Listings Section */}
        {similarListings.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-6">
              Phòng cho thuê tương tự trong khu vực
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarListings.map((simListing) => (
                <ListingCard key={simListing.id} listing={simListing} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
