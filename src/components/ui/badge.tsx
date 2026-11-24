import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral"
    | "primary"
    | "secondary";
  appearance?: "subtle" | "solid";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  appearance = "subtle",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-semibold rounded-[4px] leading-none transition-colors";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  // WCAG verified token pairs:
  const subtleStyles = {
    success:
      "bg-success-subtle text-success-subtle-foreground border border-success-border",
    warning:
      "bg-warning-subtle text-warning-subtle-foreground border border-warning-border",
    danger:
      "bg-danger-subtle text-danger-subtle-foreground border border-danger-border",
    info: "bg-info-subtle text-info-subtle-foreground border border-info-border",
    neutral:
      "bg-neutral-subtle text-neutral-subtle-foreground border border-neutral-border",
    primary: "bg-secondary text-secondary-foreground border border-purple-200",
    secondary: "bg-slate-100 text-slate-700 border border-slate-300",
  };

  const solidStyles = {
    success: "bg-success text-success-foreground border border-transparent",
    warning: "bg-warning text-warning-foreground border border-transparent",
    danger: "bg-danger text-danger-foreground border border-transparent",
    info: "bg-info text-info-foreground border border-transparent",
    neutral: "bg-neutral text-neutral-foreground border border-transparent",
    primary: "bg-primary text-primary-foreground border border-transparent",
    secondary: "bg-secondary-foreground text-white border border-transparent",
  };

  return (
    <span
      className={cn(
        baseStyles,
        sizeStyles[size],
        appearance === "solid" ? solidStyles[variant] : subtleStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
