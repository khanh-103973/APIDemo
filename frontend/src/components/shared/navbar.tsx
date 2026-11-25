"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  PlusCircle,
  Menu,
  ShieldCheck,
  Building,
  KeyRound,
  ArrowRight,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useMockAuth } from "@/lib/auth/mock-auth";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useMockAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getRoleDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "landlord") return "/dashboard";
    return "/account/rentals";
  };

  const getRoleDashboardTitle = () => {
    if (!user) return "Đăng nhập";
    if (user.role === "admin") return "Khu vực Quản trị";
    if (user.role === "landlord") return "Quản lý phòng trọ";
    return "Phòng thuê của tôi";
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === "admin") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          Admin
        </span>
      );
    }
    if (user.role === "landlord") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
          Chủ nhà
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
        Khách thuê
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-purple-500 text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <Home className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold tracking-tight text-foreground leading-none">
              House<span className="text-primary">Rental</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
              Hệ thống phòng thuê Việt Nam
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
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
            href="/#areas"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Khu vực nổi bật
          </Link>
          <Link
            href="/#solutions"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Giải pháp
          </Link>
          <Link
            href="/#testimonials"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Đánh giá
          </Link>
        </nav>

        {/* Desktop Actions & User Session */}
        <div className="hidden md:flex items-center gap-3">
          {/* Post Listing CTA (Directs to landlord section or login) */}
          <Link href={user?.role === "landlord" ? "/dashboard/listings/new" : "/login?returnTo=/dashboard/listings/new"}>
            <Button variant="accent" size="sm" className="gap-1.5 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              Đăng tin cho thuê
            </Button>
          </Link>

          <div className="h-5 w-[1px] bg-border mx-1" />

          {/* Conditional Auth Interface: Logged-in vs Guest */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Role-specific Dashboard shortcut button */}
              <Link href={getRoleDashboardLink()}>
                <Button variant="outline" size="sm" className="gap-1.5 font-medium">
                  {user.role === "admin" && <ShieldCheck className="h-4 w-4 text-amber-600" />}
                  {user.role === "landlord" && <Building className="h-4 w-4 text-primary" />}
                  {user.role === "tenant" && <KeyRound className="h-4 w-4 text-emerald-600" />}
                  <span>{getRoleDashboardTitle()}</span>
                </Button>
              </Link>

              {/* User profile capsule with role badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-foreground leading-none">
                    {user.name}
                  </span>
                  <div className="mt-1">{getRoleBadge()}</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
                <UserIcon className="h-4 w-4" />
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
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
        <div className="flex flex-col gap-6 py-2">
          {/* Brand header in drawer */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="font-heading font-bold text-foreground">HouseRental</div>
              <div className="text-xs text-muted-foreground">Thuê & Quản lý phòng trọ</div>
            </div>
          </div>

          {/* User Status in Mobile Drawer */}
          {isAuthenticated && user ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {getRoleBadge()}
              </div>
              <Link
                href={getRoleDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full mt-2 block"
              >
                <Button variant="primary" size="sm" className="w-full gap-2">
                  <span>Vào {getRoleDashboardTitle()}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Đăng nhập bằng email để truy cập giao diện theo phân quyền của bạn.
              </p>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block"
              >
                <Button variant="primary" size="sm" className="w-full gap-1.5">
                  <UserIcon className="h-4 w-4" />
                  Đăng nhập tài khoản
                </Button>
              </Link>
            </div>
          )}

          {/* Nav links */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Khám phá
            </p>
            <Link
              href="/listings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground"
            >
              <span>Tìm kiếm phòng thuê</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/#areas"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground"
            >
              <span>Khu vực nổi bật</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm font-medium text-foreground"
            >
              <span>Giải pháp hệ thống</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <Link
              href={user?.role === "landlord" ? "/dashboard/listings/new" : "/login?returnTo=/dashboard/listings/new"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="accent" className="w-full gap-2">
                <PlusCircle className="h-4 w-4" />
                Đăng tin cho thuê miễn phí
              </Button>
            </Link>
            {isAuthenticated && (
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </Button>
            )}
          </div>
        </div>
      </Sheet>
    </header>
  );
}
