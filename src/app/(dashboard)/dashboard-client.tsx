"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardData, DashboardTicketItem, getDashboardDataAction } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wrench,
  PackageCheck,
  Truck,
  PlusCircle,
  FileText,
  MessageSquare,
  Search,
  AlertTriangle,
  Clock,
  User,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Sparkles,
} from "lucide-react";
import StatusDialog from "@/components/tickets/status-dialog";
import WhatsAppDialog from "@/components/tickets/whatsapp-dialog";
import { toast } from "sonner";

interface VendorOption {
  id: string;
  name: string;
  aliasCode: string | null;
}

interface DashboardClientProps {
  initialData: DashboardData;
  vendors: VendorOption[];
}

export default function DashboardClient({
  initialData,
  vendors,
}: DashboardClientProps) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Status & WA Dialog states
  const [selectedTicketForStatus, setSelectedTicketForStatus] = useState<DashboardTicketItem | null>(null);
  const [selectedTicketForWA, setSelectedTicketForWA] = useState<DashboardTicketItem | null>(null);

  const handleRefresh = () => {
    startTransition(async () => {
      const res = await getDashboardDataAction();
      if (res.success && res.data) {
        setData(res.data);
        toast.success("Data dashboard berhasil diperbarui.");
      } else {
        toast.error("Gagal memperbarui data dashboard.");
      }
    });
  };

  // Helper to calculate days passed
  const getDaysAgo = (dateInput: Date | string): number => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter Active Services
  const filteredActiveServices = data.activeServices.filter((ticket) => {
    if (selectedTech !== "ALL") {
      const techName = ticket.technician?.fullName || ticket.technician?.username || "";
      if (techName.toLowerCase() !== selectedTech.toLowerCase()) {
        return false;
      }
    }

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    return (
      ticket.ticketNumber.toLowerCase().includes(query) ||
      ticket.customer.name.toLowerCase().includes(query) ||
      ticket.customer.phone.toLowerCase().includes(query) ||
      ticket.deviceName.toLowerCase().includes(query) ||
      ticket.serialNumber.toLowerCase().includes(query) ||
      ticket.complaint.toLowerCase().includes(query)
    );
  });

  // Filter Completed Unclaimed
  const filteredCompletedUnclaimed = data.completedUnclaimed.filter((ticket) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    return (
      ticket.ticketNumber.toLowerCase().includes(query) ||
      ticket.customer.name.toLowerCase().includes(query) ||
      ticket.customer.phone.toLowerCase().includes(query) ||
      ticket.deviceName.toLowerCase().includes(query) ||
      ticket.serialNumber.toLowerCase().includes(query)
    );
  });

  // Helper to map DashboardTicketItem to StatusDialog Ticket interface
  const mapTicketForStatusDialog = (t: DashboardTicketItem) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    entryDate: t.entryDate ? new Date(t.entryDate).toISOString() : new Date(t.createdAt).toISOString(),
    serviceType: t.serviceType,
    customer: {
      id: t.customer.id,
      name: t.customer.name,
      phone: t.customer.phone,
    },
    deviceType: t.deviceType || "OTHER",
    deviceName: t.deviceName,
    serialNumber: t.serialNumber,
    complaint: t.complaint,
    accessories: t.accessories || [],
    estimatedCompletionDate: t.estimatedCompletionDate ? new Date(t.estimatedCompletionDate).toISOString() : null,
    status: t.status,
    notes: t.notes,
    estimatedCost: t.estimatedCost ? String(t.estimatedCost) : "0",
    dpAmount: t.dpAmount ? String(t.dpAmount) : "0",
    remainingCost: "0",
    finalCost: t.finalCost ? String(t.finalCost) : null,
    pickupDate: t.pickupDate ? new Date(t.pickupDate).toISOString() : null,
    technician: t.technician || { id: "", username: "Belum Ditentukan", fullName: "Belum Ditentukan" },
    vendorId: t.vendorId,
    vendor: t.vendor,
    vendorSentDate: t.vendorSentDate ? new Date(t.vendorSentDate).toISOString() : null,
    vendorReceivedDate: t.vendorReceivedDate ? new Date(t.vendorReceivedDate).toISOString() : null,
    vendorResult: t.vendorResult,
    newSerialNumber: t.newSerialNumber,
  });

  // Helper to map DashboardTicketItem to WhatsAppDialog Ticket interface
  const mapTicketForWADialog = (t: DashboardTicketItem) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    entryDate: t.entryDate || t.createdAt,
    serviceType: t.serviceType,
    customer: {
      name: t.customer.name,
      phone: t.customer.phone,
    },
    deviceType: t.deviceType || "OTHER",
    deviceName: t.deviceName,
    serialNumber: t.serialNumber,
    complaint: t.complaint,
    accessories: t.accessories || [],
    estimatedCompletionDate: t.estimatedCompletionDate,
    technician: {
      fullName: t.technician?.fullName || t.technician?.username || "Teknisi",
    },
    status: t.status,
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Shortcuts */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200/60 dark:border-blue-900/60 text-blue-600 dark:text-blue-400">
              <Wrench className="h-5 w-5" />
            </div>
            Dashboard Monitoring Operasional
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pusat kendali antrian servis teknisi, status klaim vendor, dan barang selesai.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => router.push("/intake")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9.5 px-4 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2 transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" />
            Input Tiket Baru
          </Button>

          <Button
            onClick={() => router.push("/shipments")}
            variant="outline"
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs h-9.5 px-3.5 rounded-xl shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 bg-white dark:bg-slate-900 transition-all"
          >
            <FileText className="h-4 w-4 text-amber-500" />
            Surat Jalan
          </Button>

          <Button
            onClick={() => router.push("/reports/wa-operational")}
            variant="outline"
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs h-9.5 px-3.5 rounded-xl shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 bg-white dark:bg-slate-900 transition-all"
          >
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            Laporan WA RMA
          </Button>

          <Button
            onClick={() => router.push("/reports/wa-sales")}
            variant="outline"
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs h-9.5 px-3.5 rounded-xl shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 bg-white dark:bg-slate-900 transition-all"
          >
            <BarChart3 className="h-4 w-4 text-blue-500" />
            Laporan WA Sales
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isPending}
            variant="ghost"
            size="icon"
            className="h-9.5 w-9.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin text-blue-600" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Bento Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Card 1: Antrian Service Aktif (Bento Grid Col-Span-2 Hero Card) */}
        <div className="bg-gradient-to-br from-blue-50/90 via-white to-white dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 p-6 rounded-2xl shadow-xs hover:shadow-md hover:shadow-blue-500/10 hover:border-blue-500/40 transition-all duration-300 col-span-1 md:col-span-2 group flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Antrian Service Aktif
              </p>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 mt-2 tracking-tight">
                {data.metrics.totalActiveService}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950/80 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 text-blue-600 dark:text-blue-400 shadow-xs">
              <Wrench className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
              <Sparkles className="h-3 w-3" /> On Progress & Pending
            </span>
          </div>
        </div>

        {/* Card 2: Selesai Belum Diambil (Col-Span-1) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all duration-300 col-span-1 group flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Selesai Belum Diambil
                </p>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2 tracking-tight">
                {data.metrics.totalCompletedUnclaimed}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 text-amber-600 dark:text-amber-400">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60">
              Menunggu Customer
            </span>
          </div>
        </div>

        {/* Card 3: Garansi Aktif di Vendor (Col-Span-1) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all duration-300 col-span-1 group flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Garansi / Alih Vendor
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2 tracking-tight">
                {data.metrics.totalVendorActive}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 text-purple-600 dark:text-purple-400">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200/60">
              Vendor BDG / JKT
            </span>
          </div>
        </div>
      </div>

      {/* Modern Filter Row: Fully Rounded Search Pill & Segmented Control Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
        {/* Search Bar Pill */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari No Tiket, Nama Customer, No HP, SN, atau Perangkat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 text-xs h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-full focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all"
          />
        </div>

        {/* iOS / SaaS Style Segmented Control Tabs for Technicians */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-2xl overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> Teknisi:
          </span>
          <button
            onClick={() => setSelectedTech("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
              selectedTech === "ALL"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Semua
          </button>
          {data.technicians.map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                selectedTech.toLowerCase() === tech.toLowerCase()
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Service On Progress & Barang Belum Diambil */}
      <div className="space-y-8">
        {/* SECTION 1: SERVICE ON PROGRESS QUEUE */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800/90 dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-50 uppercase">
                Antrian Service On Progress ({filteredActiveServices.length})
              </h3>
            </div>
          </div>

          <div className="p-6">
            {filteredActiveServices.length === 0 ? (
              <div className="py-14 text-center">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-100 dark:border-blue-900/50">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Tidak ada antrian servis aktif.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Semua unit terproses atau tidak ada data yang cocok dengan kueri pencarian.
                </p>
              </div>
            ) : (
              <div className="grid gap-4.5 md:grid-cols-2 lg:grid-cols-3">
                {filteredActiveServices.map((ticket) => {
                  const daysInQueue = getDaysAgo(ticket.createdAt);
                  const isPendingStatus = ticket.status === "PENDING_SERVICE";
                  const techName = ticket.technician?.fullName || ticket.technician?.username;

                  return (
                    <div
                      key={ticket.id}
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${
                        isPendingStatus
                          ? "border-amber-300 bg-amber-50/30 dark:border-amber-900/60 dark:bg-amber-950/20"
                          : "border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-950 hover:border-blue-500/40"
                      }`}
                    >
                      <div className="space-y-3.5 text-xs">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                          <div>
                            <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400">
                              {ticket.ticketNumber}
                            </span>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                              <Clock className="h-3 w-3" />
                              {daysInQueue === 0 ? "Hari ini" : `${daysInQueue} hari di antrian`}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {isPendingStatus ? (
                              <span className="badge-pending">
                                <AlertTriangle className="h-3 w-3" /> PENDING
                              </span>
                            ) : (
                              <span className="badge-proses">
                                PROSES SERVICE
                              </span>
                            )}
                            {techName && (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                👨‍🔧 {techName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer & Device Information */}
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                            <Smartphone className="h-4 w-4 text-blue-600 shrink-0" />
                            {ticket.deviceName}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs">
                            SN: <code className="font-mono font-bold text-slate-800 dark:text-slate-200">{ticket.serialNumber}</code>
                          </div>
                          <div className="text-slate-600 dark:text-slate-300 text-xs">
                            Customer: <strong>{ticket.customer.name}</strong> ({ticket.customer.phone})
                          </div>
                        </div>

                        {/* Complaint Box */}
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-bold text-slate-400 uppercase text-[10px] block mb-0.5">Keluhan:</span>
                          <span className="text-slate-800 dark:text-slate-200 leading-relaxed">{ticket.complaint}</span>
                        </div>

                        {/* Pending Reason Banner */}
                        {ticket.notes && (
                          <div className="rounded-xl bg-amber-100/70 dark:bg-amber-950/60 p-2.5 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong>Catatan / Alasan Pending:</strong> {ticket.notes}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-2">
                        <Button
                          onClick={() => setSelectedTicketForWA(ticket)}
                          variant="outline"
                          size="sm"
                          className="h-8.5 text-xs font-semibold border-emerald-200/80 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-1 rounded-xl"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                          WA
                        </Button>

                        <Button
                          onClick={() => setSelectedTicketForStatus(ticket)}
                          size="sm"
                          className="h-8.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 rounded-xl shadow-xs shadow-blue-500/20"
                        >
                          Update Status
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: BARANG BELUM DIAMBIL QUEUE */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800/90 dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-50 uppercase">
                Barang Selesai Belum Diambil ({filteredCompletedUnclaimed.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredCompletedUnclaimed.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Tidak ada barang selesai yang tertahan.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/80 text-slate-500 dark:bg-slate-900/80 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">No Tiket</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Perangkat / SN</th>
                    <th className="px-6 py-3.5">Hasil Service</th>
                    <th className="px-6 py-3.5">Lama Tertahan</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredCompletedUnclaimed.map((ticket) => {
                    const daysUnclaimed = getDaysAgo(ticket.updatedAt);
                    const isLongOverdue = daysUnclaimed >= 7;

                    return (
                      <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-6 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {ticket.ticketNumber}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {ticket.customer.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{ticket.customer.phone}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {ticket.deviceName}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">SN: {ticket.serialNumber}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {ticket.vendorResult || "Selesai Perbaikan"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          {isLongOverdue ? (
                            <span className="badge-gagal flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" /> {daysUnclaimed} Hari (Follow-up)
                            </span>
                          ) : (
                            <span className="badge-pending">
                              {daysUnclaimed === 0 ? "Hari ini" : `${daysUnclaimed} hari`}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setSelectedTicketForWA(ticket)}
                              variant="outline"
                              size="sm"
                              className="h-8.5 text-xs font-semibold border-emerald-200/80 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-400 rounded-xl"
                            >
                              WA
                            </Button>

                            <Button
                              onClick={() => setSelectedTicketForStatus(ticket)}
                              size="sm"
                              className="h-8.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 rounded-xl shadow-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Serahkan
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modals: Status Dialog & WhatsApp Dialog */}
      {selectedTicketForStatus && (
        <StatusDialog
          isOpen={!!selectedTicketForStatus}
          onOpenChange={(open) => !open && setSelectedTicketForStatus(null)}
          ticket={mapTicketForStatusDialog(selectedTicketForStatus)}
          vendors={vendors}
          onSuccess={() => {
            setSelectedTicketForStatus(null);
            handleRefresh();
          }}
        />
      )}

      {selectedTicketForWA && (
        <WhatsAppDialog
          isOpen={!!selectedTicketForWA}
          onOpenChange={(open) => !open && setSelectedTicketForWA(null)}
          ticket={mapTicketForWADialog(selectedTicketForWA)}
        />
      )}
    </div>
  );
}
