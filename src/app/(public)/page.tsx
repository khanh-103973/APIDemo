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
  Clock,
  Zap,
  Users,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFeaturedListings } from "@/lib/api/listings";
import { ListingCard } from "@/components/listing/listing-card";
import { SearchHeroWidget } from "@/components/home/search-hero-widget";
import { PopularAreas } from "@/components/home/popular-areas";
import { SolutionsTabs } from "@/components/home/solutions-tabs";
import { TestimonialsSection } from "@/components/home/testimonials";

export default async function HomePage() {
  const featuredListings = await getFeaturedListings();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section - Hero-Centric Pattern with Glassmorphic Search */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/70 via-background to-background pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-border">
        {/* Subtle Decorative Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-purple-200/30 to-emerald-200/20 blur-3xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Nền tảng thuê phòng & quản lý nhà trọ hiện đại số 1 Việt Nam
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              Tìm phòng thuê hoàn hảo, <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                quản lý nhà trọ
              </span>{" "}
              dễ dàng.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Hơn 10.000+ phòng trọ, căn hộ studio và chung cư xác thực tại TP.HCM & Hà Nội. Minh bạch biểu phí điện nước, xem phòng miễn phí, ký hợp đồng an toàn.
            </p>
          </div>

          {/* Interactive Search Box */}
          <SearchHeroWidget />
        </div>
      </section>

      {/* 2. Trust Value Proposition Strip */}
      <section className="py-8 bg-surface border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5 p-2">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground">
                  100% Tin Xác Thực
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Đã kiểm tra thực tế & giấy tờ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2">
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-primary flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground">
                  Điện Nước Rõ Ràng
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Đơn giá niêm yết minh bạch
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground">
                  Hợp Đồng Chuẩn Mực
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bảo vệ quyền lợi đôi bên
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2">
              <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground">
                  Đặt Lịch Xem Miễn Phí
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chủ nhà đón tiếp tận tâm
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Areas in Vietnam */}
      <section id="areas" className="py-16 sm:py-20 bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                <MapPin className="h-3.5 w-3.5" />
                Vị trí đắc địa
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Khu vực cho thuê sôi động nhất
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gần trường đại học, khu công nghệ cao và trung tâm tài chính tiện lợi di chuyển.
              </p>
            </div>
            <Link href="/listings" className="mt-4 sm:mt-0">
              <Button variant="outline" size="sm" className="gap-1.5">
                Xem tất cả khu vực <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <PopularAreas />
        </div>
      </section>

      {/* 4. Featured Listings Grid */}
      <section className="py-16 sm:py-20 bg-surface/50 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Được đánh giá cao
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Phòng trọ & căn hộ nổi bật hôm nay
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Đầy đủ hình ảnh thực tế, tiện nghi cao cấp, chủ nhà đã xác thực hồ sơ.
              </p>
            </div>
            <Link href="/listings" className="mt-4 sm:mt-0">
              <Button variant="primary" size="sm" className="gap-1.5">
                Xem toàn bộ {featuredListings.length}+ phòng <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Comprehensive Solutions for Tenants & Landlords */}
      <section id="solutions" className="py-16 sm:py-20 bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Giải pháp toàn diện cho hệ sinh thái thuê phòng
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Khách thuê tìm phòng an tâm, chủ trọ quản lý doanh thu và hóa đơn dễ dàng.
            </p>
          </div>

          <SolutionsTabs />
        </div>
      </section>

      {/* 6. Landlord Growth Call-to-Action Banner */}
      <section className="py-16 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold backdrop-blur-xs">
                <Building className="h-3.5 w-3.5" /> Dành cho chủ trọ & ban quản lý
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold leading-tight">
                Bạn có phòng trọ hoặc căn hộ cho thuê? <br />
                Đăng tin miễn phí và tiếp cận 50.000+ khách thuê.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Tự động hóa ghi điện nước, lập hóa đơn VietQR định kỳ, quản lý hợp đồng thuê chuyên nghiệp mà không tốn chi phí quản lý phức tạp.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/dashboard/listings/new">
                  <Button size="lg" variant="accent" className="font-bold gap-2 shadow-lg">
                    <Building className="h-5 w-5" />
                    Đăng tin cho thuê miễn phí
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-semibold"
                  >
                    Dùng thử phần mềm quản lý
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <p className="font-heading text-3xl font-bold text-emerald-400">5.000+</p>
                <p className="text-xs text-slate-300 mt-1">Chủ trọ tin dùng</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <p className="font-heading text-3xl font-bold text-amber-400">98%</p>
                <p className="text-xs text-slate-300 mt-1">Tỷ lệ lấp đầy phòng</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <p className="font-heading text-3xl font-bold text-purple-300">80%</p>
                <p className="text-xs text-slate-300 mt-1">Tiết kiệm thời gian</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <p className="font-heading text-3xl font-bold text-sky-400">24/7</p>
                <p className="text-xs text-slate-300 mt-1">Hỗ trợ đối soát</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-20 bg-surface/40 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
              <Users className="h-3.5 w-3.5" />
              Cộng đồng tin cậy
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Người thuê & Chủ trọ nói gì về HouseRental?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Hơn 25.000+ giao dịch và hợp đồng thuê đã được hỗ trợ thành công.
            </p>
          </div>

          <TestimonialsSection />
        </div>
      </section>
    </div>
  );
}
