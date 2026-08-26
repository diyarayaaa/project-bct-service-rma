/**
 * Dashboard Layout - Modern SaaS Bento Grid & Electric Blue UI/UX
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Glassmorphism Sidebar */}
      <aside className="hidden w-64 border-r border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 md:flex md:flex-col shrink-0 shadow-xs">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                BEST COMPUTEL
              </h2>
              <p className="text-[10px] font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase leading-none">
                Service & RMA System
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1.5">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-blue-50/80 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group"
                    >
                      <Icon className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
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
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-6 dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Pusat Layanan</span>
            <span className="text-xs text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-50">Best Computel</span>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-100 dark:border-blue-900">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-50 leading-tight">
                    {user.fullName}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <ShieldCheck className="h-3 w-3 text-blue-600" />
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
                  className="h-9 w-9 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
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
