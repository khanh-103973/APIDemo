import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ListingNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        <EmptyState
          icon={Home}
          title="Không tìm thấy tin đăng"
          description="Tin đăng cho thuê này có thể đã bị xóa, hết hạn hoặc đường dẫn không chính xác."
        />
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/listings">
            <Button variant="primary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Khám phá các phòng khác
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
