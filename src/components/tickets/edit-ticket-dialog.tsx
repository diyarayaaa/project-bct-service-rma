"use client";

import { useState, useTransition } from "react";
import { updateTicketDetailsAction } from "@/actions/ticket";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit, Loader2, User, Smartphone } from "lucide-react";

interface TicketToEdit {
  id: string;
  ticketNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  deviceName: string;
  serialNumber: string;
  complaint: string;
  accessories?: string[];
  notes?: string | null;
  estimatedCost?: string | number | null;
  dpAmount?: string | number | null;
}

interface EditTicketDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: TicketToEdit;
  onSuccess?: () => void;
}

export default function EditTicketDialog({
  isOpen,
  onOpenChange,
  ticket,
  onSuccess,
}: EditTicketDialogProps) {
  const [customerName, setCustomerName] = useState(ticket.customer.name);
  const [customerPhone, setCustomerPhone] = useState(ticket.customer.phone);
  const [deviceName, setDeviceName] = useState(ticket.deviceName);
  const [serialNumber, setSerialNumber] = useState(ticket.serialNumber);
  const [complaint, setComplaint] = useState(ticket.complaint);
  const [notes, setNotes] = useState(ticket.notes || "");
  const [estimatedCost, setEstimatedCost] = useState(String(ticket.estimatedCost || "0"));
  const [dpAmount, setDpAmount] = useState(String(ticket.dpAmount || "0"));
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !deviceName.trim() || !serialNumber.trim() || !complaint.trim()) {
      toast.error("Semua field bertanda bintang (*) wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await updateTicketDetailsAction(ticket.id, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deviceName: deviceName.trim(),
        serialNumber: serialNumber.trim(),
        complaint: complaint.trim(),
        notes: notes.trim() || null,
        estimatedCost: Number(estimatedCost) || 0,
        dpAmount: Number(dpAmount) || 0,
      });

      if (res.success) {
        toast.success(`Data tiket "${ticket.ticketNumber}" berhasil diperbarui!`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Gagal mengedit data tiket.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Edit className="h-5 w-5 text-indigo-500" />
            Edit Data Tiket (<span className="font-mono text-indigo-600 dark:text-indigo-400">{ticket.ticketNumber}</span>)
          </DialogTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Ubah data dasar customer, perangkat, serial number, atau keluhan.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Section 1: Customer Info */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-955 border dark:border-zinc-800">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
              <User className="h-4 w-4 text-indigo-500" /> Informasi Customer
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Nama Customer *</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: ANDI"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">No. Telepon / WA *</label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="08123456789"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Device Info */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-955 border dark:border-zinc-800">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
              <Smartphone className="h-4 w-4 text-indigo-500" /> Detail Perangkat & Serial Number
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Nama / Model Perangkat *</label>
                <Input
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Contoh: LENOVO IP S145"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Serial Number (SN) *</label>
                <Input
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Contoh: SN12345678"
                  className="h-9 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Keluhan Perangkat *</label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Deskripsi keluhan..."
                className="flex min-h-[60px] w-full rounded-md border border-zinc-200 bg-white dark:bg-zinc-900 px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:text-zinc-50 resize-none"
              />
            </div>

            <div>
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Catatan Tambahan / Alasan Pending</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan fisik, password laptop, dll..."
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Section 3: Costs */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Estimasi Biaya (Rp)</label>
              <Input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Uang Muka / DP (Rp)</label>
              <Input
                type="number"
                value={dpAmount}
                onChange={(e) => setDpAmount(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 text-xs flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
