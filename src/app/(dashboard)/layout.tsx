/**
 * Dashboard Layout
 *
 * Layout utama untuk semua halaman dashboard.
 * Akan berisi sidebar navigation, header, dan content area.
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* TODO: Sidebar navigation (Issue #04+) */}
      <aside className="hidden w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:block">
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <h2 className="text-lg font-semibold">BCT Service</h2>
        </div>
        <nav className="p-4">
          {/* Navigation items will be added in future issues */}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex flex-1 flex-col">
        {/* TODO: Header with user info (Issue #03) */}
        <header className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
