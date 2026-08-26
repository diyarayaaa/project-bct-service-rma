"use client";

import { useState, useTransition, useEffect } from "react";
import { updateTicketStatusAction } from "@/actions/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircle, Calendar, DollarSign, Settings, ShieldAlert, Truck } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface UserSummary {
  id: string;
  username: string;
  fullName: string;
}

interface Vendor {
  id: string;
  name: string;
  aliasCode: string | null;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  entryDate: string;
  serviceType: "SERVICE" | "GARANSI";
  customer: Customer;
  deviceType: string;
  deviceName: string;
  serialNumber: string;
  complaint: string;
  accessories: string[];
  estimatedCompletionDate: string | null;
  status: string;
  notes: string | null;
  estimatedCost: string;
  dpAmount: string;
  remainingCost: string;
  finalCost: string | null;
  pickupDate: string | null;
  technician: UserSummary;
  vendorId: string | null;
  vendor: Vendor | null;
  vendorSentDate: string | null;
  vendorReceivedDate: string | null;
  vendorResult: string | null;
  newSerialNumber: string | null;
}

interface StatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
  vendors: Vendor[];
  onSuccess: (updatedTicket: any) => void;
}

export default function StatusDialog({
  isOpen,
  onOpenChange,
  ticket,
  vendors,
  onSuccess,
}: StatusDialogProps) {
  const [isPending, startTransition] = useTransition();

  // Controlled form states
  const [status, setStatus] = useState(ticket.status);
  const [notes, setNotes] = useState(ticket.notes || "");
  const [vendorId, setVendorId] = useState(ticket.vendorId || "");
  const [vendorSentDate, setVendorSentDate] = useState("");
  const [vendorReceivedDate, setVendorReceivedDate] = useState("");
  const [vendorResult, setVendorResult] = useState(ticket.vendorResult || "");
  const [newSerialNumber, setNewSerialNumber] = useState(ticket.newSerialNumber || "");
  const [finalCost, setFinalCost] = useState<string>(ticket.finalCost || ticket.estimatedCost || "0");
  const [pickupDate, setPickupDate] = useState("");

  const formatDateForInput = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    return dateStr.slice(0, 10);
  };

  // Sync state with ticket when dialog opens / ticket changes
  useEffect(() => {
    setStatus(ticket.status);
    setNotes(ticket.notes || "");
    setVendorId(ticket.vendorId || "");
    setVendorSentDate(formatDateForInput(ticket.vendorSentDate));
    setVendorReceivedDate(formatDateForInput(ticket.vendorReceivedDate));
    setVendorResult(ticket.vendorResult || "");
    setNewSerialNumber(ticket.newSerialNumber || "");
    setFinalCost(ticket.finalCost || ticket.estimatedCost || "0");
    setPickupDate(formatDateForInput(ticket.pickupDate) || formatDateForInput(new Date().toISOString()));
  }, [ticket, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("status", status);
    formData.append("notes", notes);

    if (status === "ALIH_SERVICE" || status === "PROSES_GARANSI") {
      formData.append("vendorId", vendorId);
      if (vendorSentDate) formData.append("vendorSentDate", vendorSentDate);
      if (vendorReceivedDate) formData.append("vendorReceivedDate", vendorReceivedDate);
      if (vendorResult) formData.append("vendorResult", vendorResult);
      if (newSerialNumber) formData.append("newSerialNumber", newSerialNumber);
    }

    if (status === "SELESAI_DAN_DIAMBIL" || status === "GAGAL_SERVICE_GARANSI") {
      formData.append("finalCost", finalCost);
      if (pickupDate) formData.append("pickupDate", pickupDate);
    }

    startTransition(async () => {
      const res = await updateTicketStatusAction(ticket.id, null, formData);
      if (res.success && res.data) {
        toast.success("Status tiket servis berhasil diperbarui");
        onSuccess(res.data);
      } else {
        toast.error(res.error || "Gagal mengubah status tiket");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Settings className="h-5 w-5 text-zinc-500 animate-spin-slow" />
              Update Status Tiket - {ticket.ticketNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
            {/* Header Unit Info */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                {ticket.deviceName}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Customer: <span className="font-bold text-zinc-700 dark:text-zinc-300">{ticket.customer.name}</span> | SN: {ticket.serialNumber}
              </div>
            </div>

            {/* Select Status */}
            <div className="space-y-1.5">
              <label htmlFor="status" className="font-bold text-zinc-700 dark:text-zinc-300">
                Pilih Status Layanan *
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="PROSES_SERVICE">PROSES SERVICE (Dalam Antrian)</option>
                <option value="PENDING_SERVICE">PENDING SERVICE (Menunggu Sparepart/User)</option>
                <option value="ALIH_SERVICE">ALIH SERVICE (Kirim ke Vendor Luar)</option>
                <option value="PROSES_GARANSI">PROSES GARANSI (Klaim Vendor)</option>
                <option value="SELESAI_BELUM_DIAMBIL">SELESAI BELUM DIAMBIL</option>
                <option value="SELESAI_DAN_DIAMBIL">SELESAI & DIAMBIL CUSTOMER</option>
                <option value="GAGAL_SERVICE_GARANSI">GAGAL / BATAL SERVICE</option>
              </select>
            </div>

            {/* CONDITIONAL SECTION: PENDING_SERVICE */}
            {status === "PENDING_SERVICE" && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/10 space-y-2">
                <div className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  Catatan Pending
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masukkan alasan pending (Contoh: Menunggu konfirmasi LCD dari user, menunggu part datang...)"
                  className="flex min-h-[60px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
            )}

            {/* CONDITIONAL SECTION: ALIH_SERVICE or PROSES_GARANSI */}
            {(status === "ALIH_SERVICE" || status === "PROSES_GARANSI") && (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 dark:border-indigo-900/30 dark:bg-indigo-950/10 space-y-3">
                <div className="font-semibold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5">
                  <Truck className="h-4 w-4 animate-bounce" />
                  Informasi Alih Vendor / Garansi
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vendorId" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Pilih Vendor *
                  </label>
                  <select
                    id="vendorId"
                    required
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="">-- Pilih Vendor --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.aliasCode ? `(${v.aliasCode})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="vendorSentDate" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      Tgl Kirim ke Vendor
                    </label>
                    <Input
                      id="vendorSentDate"
                      type="date"
                      value={vendorSentDate}
                      onChange={(e) => setVendorSentDate(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="vendorReceivedDate" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      Tgl Datang dari Vendor
                    </label>
                    <Input
                      id="vendorReceivedDate"
                      type="date"
                      value={vendorReceivedDate}
                      onChange={(e) => setVendorReceivedDate(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="vendorResult" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      Hasil Servis / Garansi
                    </label>
                    <select
                      id="vendorResult"
                      value={vendorResult}
                      onChange={(e) => setVendorResult(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                      <option value="">-- Belum Ada Hasil --</option>
                      <option value="DISERVICE">DISERVICE (Selesai Diperbaiki)</option>
                      <option value="DIGANTI_BARU">DIGANTI BARU</option>
                    </select>
                  </div>

                  {status === "PROSES_GARANSI" && vendorResult === "DIGANTI_BARU" && (
                    <div className="space-y-1.5">
                      <label htmlFor="newSerialNumber" className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Serial Number (SN) Baru *
                      </label>
                      <Input
                        id="newSerialNumber"
                        type="text"
                        required
                        value={newSerialNumber}
                        onChange={(e) => setNewSerialNumber(e.target.value.toUpperCase())}
                        placeholder="Contoh: SNBARU12345"
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs uppercase"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONDITIONAL SECTION: SELESAI_DAN_DIAMBIL or GAGAL_SERVICE_GARANSI */}
            {(status === "SELESAI_DAN_DIAMBIL" || status === "GAGAL_SERVICE_GARANSI") && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10 space-y-3">
                <div className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  Penyelesaian Servis & Penyerahan Unit
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="finalCost" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      Biaya Akhir (Rp) *
                    </label>
                    <Input
                      id="finalCost"
                      type="number"
                      required
                      min={0}
                      value={finalCost}
                      onChange={(e) => setFinalCost(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="pickupDate" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      Tanggal Diambil Customer *
                    </label>
                    <Input
                      id="pickupDate"
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* General Notes for audit trail / system notes */}
            <div className="space-y-1.5">
              <label htmlFor="notes-general" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Catatan / Progress Update
              </label>
              <textarea
                id="notes-general"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan progres teknisi di sini..."
                className="flex min-h-[50px] w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-200 dark:border-zinc-800"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending} className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold">
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
