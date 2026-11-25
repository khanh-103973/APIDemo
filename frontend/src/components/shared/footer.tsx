import Link from "next/link";
import { Home, Mail, Phone, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-900 text-slate-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Info & Mission */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                <Home className="h-5 w-5" />
              </div>
              <span className="font-heading text-xl font-bold text-white tracking-tight">
                House<span className="text-primary">Rental</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Nền tảng tìm kiếm và quản lý bất động sản cho thuê chuyên nghiệp số 1 tại Việt Nam. Kết nối trực tiếp khách thuê và chủ nhà với sự minh bạch tuyệt đối về chi phí và pháp lý.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Chứng nhận bảo mật SSL
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Hợp đồng điện tử chuẩn VN
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
              Khám phá phòng thuê
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/listings" className="hover:text-white transition-colors">
                  Tất cả tin cho thuê
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=boarding_house" className="hover:text-white transition-colors">
                  Phòng trọ sinh viên
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=studio" className="hover:text-white transition-colors">
                  Căn hộ dịch vụ Studio
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=apartment" className="hover:text-white transition-colors">
                  Căn hộ chung cư mini
                </Link>
              </li>
              <li>
                <Link href="/listings?propertyType=house" className="hover:text-white transition-colors">
                  Nhà nguyên căn
                </Link>
              </li>
            </ul>
          </div>

          {/* For Landlords & Tenants */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
              Dành cho bạn
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/dashboard/listings/new" className="hover:text-white transition-colors">
                  Đăng tin cho thuê miễn phí
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Bảng điều khiển chủ nhà
                </Link>
              </li>
              <li>
                <Link href="/dashboard/invoices" className="hover:text-white transition-colors">
                  Quản lý thu phí & hóa đơn
                </Link>
              </li>
              <li>
                <Link href="/account/favorites" className="hover:text-white transition-colors">
                  Tin đã lưu của tôi
                </Link>
              </li>
              <li>
                <Link href="/account/viewings" className="hover:text-white transition-colors">
                  Lịch xem phòng đã hẹn
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Offices */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
              Liên hệ & Trợ giúp
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="text-xs">
                  Tòa nhà Innovation, Phường 25, Quận Bình Thạnh, TP.HCM
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-xs font-semibold text-white">
                  Hotline: 1900 6868 (8:00 - 21:00)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-xs">hotro@houserental.vn</span>
              </li>
            </ul>

            {/* Payment methods */}
            <div className="pt-3">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1.5 font-semibold">
                Hỗ trợ thanh toán an toàn
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold">
                  VietQR
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold">
                  Napas 247
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold">
                  Chuyển khoản
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <p>© 2026 House Rental System Vietnam. Toàn quyền sở hữu.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Quy chế hoạt động sàn
            </Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/dispute" className="hover:text-slate-300 transition-colors">
              Giải quyết khiếu nại
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
