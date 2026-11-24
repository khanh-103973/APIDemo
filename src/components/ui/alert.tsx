import * as React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "danger" | "info";
  title?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
    info: Info,
  };

  const IconComponent = icons[variant];

  const variantStyles = {
    success:
      "bg-success-subtle text-success-subtle-foreground border-success-border",
    warning:
      "bg-warning-subtle text-warning-subtle-foreground border-warning-border",
    danger:
      "bg-danger-subtle text-danger-subtle-foreground border-danger-border",
    info: "bg-info-subtle text-info-subtle-foreground border-info-border",
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-sm leading-relaxed",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <IconComponent className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="space-y-1">
        {title && <h5 className="font-semibold">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
