import Link from "next/link";
import {
  Search,
  Building,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getFeaturedListings } from "@/lib/api/listings";
import { formatVND } from "@/lib/format/currency";

export default async function HomePage() {
  const featuredListings = await getFeaturedListings();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-surface via-background to-background py-16 sm:py-24 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Nền tảng thuê phòng & quản lý nhà trọ hiện đại tại Việt Nam
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Tìm phòng thuê ưng ý, <br />
              <span className="text-primary">quản lý nhà trọ</span> dễ dàng.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Kết nối trực tiếp khách thuê và chủ nhà. Minh bạch thông tin giá điện nước, hợp đồng rõ ràng, hóa đơn chi tiết, hỗ trợ thanh toán trực tiếp an toàn.
            </p>

            {/* Quick Navigation CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/listings">
                <Button size="lg" variant="primary" className="gap-2">
                  <Search className="h-5 w-5" />
                  Khám phá phòng thuê
                </Button>
              </Link>
              <Link href="/dashboard/listings/new">
                <Button size="lg" variant="accent" className="gap-2">
                  <Building className="h-5 w-5" />
                  Đăng tin cho thuê
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Overview & Quick Role Access */}
      <section className="py-12 bg-surface/50 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              Kiến trúc hệ thống đa vai trò (Phase 2 Foundation)
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Phân quyền và bố cục độc lập theo từng đối tượng người dùng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Marketplace & Tenant */}
            <Card interactive className="border-t-4 border-t-emerald-600">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    Khách thuê
                  </span>
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Trang Công cộng & Khách thuê
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tìm kiếm lọc phòng, đặt lịch xem phòng trực tiếp, quản lý tin đã lưu, theo dõi hóa đơn và hợp đồng.
                </p>
                <div className="pt-2">
                  <Link href="/account/favorites" className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1">
                    Vào khu vực khách thuê <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Landlord */}
            <Card interactive className="border-t-4 border-t-purple-600">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Building className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                    Chủ nhà
                  </span>
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Bảng Điều Khiển Chủ Nhà
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Quản lý danh sách tòa nhà, tạo phòng, tiếp nhận khách thuê, lập hóa đơn điện nước và ghi nhận thu phí.
                </p>
                <div className="pt-2">
                  <Link href="/dashboard" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                    Vào bảng điều khiển chủ nhà <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Admin */}
            <Card interactive className="border-t-4 border-t-amber-500">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Admin
                  </span>
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Trung Tâm Điều Hành Admin
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bố cục chuyên biệt: kiểm duyệt tin đăng, duyệt hồ sơ xác thực chủ nhà, xử lý khiếu nại và giám sát nhật ký.
                </p>
                <div className="pt-2">
                  <Link href="/admin" className="text-xs font-semibold text-amber-700 hover:underline inline-flex items-center gap-1">
                    Vào cổng quản trị Admin <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Listings Preview */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              Tin đăng nổi bật (Dữ liệu mẫu kiểm thử)
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Được kết nối qua tầng truy cập dữ liệu `src/lib/api/listings.ts`
            </p>
          </div>
          <Link href="/listings">
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredListings.map((listing) => (
            <Card key={listing.id} interactive className="overflow-hidden flex flex-col">
              <div className="aspect-16/10 relative overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <StatusBadge status={listing.status} />
                  {listing.isFeatured && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500 text-white">
                      Nổi bật
                    </span>
                  )}
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{listing.district}, {listing.city}</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground line-clamp-2">
                    {listing.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">Giá thuê</span>
                    <p className="font-heading text-base font-bold text-primary">
                      {formatVND(listing.rentPrice)}
                      <span className="text-xs font-normal text-muted-foreground">/tháng</span>
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <span>{listing.area} m²</span> • <span>{listing.bedrooms} PN</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust & Verification Signals */}
      <section className="py-12 bg-surface border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h4 className="font-heading font-semibold text-base">Thông tin xác thực</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Chủ nhà và phòng trọ được xác minh thông tin giấy tờ và địa chỉ thực tế.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
              <h4 className="font-heading font-semibold text-base">Minh bạch biểu phí</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Rõ ràng chỉ số điện, nước, internet và các dịch vụ đi kèm ngay trên hợp đồng.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-heading font-semibold text-base">Quy trình chuyên nghiệp</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Đặt lịch xem phòng nhanh chóng, hóa đơn lưu trữ minh bạch giữa 2 bên.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
