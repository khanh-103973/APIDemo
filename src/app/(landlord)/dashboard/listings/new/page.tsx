"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Building,
  Image as ImageIcon,
  Sliders,
  DollarSign,
  FileCheck2,
  Upload,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  Sparkles,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatVND } from "@/lib/format/currency";
import { saveLandlordListing } from "@/lib/api/landlord";
import { PropertyType } from "@/types";

// Curated sample property photos for 1-click selection
const SAMPLE_PHOTOS = [
  {
    label: "Phòng khách / Toàn cảnh",
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Phòng ngủ có gác / Ban công",
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Khu vực bếp & bàn ăn",
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Phòng vệ sinh khép kín",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Góc làm việc & cửa sổ lớn",
    url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Tòa nhà & mặt tiền",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
  },
];

const AMENITY_OPTIONS = [
  "Máy lạnh",
  "Máy nước nóng",
  "Tủ lạnh",
  "Máy giặt",
  "Giường nệm",
  "Tủ quần áo",
  "Bếp riêng",
  "Ban công thoáng",
  "Gác lửng",
  "Thang máy",
  "Khóa vân tay",
  "Camera an ninh",
  "Bảo vệ 24/7",
  "Giờ giấc tự do",
  "Hầm để xe",
  "Wifi tốc độ cao",
  "Cho nuôi thú cưng",
  "Dọn phòng định kỳ",
];

export default function NewListingWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState<boolean>(false);
  const [submittedStatus, setSubmittedStatus] = React.useState<"pending" | "draft">("pending");

  // Form State
  const [formData, setFormData] = React.useState({
    // Step 1: Info & Address
    propertyId: "prop_1",
    title: "Phòng Trọ Ban Công Thoáng Mát Đầy Đủ Tiện Nghi Mới 100%",
    propertyType: "boarding_house" as PropertyType,
    city: "TP. Hồ Chí Minh",
    district: "Quận Bình Thạnh",
    ward: "Phường 25",
    address: "48/12 Nguyễn Gia Trí (D2 cũ)",
    description:
      "Phòng trọ mới xây dựng, giờ giấc tự do không chung chủ, bảo vệ 24/7, thang máy di chuyển tiện lợi. Đầy đủ tiện nghi: máy lạnh inverter, tủ lạnh, gác lửng cao, ban công đón gió mát. Khu vực an ninh cao, thuận tiện đi lại sang Quận 1, Quận 2.",

    // Step 2: Images
    images: [
      SAMPLE_PHOTOS[0].url,
      SAMPLE_PHOTOS[1].url,
      SAMPLE_PHOTOS[2].url,
    ],
    customImageUrl: "",

    // Step 3: Amenities & Specs
    area: 32,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    maxOccupants: 2,
    amenities: [
      "Máy lạnh",
      "Gác lửng",
      "Ban công thoáng",
      "Thang máy",
      "Bảo vệ 24/7",
      "Khóa vân tay",
      "Hầm để xe",
      "Wifi tốc độ cao",
    ],

    // Step 4: Price & Fees
    rentPrice: 6000000,
    deposit: 6000000,
    electricityPrice: 3800,
    electricityType: "per_kwh",
    waterPrice: 100000,
    waterType: "per_person",
    internetPrice: 100000,
    servicePrice: 150000,
    parkingPrice: 120000,
    minContractMonths: 6,
  });

  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Steps definition
  const steps = [
    { num: 1, title: "Thông tin & Địa chỉ", icon: Building },
    { num: 2, title: "Hình ảnh", icon: ImageIcon },
    { num: 3, title: "Tiện ích & Thông số", icon: Sliders },
    { num: 4, title: "Giá thuê & Chi phí", icon: DollarSign },
    { num: 5, title: "Xem lại & Gửi duyệt", icon: FileCheck2 },
  ];

  // Validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim() || formData.title.length < 15) {
        errors.title = "Tiêu đề tin đăng cần tối thiểu 15 ký tự để thu hút người thuê.";
      }
      if (!formData.address.trim()) {
        errors.address = "Vui lòng nhập địa chỉ cụ thể.";
      }
      if (!formData.district.trim()) {
        errors.district = "Vui lòng chọn quận/huyện.";
      }
      if (!formData.description.trim() || formData.description.length < 30) {
        errors.description = "Mô tả chi tiết cần tối thiểu 30 ký tự.";
      }
    }

    if (step === 2) {
      if (formData.images.length === 0) {
        errors.images = "Vui lòng thêm ít nhất 1 hình ảnh phòng thực tế.";
      }
    }

    if (step === 3) {
      if (formData.area <= 0) {
        errors.area = "Diện tích phòng phải lớn hơn 0 m².";
      }
    }

    if (step === 4) {
      if (formData.rentPrice <= 0) {
        errors.rentPrice = "Giá thuê phải lớn hơn 0 ₫.";
      }
      if (formData.deposit < 0) {
        errors.deposit = "Tiền cọc không được là số âm.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Image actions
  const handleAddSamplePhoto = (url: string) => {
    if (!formData.images.includes(url)) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const handleAddCustomPhoto = () => {
    if (formData.customImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, prev.customImageUrl.trim()],
        customImageUrl: "",
      }));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimaryPhoto = (index: number) => {
    setFormData((prev) => {
      const selected = prev.images[index];
      const remaining = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: [selected, ...remaining] };
    });
  };

  // Amenities toggle
  const handleToggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  // Submit action
  const handleSubmit = (status: "pending" | "draft") => {
    setSubmittedStatus(status);
    saveLandlordListing({
      title: formData.title,
      description: formData.description,
      propertyType: formData.propertyType,
      propertyId: formData.propertyId,
      address: formData.address,
      ward: formData.ward,
      district: formData.district,
      city: formData.city,
      area: formData.area,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      rentPrice: formData.rentPrice,
      deposit: formData.deposit,
      amenities: formData.amenities,
      images: formData.images,
      status: status,
      moderationStatus: status === "draft" ? "pending" : "pending",
    });

    setShowSuccessDialog(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/listings"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Quay lại Quản lý tin đăng
          </Link>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Tạo Tin Đăng Cho Thuê Mới
          </h1>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-100 text-purple-700">
          Bước {currentStep} / 5
        </span>
      </div>

      {/* 5-Step Visual Stepper Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div
                key={s.num}
                className="flex flex-col items-center text-center cursor-pointer"
                onClick={() => {
                  if (s.num < currentStep) setCurrentStep(s.num);
                }}
              >
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-1.5 ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-slate-100 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-semibold line-clamp-1 ${
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= STEP 1: THÔNG TIN & ĐỊA CHỈ ================= */}
      {currentStep === 1 && (
        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Bước 1: Thông Tin Cơ Bản & Địa Chỉ
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cung cấp vị trí chính xác giúp tin đăng hiển thị đúng trên bản đồ và tiếp cận khách tìm phòng trong khu vực.
              </p>
            </div>

            {/* Property Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Thuộc Bất Động Sản (Tùy chọn)
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="prop_1">Tòa nhà Căn hộ Dịch vụ D2 Bình Thạnh (12 phòng)</option>
                <option value="prop_2">Chung cư Sunrise City View Quận 7 (4 phòng)</option>
                <option value="prop_3">Hương House Studio Đa Kao Quận 1 (6 phòng)</option>
                <option value="independent">Tin đăng độc lập / Nhà riêng lẻ</option>
              </select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-foreground">
                  Tiêu đề tin đăng <span className="text-danger">*</span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {formData.title.length}/100 ký tự (Khuyến nghị: 30 - 90 ký tự)
                </span>
              </div>
              <Input
                placeholder="VD: Phòng Trọ Ban Công Thoáng Mát Gần HUTECH D2 Đầy Đủ Nội Thất"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-xs"
              />
              {validationErrors.title && (
                <p className="text-[11px] text-danger">{validationErrors.title}</p>
              )}
            </div>

            {/* Property Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Loại hình cho thuê <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: "boarding_house", label: "Phòng trọ / KTX" },
                  { value: "studio", label: "Căn hộ Studio" },
                  { value: "apartment", label: "Chung cư" },
                  { value: "house", label: "Nhà nguyên căn" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, propertyType: type.value as PropertyType })
                    }
                    className={`p-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-left ${
                      formData.propertyType === type.value
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Address fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Tỉnh / Thành phố <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Quận / Huyện <span className="text-danger">*</span>
                </label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="VD: Quận Bình Thạnh"
                  className="text-xs"
                />
                {validationErrors.district && (
                  <p className="text-[11px] text-danger">{validationErrors.district}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Phường / Xã</label>
                <Input
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  placeholder="VD: Phường 25"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Địa chỉ cụ thể (Số nhà, tên đường) <span className="text-danger">*</span>
              </label>
              <Input
                placeholder="VD: 48/12 Nguyễn Gia Trí (đường D2 cũ)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="text-xs"
              />
              {validationErrors.address && (
                <p className="text-[11px] text-danger">{validationErrors.address}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-foreground">
                  Mô tả chi tiết <span className="text-danger">*</span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {formData.description.length} ký tự
                </span>
              </div>
              <Textarea
                rows={5}
                placeholder="Nêu rõ ưu điểm: Giờ giấc tự do, bảo vệ 24/7, vị trí gần các trường ĐH nào, nội thất có sẵn những gì..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-xs leading-relaxed"
              />
              {validationErrors.description && (
                <p className="text-[11px] text-danger">{validationErrors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================= STEP 2: HÌNH ẢNH ================= */}
      {currentStep === 2 && (
        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Bước 2: Hình Ảnh Phòng Thực Tế
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tin đăng có từ 3 hình ảnh sắc nét trở lên nhận được gấp 4 lần lượt liên hệ xem phòng.
              </p>
            </div>

            {/* Quick Picker from Curated Samples */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Chọn nhanh ảnh mẫu phòng trọ chuẩn đẹp:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SAMPLE_PHOTOS.map((photo, i) => {
                  const isAdded = formData.images.includes(photo.url);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddSamplePhoto(photo.url)}
                      disabled={isAdded}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                        isAdded
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800 opacity-60 cursor-not-allowed"
                          : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                      }`}
                    >
                      <div className="relative h-10 w-12 rounded overflow-hidden shrink-0 bg-slate-200">
                        <Image src={photo.url} alt={photo.label} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold truncate text-[11px]">{photo.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {isAdded ? "✓ Đã thêm" : "+ Thêm ảnh"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Image URL Input */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-foreground">
                Hoặc dán URL hình ảnh từ bên ngoài
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.customImageUrl}
                  onChange={(e) => setFormData({ ...formData, customImageUrl: e.target.value })}
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomPhoto}
                  className="gap-1 shrink-0 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm URL
                </Button>
              </div>
            </div>

            {/* Selected Images Grid */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">
                  Danh sách ảnh đã chọn ({formData.images.length})
                </span>
                {formData.images.length < 3 && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    (Khuyến nghị thêm ít nhất 3 ảnh)
                  </span>
                )}
              </div>

              {validationErrors.images && (
                <p className="text-[11px] text-danger">{validationErrors.images}</p>
              )}

              {formData.images.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  Chưa có ảnh nào. Vui lòng chọn ảnh mẫu ở trên hoặc dán URL ảnh.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-lg overflow-hidden border border-border bg-slate-100 aspect-video"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Ảnh ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                      />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <Star className="h-3 w-3 fill-white" />
                          Ảnh đại diện
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryPhoto(idx)}
                            className="bg-white text-slate-800 text-[11px] font-semibold px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            Đặt làm ảnh chính
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700 cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================= STEP 3: TIỆN ÍCH & THÔNG SỐ ================= */}
      {currentStep === 3 && (
        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Bước 3: Tiện Ích & Thông Số Chi Tiết
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Các thông số rõ ràng giúp khách thuê đánh giá nhanh sự phù hợp với nhu cầu sinh hoạt.
              </p>
            </div>

            {/* Room Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Diện tích (m²) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                    className="text-xs pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">m²</span>
                </div>
                {validationErrors.area && (
                  <p className="text-[11px] text-danger">{validationErrors.area}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Số phòng ngủ</label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={1}>1 Phòng ngủ</option>
                  <option value={2}>2 Phòng ngủ</option>
                  <option value={3}>3 Phòng ngủ</option>
                  <option value={4}>4+ Phòng ngủ</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Số phòng vệ sinh</label>
                <select
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={1}>1 Phòng WC</option>
                  <option value={2}>2 Phòng WC</option>
                  <option value={3}>3+ Phòng WC</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Người ở tối đa</label>
                <select
                  value={formData.maxOccupants}
                  onChange={(e) => setFormData({ ...formData, maxOccupants: Number(e.target.value) })}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={1}>1 người</option>
                  <option value={2}>2 người</option>
                  <option value={3}>3 người</option>
                  <option value={4}>4 người</option>
                  <option value={6}>Không giới hạn</option>
                </select>
              </div>
            </div>

            {/* Amenities Checklist */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-foreground">
                  Danh mục tiện ích sẵn có ({formData.amenities.length} đã chọn)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Chọn tất cả các tiện ích áp dụng cho phòng này
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AMENITY_OPTIONS.map((item) => {
                  const isChecked = formData.amenities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleToggleAmenity(item)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        isChecked
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded flex items-center justify-center text-white ${
                          isChecked ? "bg-primary" : "border border-border"
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3" />}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================= STEP 4: GIÁ THUÊ & CHI PHÍ ================= */}
      {currentStep === 4 && (
        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Bước 4: Giá Thuê, Đặt Cọc & Chi Phí Dịch Vụ
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Minh bạch đơn giá điện, nước và chi phí phụ trợ giúp tránh tranh chấp phát sinh trong quá trình thuê.
              </p>
            </div>

            {/* Rent & Deposit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Giá thuê mỗi tháng (VND) <span className="text-danger">*</span>
                </label>
                <Input
                  type="number"
                  step={100000}
                  value={formData.rentPrice}
                  onChange={(e) => setFormData({ ...formData, rentPrice: Number(e.target.value) })}
                  className="text-xs font-bold text-primary"
                />
                <p className="text-[11px] text-muted-foreground">
                  Hiển thị: <strong className="text-foreground">{formatVND(formData.rentPrice)}/tháng</strong>
                </p>
                {validationErrors.rentPrice && (
                  <p className="text-[11px] text-danger">{validationErrors.rentPrice}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Tiền đặt cọc (VND) <span className="text-danger">*</span>
                </label>
                <Input
                  type="number"
                  step={100000}
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
                  className="text-xs"
                />
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deposit: formData.rentPrice })}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-foreground px-2 py-0.5 rounded cursor-pointer"
                  >
                    1 tháng tiền thuê
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deposit: formData.rentPrice * 2 })}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-foreground px-2 py-0.5 rounded cursor-pointer"
                  >
                    2 tháng tiền thuê
                  </button>
                </div>
              </div>
            </div>

            {/* Utility fee breakdown */}
            <div className="space-y-3 pt-3 border-t border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                Đơn giá dịch vụ & sinh hoạt
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Tiền điện (đ/kWh)</label>
                  <Input
                    type="number"
                    value={formData.electricityPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, electricityPrice: Number(e.target.value) })
                    }
                    className="text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Theo công tơ điện riêng từng phòng</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Tiền nước (đ/người/tháng)</label>
                  <Input
                    type="number"
                    value={formData.waterPrice}
                    onChange={(e) => setFormData({ ...formData, waterPrice: Number(e.target.value) })}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Khoán theo đầu người sinh sống</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Internet & Wifi (đ/tháng)</label>
                  <Input
                    type="number"
                    value={formData.internetPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, internetPrice: Number(e.target.value) })
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Phí rác & vệ sinh chung</label>
                  <Input
                    type="number"
                    value={formData.servicePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, servicePrice: Number(e.target.value) })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Phí giữ xe máy (đ/xe)</label>
                  <Input
                    type="number"
                    value={formData.parkingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, parkingPrice: Number(e.target.value) })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Hợp đồng tối thiểu</label>
                  <select
                    value={formData.minContractMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, minContractMonths: Number(e.target.value) })
                    }
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={3}>3 tháng</option>
                    <option value={6}>6 tháng</option>
                    <option value={12}>12 tháng</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================= STEP 5: XEM LẠI & GỬI DUYỆT ================= */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <Card className="border-border">
            <CardContent className="p-6 space-y-6">
              <div className="border-b border-border pb-3 flex justify-between items-center">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    Bước 5: Xem Lại & Gửi Phê Duyệt
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kiểm tra lại toàn bộ thông số tin đăng trước khi gửi đến ban kiểm duyệt hệ thống.
                  </p>
                </div>
                <StatusBadge status="pending" size="sm" />
              </div>

              {/* Quality Checklist */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  Đánh giá chất lượng tin đăng:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Tiêu đề rõ ràng ({formData.title.length} ký tự)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Hình ảnh đầy đủ ({formData.images.length} ảnh)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Minh bạch toàn bộ chi phí phụ trợ</span>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground mb-3">
                  Hiển thị thực tế trên sàn giao dịch
                </h3>
                <div className="max-w-md mx-auto rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
                  <div className="relative h-48 w-full bg-slate-200">
                    {formData.images[0] && (
                      <Image
                        src={formData.images[0]}
                        alt={formData.title}
                        fill
                        sizes="400px"
                        className="object-cover"
                      />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                        TIN MỚI
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="font-bold text-sm text-foreground line-clamp-2">
                      {formData.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{formData.address}, {formData.district}</span>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span>{formData.area} m²</span>
                      <span>•</span>
                      <span>{formData.bedrooms} PN</span>
                      <span>•</span>
                      <span>{formData.bathrooms} WC</span>
                    </div>
                    <div className="pt-2 border-t border-border flex items-baseline justify-between">
                      <div>
                        <span className="font-extrabold text-base text-primary">
                          {formatVND(formData.rentPrice)}
                        </span>
                        <span className="text-xs text-muted-foreground">/tháng</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Cọc: {formatVND(formData.deposit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Table */}
              <div className="space-y-3 pt-3 border-t border-border">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  Bảng tổng hợp chi phí & thông số
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-border bg-background">
                    <p className="text-muted-foreground">Tiền điện:</p>
                    <p className="font-bold text-foreground mt-0.5">
                      {formatVND(formData.electricityPrice)}/kWh
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-background">
                    <p className="text-muted-foreground">Tiền nước:</p>
                    <p className="font-bold text-foreground mt-0.5">
                      {formatVND(formData.waterPrice)}/người
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-background">
                    <p className="text-muted-foreground">Internet & rác:</p>
                    <p className="font-bold text-foreground mt-0.5">
                      {formatVND(formData.internetPrice + formData.servicePrice)}/tháng
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-background">
                    <p className="text-muted-foreground">Hợp đồng:</p>
                    <p className="font-bold text-foreground mt-0.5">
                      Tối thiểu {formData.minContractMonths} tháng
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wizard Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="gap-1 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {currentStep === 5 ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSubmit("draft")}
                className="cursor-pointer"
              >
                Lưu bản nháp
              </Button>
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={() => handleSubmit("pending")}
                className="gap-1 shadow-xs cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Gửi duyệt tin ngay
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
              className="gap-1 cursor-pointer"
            >
              Tiếp tục
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessDialog} onOpenChange={() => {}}>
        <DialogHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            {submittedStatus === "pending"
              ? "Gửi tin đăng thành công!"
              : "Đã lưu bản nháp thành công!"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground mt-2 leading-relaxed">
            {submittedStatus === "pending" ? (
              <>
                Tin đăng <strong className="text-foreground">&ldquo;{formData.title}&rdquo;</strong> đã được chuyển vào hàng đợi kiểm duyệt của ban quản trị hệ thống. Thời gian phê duyệt dự kiến từ <strong>2 - 4 giờ làm việc</strong>.
              </>
            ) : (
              <>
                Tin đăng đã được lưu vào danh sách bản nháp của bạn. Bạn có thể quay lại chỉnh sửa và xuất bản bất kỳ lúc nào.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-center gap-2 mt-5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("/dashboard/listings")}
            className="w-full sm:w-auto"
          >
            Về trang quản lý tin đăng
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
