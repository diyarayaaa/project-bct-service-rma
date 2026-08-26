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
  Calendar,
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Executive Dashboard & Monitoring Operasional
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Ringkasan antrian servis teknisi, status klaim vendor, dan penyelesaian unit.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => router.push("/intake")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 shadow-xs rounded-xl flex items-center gap-1.5 px-3.5"
          >
            <PlusCircle className="h-4 w-4" />
            Input Tiket
          </Button>

          <Button
            onClick={() => router.push("/shipments")}
            variant="outline"
            className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs h-9 rounded-xl shadow-xs flex items-center gap-1.5 px-3.5 bg-white dark:bg-zinc-900"
          >
            <FileText className="h-4 w-4 text-amber-500" />
            Surat Jalan
          </Button>

          <Button
            onClick={() => router.push("/reports/wa-operational")}
            variant="outline"
            className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs h-9 rounded-xl shadow-xs flex items-center gap-1.5 px-3.5 bg-white dark:bg-zinc-900"
          >
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            Laporan RMA
          </Button>

          <Button
            onClick={() => router.push("/reports/wa-sales")}
            variant="outline"
            className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs h-9 rounded-xl shadow-xs flex items-center gap-1.5 px-3.5 bg-white dark:bg-zinc-900"
          >
            <BarChart3 className="h-4 w-4 text-blue-500" />
            Laporan Sales
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isPending}
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin text-indigo-500" : ""}`} />
          </Button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Service Aktif */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Antrian Service Aktif
            </span>
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-2.5 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {data.metrics.totalActiveService}
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
              On Progress
            </span>
          </div>
        </div>

        {/* Metric 2: Selesai Belum Diambil */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Selesai Belum Diambil
            </span>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/60 p-2.5 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60">
              <PackageCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {data.metrics.totalCompletedUnclaimed}
            </span>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              Menunggu User
            </span>
          </div>
        </div>

        {/* Metric 3: Garansi Aktif di Vendor */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Garansi / Alih Vendor
            </span>
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/60 p-2.5 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/60">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {data.metrics.totalVendorActive}
            </span>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
              Vendor BDG/JKT
            </span>
          </div>
        </div>

        {/* Metric 4: Masuk Hari Ini */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Unit Masuk Hari Ini
            </span>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2.5 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {data.metrics.totalTodayIntake}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Intake Baru
            </span>
          </div>
        </div>
      </div>

      {/* Global Search Bar & Technician Filter Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Cari No Tiket, Nama Customer, No HP, SN, atau Perangkat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl"
          />
        </div>

        {/* Technician Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-zinc-400 mr-1 flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            Teknisi:
          </span>
          <button
            onClick={() => setSelectedTech("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedTech === "ALL"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Semua
          </button>
          {data.technicians.map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedTech.toLowerCase() === tech.toLowerCase()
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                Antrian Service On Progress ({filteredActiveServices.length})
              </h3>
            </div>
          </div>

          <div className="p-6">
            {filteredActiveServices.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  Tidak ada antrian servis aktif.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredActiveServices.map((ticket) => {
                  const daysInQueue = getDaysAgo(ticket.createdAt);
                  const isPendingStatus = ticket.status === "PENDING_SERVICE";
                  const techName = ticket.technician?.fullName || ticket.technician?.username;

                  return (
                    <div
                      key={ticket.id}
                      className={`relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all duration-200 hover:shadow-md ${
                        isPendingStatus
                          ? "border-amber-300 bg-amber-50/30 dark:border-amber-900/60 dark:bg-amber-950/20"
                          : "border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950"
                      }`}
                    >
                      <div className="space-y-3 text-xs">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                          <div>
                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {ticket.ticketNumber}
                            </span>
                            <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 font-medium">
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
                              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                👨‍🔧 {techName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer & Device Information */}
                        <div className="space-y-1">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                            <Smartphone className="h-4 w-4 text-indigo-500 shrink-0" />
                            {ticket.deviceName}
                          </div>
                          <div className="text-zinc-500 dark:text-zinc-400 text-xs">
                            SN: <code className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{ticket.serialNumber}</code>
                          </div>
                          <div className="text-zinc-600 dark:text-zinc-300 text-xs">
                            Customer: <strong>{ticket.customer.name}</strong> ({ticket.customer.phone})
                          </div>
                        </div>

                        {/* Complaint Box */}
                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-100 dark:border-zinc-800 text-xs">
                          <span className="font-bold text-zinc-400 uppercase text-[10px] block mb-0.5">Keluhan:</span>
                          <span className="text-zinc-800 dark:text-zinc-200 leading-relaxed">{ticket.complaint}</span>
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
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-end gap-2">
                        <Button
                          onClick={() => setSelectedTicketForWA(ticket)}
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-semibold border-emerald-200/80 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-1 rounded-xl"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                          WA
                        </Button>

                        <Button
                          onClick={() => setSelectedTicketForStatus(ticket)}
                          size="sm"
                          className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 rounded-xl"
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
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                Barang Selesai Belum Diambil ({filteredCompletedUnclaimed.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredCompletedUnclaimed.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Tidak ada barang selesai yang tertahan.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
                <thead className="bg-zinc-50/80 text-zinc-500 dark:bg-zinc-900/80 dark:text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3.5">No Tiket</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Perangkat / SN</th>
                    <th className="px-6 py-3.5">Hasil Service</th>
                    <th className="px-6 py-3.5">Lama Tertahan</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                  {filteredCompletedUnclaimed.map((ticket) => {
                    const daysUnclaimed = getDaysAgo(ticket.updatedAt);
                    const isLongOverdue = daysUnclaimed >= 7;

                    return (
                      <tr key={ticket.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {ticket.ticketNumber}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {ticket.customer.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">{ticket.customer.phone}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {ticket.deviceName}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400">SN: {ticket.serialNumber}</div>
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
                              className="h-8 text-xs font-semibold border-emerald-200/80 text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-400 rounded-xl"
                            >
                              WA
                            </Button>

                            <Button
                              onClick={() => setSelectedTicketForStatus(ticket)}
                              size="sm"
                              className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 rounded-xl"
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
