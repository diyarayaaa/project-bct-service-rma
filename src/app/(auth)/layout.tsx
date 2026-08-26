/**
 * Auth Layout
 *
 * Layout untuk halaman authentication (login, register, dll).
 * Menampilkan layout centered tanpa sidebar.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Logo / Brand */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Best Computel
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Service & Warranty Center
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
