import { BarChart3 } from "lucide-react";

export default function SalesReportPlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-955 mb-4 border dark:border-zinc-800">
        <BarChart3 className="h-6 w-6 text-zinc-400 dark:text-zinc-500 animate-pulse" />
      </div>
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-55">
        Laporan WA Sales
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
        Halaman laporan WhatsApp penjualan barang sedang dipersiapkan untuk diimplementasikan pada Issue #11.
      </p>
    </div>
  );
}
