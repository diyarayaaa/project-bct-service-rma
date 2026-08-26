"use client";

import { useState, useTransition } from "react";
import { getOperationalReportDataAction, OperationalReportData } from "@/actions/report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ClipboardList, Copy, Calendar, Loader2 } from "lucide-react";
import { generateOperationalReportText } from "@/lib/report-helpers";

interface OperationalReportClientProps {
  initialDate: string;
  initialData: OperationalReportData;
}

export default function OperationalReportClient({
  initialDate,
  initialData,
}: OperationalReportClientProps) {
  const [date, setDate] = useState(initialDate);
  const [reportData, setReportData] = useState<OperationalReportData>(initialData);
  const [isPending, startTransition] = useTransition();

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (!newDate) return;

    startTransition(async () => {
      const res = await getOperationalReportDataAction(newDate);
      if (res.success && res.data) {
        setReportData(res.data);
      } else {
        toast.error(res.error || "Gagal memperbarui data laporan.");
      }
    });
  };

  const reportText = generateOperationalReportText(
    date,
    reportData.block1,
    reportData.block2,
    reportData.block3
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    toast.success("Laporan WA berhasil disalin ke clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-indigo-500" />
            Laporan WA Operasional (RMA)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Generator laporan operasional WhatsApp harian teknisi & pergerakan vendor.
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
              Ringkasan Data Laporan
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Barang ke Bandung (Hari Ini)</span>
                <span className="font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded">
                  {reportData.block1.length} unit
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Barang di Vendor BDG (Stok)</span>
                <span className="font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded">
                  {reportData.block2.length} unit
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Barang di Vendor JKT (Stok)</span>
                <span className="font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded">
                  {reportData.block3.length} unit
                </span>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-950 p-3 border dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              💡 <strong>Tips Laporan:</strong> Blok 2 dan Blok 3 memantau barang milik internal toko (STOCK BCT / GHITP) yang berstatus <em>PROSES_GARANSI</em>.
            </div>
          </div>
        </div>

        {/* Right Side: Live Report Preview Area */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-850 dark:bg-zinc-900 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pratinjau Output Teks WhatsApp
              </h3>
            </div>
            
            <Button
              onClick={handleCopy}
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 h-8 py-0 shadow-sm"
            >
              <Copy className="h-3.5 w-3.5" />
              Salin Laporan WA
            </Button>
          </div>

          <div className="relative p-6 flex-1 min-h-[400px]">
            {isPending && (
              <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Mengambil data terbaru...</span>
                </div>
              </div>
            )}
            
            <textarea
              readOnly
              value={reportText}
              className="w-full h-[500px] p-4 bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-850 rounded-lg text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none resize-none overflow-y-auto whitespace-pre leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
