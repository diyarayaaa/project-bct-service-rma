/**
 * Dashboard Layout
 *
 * Layout utama untuk semua halaman dashboard.
 * Akan berisi sidebar navigation, header, dan content area.
 */

import { cookies } from "next/headers";
import Link from "next/link";
import { verifyJWT } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { User, LogOut, LayoutGrid, Building2, Users, Settings2 } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = token ? await verifyJWT(token) : null;

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutGrid },
    { label: "Vendors", href: "/vendors", icon: Building2 },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "Preset Options", href: "/presets", icon: Settings2 },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="hidden w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Best Computel</h2>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 leading-tight">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-none">
                    {user.role}
                  </span>
                </div>
              </div>

              <form action={logoutAction}>
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="icon"
                  title="Sign Out"
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </header>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
