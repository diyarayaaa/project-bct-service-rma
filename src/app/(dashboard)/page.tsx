/**
 * Dashboard Home Page
 *
 * Halaman utama dashboard yang menampilkan ringkasan status service.
 * Akan diimplementasikan lebih lanjut di Issue #12.
 */

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Selamat Datang di BCT Service & RMA
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Dashboard monitoring dan manajemen service perangkat.
        </p>
      </div>

      {/* Placeholder cards - akan diimplementasikan di Issue #12 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h3 className="text-sm font-medium text-gray-500">Total Tiket Hari Ini</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h3 className="text-sm font-medium text-gray-500">Sedang Diproses</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h3 className="text-sm font-medium text-gray-500">Selesai</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h3 className="text-sm font-medium text-gray-500">Di Vendor</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}
