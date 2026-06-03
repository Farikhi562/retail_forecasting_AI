"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/forecasts", label: "Forecasts", icon: ChartNoAxesCombined },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({
  children,
  userEmail
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-ink text-white lg:block">
        <div className="flex h-full flex-col">
          <Link href="/dashboard" className="flex items-center gap-3 px-6 py-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500 text-white">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-wide text-teal-100">
                Retail
              </span>
              <span className="block text-lg font-bold">Forecast AI</span>
            </span>
          </Link>
          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-white text-ink"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-800 p-4">
            <p className="truncate text-xs text-slate-400">{userEmail}</p>
            <Button
              type="button"
              variant="ghost"
              className="mt-3 w-full justify-start text-slate-200 hover:bg-slate-800 hover:text-white"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="font-bold text-ink">
              Retail Forecast AI
            </Link>
            <Button type="button" variant="secondary" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-ink text-white"
                    : "bg-mist text-slate-700"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
