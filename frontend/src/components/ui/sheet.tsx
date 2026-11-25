"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "bottom";
  title?: string;
  children: React.ReactNode;
}

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  title,
  children,
}: SheetProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    }
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideStyles = {
    left: "inset-y-0 left-0 w-[85vw] max-w-sm border-r",
    right: "inset-y-0 right-0 w-[85vw] max-w-sm border-l",
    bottom: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl border-t",
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed z-50 bg-background p-4 sm:p-6 shadow-xl border-border transition-transform flex flex-col",
          sideStyles[side]
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border">
          {title && (
            <h3 className="font-heading font-semibold text-lg text-foreground">
              {title}
            </h3>
          )}
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-auto cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">{children}</div>
      </div>
    </div>
  );
}
