"use client";

import { useState, useTransition } from "react";
import { getSalesReportDataAction, SalesReportData } from "@/actions/sales-report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BarChart3, Copy, Calendar, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

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
    setCopied(true);
    toast.success("Format Laporan Sales berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWASales = () => {
    const formattedPhone = formatWhatsAppNumber(SALES_PHONE_NUMBER);
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(reportText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            Laporan WA Sales (STOK BCT / GHITP)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generator laporan khusus inventaris stok toko internal (STOCK BCT / GHITP).
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full px-4 py-1.5 shadow-xs">
          <Calendar className="h-4 w-4 text-emerald-500" />
          <Input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0 w-32 font-mono dark:text-slate-100"
          />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Summary Card Details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800/90 dark:bg-slate-900 space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Ringkasan Stok Sales ({date})
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">1. Garansian Selesai Hari Ini</span>
                <span className="font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  {reportData.section1.length} unit
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">2. Garansian di Vendor BDG</span>
                <span className="font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900">
                  {reportData.section2.length} unit
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">3. Garansian di Vendor JKT</span>
                <span className="font-bold bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900">
                  {reportData.section3.length} unit
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-slate-600 dark:text-slate-300 font-medium">4. Garansian Belum Diproses</span>
                <span className="font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-900">
                  {reportData.section4.length} unit
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 border border-emerald-100 dark:border-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              📞 <strong>Target Nomor Sales:</strong> Kirim langsung ke WhatsApp Sales: <code className="font-bold">0821-2008-1484</code>
            </div>
          </div>
        </div>

        {/* Right Side: Live Report Preview Area */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800/90 dark:bg-slate-900 overflow-hidden flex flex-col">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Pratinjau Format Pesan WA Sales
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSendWASales}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 h-8.5 px-3.5 rounded-xl shadow-xs"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Kirim WA Sales
              </Button>
              <Button
                onClick={handleCopy}
                disabled={isPending}
                variant="outline"
                className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 h-8.5 px-3.5 rounded-xl shadow-xs bg-white dark:bg-slate-900"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Tersalin!" : "Salin Format"}
              </Button>
            </div>
          </div>

          <div className="relative p-6 flex-1 min-h-[400px]">
            {isPending && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Mengambil data terbaru...</span>
                </div>
              </div>
            )}

            <textarea
              readOnly
              value={reportText}
              className="w-full h-[520px] p-4 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none resize-none overflow-y-auto whitespace-pre leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
