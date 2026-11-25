import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
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

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  boarding_house: "Phòng trọ",
  studio: "Studio",
  apartment: "Căn hộ chung cư",
  house: "Nhà nguyên căn",
  villa: "Biệt thự",
};

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

const getCachedListing = React.cache(async (id: string) => getListingById(id));

export async function generateMetadata({
  params,
}: ListingDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getCachedListing(id);

  if (!listing) {
    return {
      title: "Không tìm thấy phòng cho thuê",
      description:
        "Tin đăng phòng cho thuê không tồn tại hoặc đã được gỡ khỏi hệ thống HouseRental.",
      robots: { index: false, follow: false },
    };
  }

  const typeLabel =
    PROPERTY_TYPE_LABELS[listing.propertyType] || "Phòng cho thuê";
  const fullAddress = [listing.address, listing.district, listing.city]
    .filter(Boolean)
    .join(", ");
  const priceText = `${formatVND(listing.rentPrice)}/tháng`;
  const title = `${listing.title} - ${priceText}`;
  const rawDescription = `${typeLabel} ${listing.area}m², ${listing.bedrooms} phòng ngủ tại ${fullAddress}. Giá thuê ${priceText}. ${listing.description}`;
  const description =
    rawDescription.length > 160
      ? `${rawDescription.slice(0, 157).trimEnd()}...`
      : rawDescription;
  const primaryImage = listing.images[0];

  return {
    title,
    description,
    keywords: [
      listing.title,
      typeLabel,
      listing.district,
      listing.city,
      "cho thuê phòng",
      "thuê nhà",
      "HouseRental",
    ].filter(Boolean),
    alternates: {
      canonical: `/listings/${listing.id}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "vi_VN",
      url: `/listings/${listing.id}`,
      images: primaryImage
        ? [
            {
              url: primaryImage,
              width: 1200,
              height: 630,
              alt: listing.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage] : undefined,
    },
  };
}

export default async function ListingDetailsPage({
  params,
}: ListingDetailsPageProps) {
  const { id } = await params;
  const listing = await getCachedListing(id);

  if (!listing) {
    notFound();
  }

  const [landlord, landlordProfile, allListings] = await Promise.all([
    getUserById(listing.landlordId),
    getLandlordProfile(listing.landlordId),
    getListings(),
  ]);

  const similarListings = allListings
    .filter((l) => l.id !== listing.id && l.city === listing.city)
    .slice(0, 3);

  const typeLabel =
    PROPERTY_TYPE_LABELS[listing.propertyType] || "Nhà nguyên căn";

  return (
    <div className="min-h-screen bg-surface/30 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 min-w-0">
          <Link href="/" className="hover:text-foreground shrink-0">
            Trang chủ
          </Link>
          <span className="shrink-0">/</span>
          <Link href="/listings" className="hover:text-foreground shrink-0">
            Phòng cho thuê
          </Link>
          <span className="shrink-0">/</span>
          <span className="text-foreground font-semibold truncate min-w-0">
            {listing.title}
          </span>
        </nav>

        {/* Gallery */}
        <div className="mb-6 sm:mb-8">
          <ListingGallery images={listing.images} title={listing.title} />
        </div>

        {/* Content Layout: Main Info (Left) + Landlord Action Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Info Column (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
            {/* Title & Core Metrics */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={listing.status} />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  {typeLabel}
                </span>
                {listing.isFeatured && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
                    Tin nổi bật
                  </span>
                )}
              </div>

              <h1 className="font-heading text-xl sm:text-3xl font-bold text-foreground leading-snug break-words">
                {listing.title}
              </h1>

              <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  {[listing.address, listing.district, listing.city]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>

              {/* Quick Spec Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-y border-border">
                <div className="p-3 bg-card rounded-md border border-border">
                  <span className="text-xs text-muted-foreground block">Diện tích</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Maximize2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-heading text-base font-bold text-foreground">
                      {listing.area} m²
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-card rounded-md border border-border">
                  <span className="text-xs text-muted-foreground block">Phòng ngủ</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Bed className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-heading text-base font-bold text-foreground">
                      {listing.bedrooms} PN
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-card rounded-md border border-border">
                  <span className="text-xs text-muted-foreground block">Phòng vệ sinh</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Bath className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-heading text-base font-bold text-foreground">
                      {listing.bathrooms} WC
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-card rounded-md border border-border">
                  <span className="text-xs text-muted-foreground block">Lượt xem</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
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
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line bg-card p-4 sm:p-5 rounded-lg border border-border break-words">
                {listing.description}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Tiện ích & Cơ sở vật chất
              </h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 bg-card p-4 sm:p-5 rounded-lg border border-border">
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
                  <div className="flex flex-wrap justify-between items-center gap-2 p-3.5">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium">Tiền thuê hàng tháng</span>
                    </div>
                    <span className="font-bold text-primary">
                      {formatVND(listing.rentPrice)}/tháng
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2 p-3.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0" />
                      <span className="font-medium">Tiền đặt cọc</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {formatVND(listing.deposit)} (1 tháng)
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2 p-3.5">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-medium">Tiền điện sinh hoạt</span>
                    </div>
                    <span className="text-muted-foreground">
                      3.800 đ/kWh (đồng hồ riêng)
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2 p-3.5">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="font-medium">Tiền nước sinh hoạt</span>
                    </div>
                    <span className="text-muted-foreground">
                      100.000 đ/người/tháng
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2 p-3.5">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-emerald-500 shrink-0" />
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
          <div className="space-y-6 min-w-0">
            <Card className="p-5 sm:p-6 lg:sticky lg:top-24 border-primary/20 shadow-md space-y-6">
              {/* Pricing Box */}
              <div>
                <span className="text-xs text-muted-foreground">Mức giá thuê niêm yết</span>
                <div className="flex items-baseline flex-wrap gap-1 mt-0.5">
                  <span className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
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
                  <Image
                    src={landlord?.avatar || FALLBACK_AVATAR}
                    alt={landlord?.name || "Chủ nhà"}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-heading font-semibold text-sm text-foreground truncate">
                      {landlord?.name || "Chủ nhà Minh Đức"}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium mt-0.5">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>Chủ nhà đã xác minh</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 bg-surface p-3 rounded-md border border-border">
                  <div className="flex justify-between gap-2">
                    <span>Tỷ lệ phản hồi:</span>
                    <span className="font-semibold text-foreground">
                      {landlordProfile?.responseRate || 98}%
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
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
          <div className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-border">
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
