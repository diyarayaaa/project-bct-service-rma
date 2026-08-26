"use client";

import { useState, useTransition } from "react";
import { getSalesReportDataAction, SalesReportData } from "@/actions/sales-report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BarChart3, Copy, Calendar, MessageCircle, Loader2 } from "lucide-react";
import { generateSalesReportText } from "@/lib/sales-report-helpers";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

interface SalesReportClientProps {
  initialDate: string;
  initialData: SalesReportData;
}

const SALES_PHONE_NUMBER = "6282120081484";

export default function SalesReportClient({
  initialDate,
  initialData,
}: SalesReportClientProps) {
  const [date, setDate] = useState(initialDate);
  const [reportData, setReportData] = useState<SalesReportData>(initialData);
  const [isPending, startTransition] = useTransition();

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (!newDate) return;

    startTransition(async () => {
      const res = await getSalesReportDataAction(newDate);
      if (res.success && res.data) {
        setReportData(res.data);
      } else {
        toast.error(res.error || "Gagal memperbarui data laporan sales.");
      }
    });
  };

  const reportText = generateSalesReportText(
    date,
    reportData.section1,
    reportData.section2,
    reportData.section3,
    reportData.section4
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    toast.success("Format Laporan Sales berhasil disalin ke clipboard!");
  };

  const handleSendWASales = () => {
    const formattedPhone = formatWhatsAppNumber(SALES_PHONE_NUMBER);
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(reportText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-500" />
            Laporan WA Sales <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">LAPORAN_WA_SALES</span>
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Generator laporan khusus sales untuk inventaris stok toko (STOCK BCT / GHITP).
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg px-3 py-1.5 shadow-sm max-w-xs">
          <Calendar className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <Input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 w-32 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Summary Card Details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-850 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm border-b dark:border-zinc-800 pb-2">
              Ringkasan Stok Sales
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">1. Garansian Selesai Hari Ini</span>
                <span className="font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded">
                  {reportData.section1.length} unit
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">2. Garansian di Vendor BDG</span>
                <span className="font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded">
                  {reportData.section2.length} unit
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">3. Garansian di Vendor JKT</span>
                <span className="font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded">
                  {reportData.section3.length} unit
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-zinc-100 dark:border-zinc-800 pt-2">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">4. Garansian Belum Diproses</span>
                <span className="font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 px-2 py-0.5 rounded">
                  {reportData.section4.length} unit
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 p-3 border border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
              📞 <strong>Target Sales:</strong> Laporan dikirimkan langsung ke nomor WA Sales: <code className="font-bold">0821-2008-1484</code>
            </div>
          </div>
        </div>

        {/* Right Side: Live Report Preview Area */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-850 dark:bg-zinc-900 overflow-hidden flex flex-col">
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pratinjau Format WA Sales
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSendWASales}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 h-8 py-0 shadow-sm"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Kirim ke WhatsApp Sales
              </Button>
              <Button
                onClick={handleCopy}
                disabled={isPending}
                variant="outline"
                className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1.5 h-8 py-0 shadow-sm"
              >
                <Copy className="h-3.5 w-3.5" />
                Salin Format Sales
              </Button>
            </div>
          </div>

          <div className="relative p-6 flex-1 min-h-[400px]">
            {isPending && (
              <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Mengambil data terbaru...</span>
                </div>
              </div>
            )}
            
            <textarea
              readOnly
              value={reportText}
              className="w-full h-[550px] p-4 bg-zinc-50 dark:bg-zinc-955 border dark:border-zinc-850 rounded-lg text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none resize-none overflow-y-auto whitespace-pre leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
