/**
 * Dashboard Layout - Modern Minimalist & Executive UI/UX
 */

import { cookies } from "next/headers";
import Link from "next/link";
import { verifyJWT } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  LayoutGrid,
  Building2,
  Users,
  Settings2,
  FileText,
  Ticket,
  Truck,
  ClipboardList,
  BarChart3,
  Wrench,
  ShieldCheck,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = token ? await verifyJWT(token) : null;

  const navGroups = [
    {
      group: "OPERASIONAL",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutGrid },
        { label: "Pendaftaran (Intake)", href: "/intake", icon: FileText },
        { label: "Daftar Tiket Servis", href: "/tickets", icon: Ticket },
        { label: "Pengiriman Vendor", href: "/shipments", icon: Truck },
      ],
    },
    {
      group: "LAPORAN WA",
      items: [
        { label: "Laporan WA Operasional", href: "/reports/wa-operational", icon: ClipboardList },
        { label: "Laporan WA Sales", href: "/reports/wa-sales", icon: BarChart3 },
      ],
    },
    {
      group: "DATA MASTER",
      items: [
        { label: "Master Vendors", href: "/vendors", icon: Building2 },
        { label: "Master Customers", href: "/customers", icon: Users },
        { label: "Preset Form Options", href: "/presets", icon: Settings2 },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50/70 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-100">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/90 md:flex md:flex-col shrink-0 shadow-xs">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                BEST COMPUTEL
              </h2>
              <p className="text-[10px] font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase leading-none">
                Service & RMA System
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1.5">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all group"
                    >
                      <Icon className="h-4 w-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col min-w-0">
        {/* Header Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white/80 backdrop-blur-md px-6 dark:border-zinc-800/80 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">Pusat Layanan</span>
            <span className="text-xs text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Best Computel</span>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-200 dark:border-zinc-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-100 dark:border-indigo-900">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                    {user.fullName}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      <ShieldCheck className="h-3 w-3 text-indigo-500" />
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  title="Keluar / Logout"
                  className="h-9 w-9 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
