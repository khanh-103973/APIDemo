"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  PlusCircle,
  User as UserIcon,
  Menu,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Home className="h-5 w-5" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            House<span className="text-primary">Rental</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/listings"
            className={`transition-colors hover:text-primary ${
              pathname.startsWith("/listings")
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            }`}
          >
            Tìm phòng thuê
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Giới thiệu
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Liên hệ
          </Link>
        </nav>

        {/* Desktop Role Quick Links & Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard/listings/new">
            <Button variant="accent" size="sm" className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Đăng tin cho thuê
            </Button>
          </Link>

          <div className="h-5 w-[1px] bg-border mx-1" />

          {/* Quick Mock Role Nav */}
          <Link href="/account/favorites">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
              <UserIcon className="h-4 w-4" />
              Khách thuê
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
              <Building className="h-4 w-4" />
              Chủ nhà
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              Admin
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="outline" size="sm">
              Đăng nhập
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Mở menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <Sheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        side="right"
        title="House Rental"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Link
              href="/listings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Search className="h-4 w-4 text-primary" />
              Tìm kiếm phòng & căn hộ
            </Link>
            <Link
              href="/dashboard/listings/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-accent hover:bg-emerald-50"
            >
              <PlusCircle className="h-4 w-4" />
              Đăng tin cho thuê
            </Link>
          </div>

          <div className="h-[1px] bg-border my-2" />

          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Khu vực quản lý
          </p>
          <div className="flex flex-col gap-1">
            <Link
              href="/account/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              Tài khoản Khách thuê
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <Building className="h-4 w-4 text-muted-foreground" />
              Bảng điều khiển Chủ nhà
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              Bảng điều hành Admin
            </Link>
          </div>

          <div className="h-[1px] bg-border my-2" />

          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">
                Đăng ký tài khoản
              </Button>
            </Link>
          </div>
        </div>
      </Sheet>
    </header>
  );
}
