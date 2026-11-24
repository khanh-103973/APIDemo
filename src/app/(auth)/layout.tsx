import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Auth Simple Header */}
      <header className="border-b border-border bg-background px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-4 w-4" />
            </div>
            <span className="font-heading text-lg font-bold">
              House<span className="text-primary">Rental</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Link>
        </div>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        © 2026 House Rental System. Môi trường kiểm thử dữ liệu mẫu.
      </footer>
    </div>
  );
}
