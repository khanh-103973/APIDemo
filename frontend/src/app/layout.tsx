import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Sans } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | HouseRental",
    default: "HouseRental — Nền tảng thuê phòng trọ, căn hộ & quản lý nhà cho thuê",
  },
  description:
    "Tìm kiếm phòng trọ, studio, căn hộ và nhà nguyên căn xác thực tại TP. Đà Nẵng và toàn quốc. Minh bạch chi phí, đặt lịch xem phòng trực tiếp và ký hợp đồng an toàn.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "HouseRental",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnamPro.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
