import Link from "next/link";
import { Home, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-foreground mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Home className="h-4 w-4" />
              </div>
              <span className="font-heading text-lg font-bold">
                House<span className="text-primary">Rental</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nền tảng tìm kiếm và quản lý bất động sản cho thuê chuyên nghiệp, minh bạch và an toàn tại Việt Nam.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wider">
              Khám phá
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/listings" className="hover:text-primary transition-colors">
                  Tất cả tin cho thuê
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=boarding_house" className="hover:text-primary transition-colors">
                  Phòng trọ sinh viên
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=apartment" className="hover:text-primary transition-colors">
                  Căn hộ chung cư
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=studio" className="hover:text-primary transition-colors">
                  Căn hộ dịch vụ Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* For Landlords & Tenants */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wider">
              Dành cho bạn
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard/listings/new" className="hover:text-primary transition-colors">
                  Đăng tin cho thuê miễn phí
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Quản lý phòng & hợp đồng
                </Link>
              </li>
              <li>
                <Link href="/account/viewings" className="hover:text-primary transition-colors">
                  Theo dõi lịch xem phòng
                </Link>
              </li>
              <li>
                <Link href="/account/invoices" className="hover:text-primary transition-colors">
                  Tra cứu hóa đơn thuê
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Regulations */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wider">
              Liên hệ & Pháp lý
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>TP. Hồ Chí Minh & Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>1900 6868 (8:00 - 20:00)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>hotro@houserental.vn</span>
              </li>
              <li className="pt-2 flex gap-4 text-xs">
                <Link href="/terms" className="hover:underline">
                  Điều khoản
                </Link>
                <Link href="/privacy" className="hover:underline">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 House Rental System Vietnam. Bản quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
