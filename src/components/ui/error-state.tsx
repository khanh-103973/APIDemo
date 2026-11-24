import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Đã xảy ra lỗi tải dữ liệu",
  message = "Không thể tải nội dung vào lúc này. Vui lòng kiểm tra lại kết nối hoặc thử lại sau.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-danger-border bg-danger-subtle p-8 text-center text-danger-subtle-foreground",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-danger mb-3">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm opacity-90">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 border-danger-border bg-white text-danger hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Thử lại
        </Button>
      )}
    </div>
  );
}
