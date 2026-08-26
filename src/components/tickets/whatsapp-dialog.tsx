"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageCircle, Copy, Send, HelpCircle } from "lucide-react";
import { formatWhatsAppNumber, getReceiptWhatsAppTemplate, getDoneWhatsAppTemplate } from "@/lib/whatsapp";
import { sendWhatsAppNotificationAction } from "@/actions/whatsapp";

interface Ticket {
  id: string;
  ticketNumber: string;
  entryDate: Date | string;
  serviceType: string;
  customer: {
    name: string;
    phone: string;
  };
  deviceType: string;
  deviceName: string;
  serialNumber: string;
  complaint: string;
  accessories: string[];
  estimatedCompletionDate?: Date | string | null;
  technician: {
    fullName: string;
  };
  status: string;
}

interface WhatsAppDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
}

export default function WhatsAppDialog({ isOpen, onOpenChange, ticket }: WhatsAppDialogProps) {
  const [activeTab, setActiveTab] = useState<"RECEIPT" | "DONE">("RECEIPT");
  const [isPending, startTransition] = useTransition();

  // Create temporary ticket object matching TicketDetailsForWhatsApp interface
  const formattedTicket = {
    ticketNumber: ticket.ticketNumber,
    entryDate: ticket.entryDate,
    serviceType: ticket.serviceType,
    customer: {
      name: ticket.customer.name,
      phone: ticket.customer.phone,
    },
    deviceType: ticket.deviceType,
    deviceName: ticket.deviceName,
    serialNumber: ticket.serialNumber,
    complaint: ticket.complaint,
    accessories: ticket.accessories,
    estimatedCompletionDate: ticket.estimatedCompletionDate,
    technician: {
      fullName: ticket.technician.fullName,
    },
  };

  const receiptMessage = getReceiptWhatsAppTemplate(formattedTicket);
  const doneMessage = getDoneWhatsAppTemplate(formattedTicket);
  const currentMessage = activeTab === "RECEIPT" ? receiptMessage : doneMessage;

  const handleAction = (method: "direct" | "gateway" | "copy") => {
    const formattedPhone = formatWhatsAppNumber(ticket.customer.phone);

    if (method === "copy") {
      navigator.clipboard.writeText(currentMessage);
      toast.success("Teks notifikasi WhatsApp berhasil disalin!");
    } else if (method === "direct") {
      const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(currentMessage)}`;
      window.open(url, "_blank");
    } else if (method === "gateway") {
      startTransition(async () => {
        const res = await sendWhatsAppNotificationAction(formattedPhone, currentMessage);
        if (res.success) {
          toast.success("Notifikasi WhatsApp berhasil dikirim melalui Gateway!");
        } else {
          toast.error(res.error || "Gagal mengirim notifikasi WhatsApp.");
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-950 p-6 border dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 font-bold">
            <MessageCircle className="h-5 w-5 text-emerald-500" />
            Kirim WhatsApp Notifikasi
          </DialogTitle>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            RMA: {ticket.ticketNumber} | Pelanggan: {ticket.customer.name}
          </div>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg my-2">
          <button
            onClick={() => setActiveTab("RECEIPT")}
            className={`py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === "RECEIPT"
                ? "bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Tanda Terima Masuk
          </button>
          <button
            onClick={() => setActiveTab("DONE")}
            className={`py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === "DONE"
                ? "bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Selesai Diperbaiki
          </button>
        </div>

        {/* Preview Container */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Pratinjau Pesan
          </label>
          <div className="bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-700 dark:text-zinc-300 max-h-60 overflow-y-auto whitespace-pre-wrap">
            {currentMessage}
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button
              onClick={() => handleAction("direct")}
              variant="outline"
              className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold flex items-center justify-center gap-1.5 text-xs py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
              wa.me
            </Button>
            <Button
              onClick={() => handleAction("gateway")}
              variant="outline"
              disabled={isPending}
              className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold flex items-center justify-center gap-1.5 text-xs py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Send className="h-3.5 w-3.5 text-blue-500" />
              Gateway
            </Button>
            <Button
              onClick={() => handleAction("copy")}
              variant="outline"
              className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold flex items-center justify-center gap-1.5 text-xs py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Copy className="h-3.5 w-3.5 text-indigo-500" />
              Salin
            </Button>
          </div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 justify-center mt-1">
            <HelpCircle className="h-3 w-3" />
            Format nomor otomatis dikonversi ke internasional (628...).
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
