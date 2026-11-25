import * as React from "react";
import { Star, Quote, CheckCircle2 } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  location: string;
  avatar: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Nguyễn Minh Anh",
    role: "Sinh viên ĐH HUTECH",
    location: "Thuê phòng tại Bình Thạnh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    content:
      "Trước đây mình rất sợ bị lừa tiền cọc khi thuê trọ qua mạng. Nhờ HouseRental, phòng mình thuê đúng 100% như ảnh, chủ nhà thân thiện, ký hợp đồng rõ ràng và tiền điện nước được tính tự động rất minh bạch.",
    rating: 5,
  },
  {
    name: "Trần Quốc Bảo",
    role: "Kỹ sư phần mềm (Quận 1)",
    location: "Thuê studio tại Đa Kao, Q1",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    content:
      "Tính năng đặt lịch xem phòng online siêu tiện lợi. Mình đặt lịch lúc trưa, chiều đã có chủ nhà liên hệ đón tiếp. Thanh toán hóa đơn hàng tháng qua mã VietQR quét là xong, không cần tính toán thủ công.",
    rating: 5,
  },
  {
    name: "Cô Lê Thị Hoa",
    role: "Chủ nhà trọ Hoa Sen (32 phòng)",
    location: "Quận Bình Thạnh & Quận 7",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    content:
      "Phần mềm quản lý của HouseRental giúp tôi tiết kiệm đến vài ngày mỗi cuối tháng. Trước kia phải đi ghi từng công tơ điện nước rồi tính sổ sách rất cực, giờ chỉ cần nhập số là hệ thống gửi hóa đơn cho khách.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials.map((t, idx) => (
        <div
          key={idx}
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative"
        >
          <div>
            {/* Rating Stars */}
            <div className="flex items-center gap-1 text-amber-400 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>

            {/* Testimonial Quote */}
            <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
              &ldquo;{t.content}&rdquo;
            </p>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.avatar}
              alt={t.name}
              className="h-11 w-11 rounded-full object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-sm font-bold text-foreground">
                  {t.name}
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <p className="text-xs text-muted-foreground">{t.role}</p>
              <p className="text-[11px] text-slate-400">{t.location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
