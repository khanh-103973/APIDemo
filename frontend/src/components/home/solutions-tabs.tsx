"use client";

import * as React from "react";
import Link from "next/link";
import {
  KeyRound,
  Building,
  CalendarCheck,
  Receipt,
  FileText,
  Wrench,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function SolutionsTabs() {
  const [activeTab, setActiveTab] = React.useState<"tenant" | "landlord">("tenant");

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="flex flex-col sm:inline-flex sm:flex-row w-full sm:w-auto max-w-full p-1.5 rounded-2xl bg-slate-100 border border-slate-200 gap-1 sm:gap-0">
          <button
            type="button"
            onClick={() => setActiveTab("tenant")}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "tenant"
                ? "bg-white text-emerald-700 shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <KeyRound className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Dành cho Khách thuê</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("landlord")}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "landlord"
                ? "bg-white text-primary shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building className="h-4 w-4 text-primary shrink-0" />
            <span>Dành cho Chủ nhà & Quản lý</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Tenant Solutions */}
      {activeTab === "tenant" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-bold text-base text-foreground mb-2">
              100% Tin Đăng Xác Thực
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mọi phòng trọ đều được kiểm tra địa chỉ thực tế, hình ảnh chuẩn không chỉnh sửa ảo, minh bạch chi phí điện nước.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-bold text-base text-foreground mb-2">
              Đặt Lịch Xem Phòng Online
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Chọn giờ xem phòng thuận tiện chỉ với 1 cú click. Chủ nhà phản hồi xác nhận nhanh chóng qua hệ thống thông báo.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Receipt className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-bold text-base text-foreground mb-2">
              Thanh Toán VietQR Tiện Lợi
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nhận thông báo hóa đơn hàng tháng kèm mã VietQR tự động điền sẵn số tiền và nội dung, bảo đảm đối soát chuẩn xác.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Wrench className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-bold text-base text-foreground mb-2">
              Báo Cáo Sự Cố 24/7
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gặp sự cố điện, nước, máy lạnh? Gửi yêu cầu bảo trì trực tiếp trên tài khoản và theo dõi tiến độ xử lý của chủ trọ.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Landlord Solutions */}
      {activeTab === "landlord" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center mb-4">
              <Building className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-bold text-base text-foreground mb-2">
              Quản Lý Tòa Nhà & Phòng
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Theo dõi trực quan trạng thái từng phòng: đang trống, đã thuê hay đang bảo trì. Quản lý đồng thời nhiều bất động sản.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-bold text-base text-foreground mb-2">
              Tự Động Tính Tiền Điện Nước
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nhập chỉ số điện nước cuối tháng, hệ thống tự động nhân đơn giá, cộng phụ phí và xuất hóa đơn gửi tới khách thuê.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-bold text-base text-foreground mb-2">
              Hợp Đồng Điện Tử Rõ Ràng
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mẫu hợp đồng chuẩn pháp luật Việt Nam, tự động nhắc nhở khi hợp đồng sắp hết hạn 30 ngày để chủ động gia hạn.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-bold text-base text-foreground mb-2">
              Báo Cáo Thu Chi & Doanh Thu
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Thống kê tổng doanh thu hàng tháng, số tiền đã thu, danh sách phòng còn nợ tiền phòng để nhắc nhở kịp thời.
            </p>
          </div>
        </div>
      )}

      {/* Quick Action below */}
      <div className="mt-8 text-center">
        {activeTab === "tenant" ? (
          <Link href="/listings">
            <Button variant="accent" size="lg" className="gap-2">
              <KeyRound className="h-4 w-4" />
              Khám phá tất cả phòng thuê ngay
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="gap-2">
              <Building className="h-4 w-4" />
              Truy cập bảng điều khiển chủ nhà
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
