"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ClipboardList, User, Calendar, Edit, Tag, Printer, FileText } from "lucide-react";
import StatusDialog from "@/components/tickets/status-dialog";

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

interface TicketsClientProps {
  initialTickets: Ticket[];
  vendors: Vendor[];
}

export default function TicketsClient({ initialTickets, vendors }: TicketsClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter tickets based on search query
  const filteredTickets = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.ticketNumber.toLowerCase().includes(q) ||
      t.customer.name.toLowerCase().includes(q) ||
      t.deviceName.toLowerCase().includes(q) ||
      t.serialNumber.toLowerCase().includes(q)
    );
  });

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "PROSES_SERVICE":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900";
      case "PENDING_SERVICE":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900";
      case "ALIH_SERVICE":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900";
      case "PROSES_GARANSI":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200 dark:border-purple-900";
      case "SELESAI_BELUM_DIAMBIL":
        return "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900";
      case "SELESAI_DAN_DIAMBIL":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900";
      case "GAGAL_SERVICE_GARANSI":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700";
    }
  };

  const formatStatusText = (status: string) => {
    return status.replace(/_/g, " ");
  };

  const handleOpenStatusDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
  };

  const handleStatusUpdateSuccess = (updatedTicket: Ticket) => {
    setTickets(tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Daftar Tiket Servis & RMA
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Monitoring antrian servis, pengalihan vendor, dan status unit.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          type="text"
          placeholder="Cari No Tiket, nama pelanggan, barang, atau SN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        />
      </div>

      {/* Tickets Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th scope="col" className="px-6 py-4">No Tiket / Tanggal</th>
                <th scope="col" className="px-6 py-4">Pelanggan</th>
                <th scope="col" className="px-6 py-4">Perangkat & Keluhan</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Teknisi</th>
                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-400">
                    Tidak ada tiket servis yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                        <ClipboardList className="h-4 w-4 text-zinc-400" />
                        {ticket.ticketNumber}
                      </div>
                      <div className="text-zinc-400 text-[10px] mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(ticket.entryDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-200">
                        {ticket.customer.name}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">{ticket.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        <Tag className="h-3 w-3 text-zinc-400" />
                        {ticket.deviceName}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">SN: {ticket.serialNumber}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1 line-clamp-1 italic max-w-xs">
                        &quot;{ticket.complaint}&quot;
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeStyles(ticket.status)}`}>
                        {formatStatusText(ticket.status)}
                      </span>
                      {ticket.vendor && (
                        <div className="text-[10px] text-indigo-500 font-bold mt-1">
                          📍 Vendor: {ticket.vendor.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      <div className="flex items-center gap-1 text-zinc-900 dark:text-zinc-200">
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                        {ticket.technician.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStatusDialog(ticket)}
                          className="border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5 bg-white dark:bg-zinc-900"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Update Status
                        </Button>
                        <div className="relative group">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 border border-zinc-200 dark:border-zinc-800"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block bg-zinc-900 text-white rounded-lg shadow-lg py-1 text-[10px] w-24 z-50">
                            <button
                              onClick={() => window.open(`/print/receipt/${ticket.ticketNumber}?format=thermal`, "_blank")}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 font-semibold"
                            >
                              Struk Thermal
                            </button>
                            <button
                              onClick={() => window.open(`/print/receipt/${ticket.ticketNumber}?format=a4`, "_blank")}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 font-semibold"
                            >
                              Faktur A4
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <StatusDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          ticket={selectedTicket}
          vendors={vendors}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}
    </div>
  );
}
