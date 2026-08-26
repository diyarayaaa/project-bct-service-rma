"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ClipboardList, User, Calendar, Edit, Tag, Printer, MessageCircle, History, Filter } from "lucide-react";
import StatusDialog from "@/components/tickets/status-dialog";
import WhatsAppDialog from "@/components/tickets/whatsapp-dialog";
import AuditLogDialog from "@/components/tickets/audit-log-dialog";
import EditTicketDialog from "@/components/tickets/edit-ticket-dialog";
import { useRouter } from "next/navigation";

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
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWADialogOpen, setIsWADialogOpen] = useState(false);
  const [selectedWATicket, setSelectedWATicket] = useState<Ticket | null>(null);
  const [selectedAuditTicket, setSelectedAuditTicket] = useState<{ id: string; ticketNumber: string } | null>(null);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const router = useRouter();

  const handleOpenWADialog = (ticket: Ticket) => {
    setSelectedWATicket(ticket);
    setIsWADialogOpen(true);
  };

  // Filter tickets based on search query and status filter
  const filteredTickets = tickets.filter((t) => {
    // 1. Status Filter
    if (statusFilter !== "ALL") {
      if (statusFilter === "ACTIVE_VENDOR") {
        if (t.status !== "ALIH_SERVICE" && t.status !== "PROSES_GARANSI") return false;
      } else if (statusFilter === "COMPLETED") {
        if (t.status !== "SELESAI_BELUM_DIAMBIL" && t.status !== "SELESAI_DAN_DIAMBIL") return false;
      } else if (t.status !== statusFilter) {
        return false;
      }
    }

    // 2. Search Query
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.ticketNumber.toLowerCase().includes(q) ||
      t.customer.name.toLowerCase().includes(q) ||
      t.deviceName.toLowerCase().includes(q) ||
      t.serialNumber.toLowerCase().includes(q)
    );
  });

  const getBadgeElement = (status: string) => {
    switch (status) {
      case "PROSES_SERVICE":
        return <span className="badge-proses">PROSES SERVICE</span>;
      case "PENDING_SERVICE":
        return <span className="badge-pending">PENDING SERVICE</span>;
      case "ALIH_SERVICE":
        return <span className="badge-vendor">ALIH SERVICE</span>;
      case "PROSES_GARANSI":
        return <span className="badge-vendor">PROSES GARANSI</span>;
      case "SELESAI_BELUM_DIAMBIL":
        return <span className="badge-selesai-unclaimed">SELESAI (BELUM DIAMBIL)</span>;
      case "SELESAI_DAN_DIAMBIL":
        return <span className="badge-selesai-claimed">SELESAI & DIAMBIL</span>;
      case "GAGAL_SERVICE_GARANSI":
        return <span className="badge-gagal">GAGAL / BATAL</span>;
      default:
        return <span className="badge-selesai-claimed">{status.replace(/_/g, " ")}</span>;
    }
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
      {/* Header */}
      <div className="flex flex-col gap-1 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Daftar Tiket Servis & RMA
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Monitoring antrian servis internal, alih distributor vendor, dan status penyerahan unit.
        </p>
      </div>

      {/* Filter Bar & Quick Status Pills */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Cari No Tiket, Nama Pelanggan, Model Perangkat, atau SN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl"
          />
        </div>

        {/* Quick Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-zinc-400 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          {[
            { id: "ALL", label: "Semua" },
            { id: "PROSES_SERVICE", label: "Proses" },
            { id: "PENDING_SERVICE", label: "Pending" },
            { id: "ACTIVE_VENDOR", label: "Alih Vendor" },
            { id: "COMPLETED", label: "Selesai" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === pill.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-zinc-600 dark:text-zinc-300">
            <thead className="bg-zinc-50/80 text-zinc-500 dark:bg-zinc-900/80 dark:text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th scope="col" className="px-6 py-3.5">No Tiket / Tanggal</th>
                <th scope="col" className="px-6 py-3.5">Pelanggan</th>
                <th scope="col" className="px-6 py-3.5">Perangkat & Keluhan</th>
                <th scope="col" className="px-6 py-3.5">Status Layanan</th>
                <th scope="col" className="px-6 py-3.5">Teknisi</th>
                <th scope="col" className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 font-medium">
                    Tidak ada tiket servis yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        {ticket.ticketNumber}
                      </div>
                      <div className="text-zinc-400 text-[10px] mt-1 flex items-center gap-1 font-medium">
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
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {ticket.customer.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{ticket.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        {ticket.deviceName}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5">SN: {ticket.serialNumber}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-1 line-clamp-1 italic">
                        &quot;{ticket.complaint}&quot;
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getBadgeElement(ticket.status)}
                      {ticket.vendor && (
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1.5 flex items-center gap-1">
                          📍 Vendor: {ticket.vendor.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      <div className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200">
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                        {ticket.technician.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setTicketToEdit(ticket)}
                          className="h-8 w-8 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/80 dark:border-zinc-800 rounded-xl"
                          title="Edit Data Tiket"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStatusDialog(ticket)}
                          className="border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-white dark:bg-zinc-900 rounded-xl h-8 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50"
                        >
                          Update Status
                        </Button>
                        <div className="relative group">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl"
                            title="Cetak Struk / Faktur"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block bg-zinc-900 text-white rounded-xl shadow-lg py-1.5 text-[10px] w-28 z-50">
                            <button
                              onClick={() => window.open(`/print/receipt/${ticket.ticketNumber}?format=thermal`, "_blank")}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 font-bold"
                            >
                              Struk Thermal
                            </button>
                            <button
                              onClick={() => window.open(`/print/receipt/${ticket.ticketNumber}?format=a4`, "_blank")}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 font-bold"
                            >
                              Faktur A4
                            </button>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenWADialog(ticket)}
                          className="h-8 w-8 text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 border border-zinc-200/80 dark:border-zinc-800 rounded-xl"
                          title="Pratinjau Notifikasi WA"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedAuditTicket({ id: ticket.id, ticketNumber: ticket.ticketNumber })}
                          className="h-8 w-8 text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 border border-zinc-200/80 dark:border-zinc-800 rounded-xl"
                          title="Lihat Riwayat & Audit Log"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Dialog */}
      {selectedTicket && (
        <StatusDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          ticket={selectedTicket}
          vendors={vendors}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}

      {/* WhatsApp Dialog */}
      {selectedWATicket && (
        <WhatsAppDialog
          key={selectedWATicket.id}
          isOpen={isWADialogOpen}
          onOpenChange={setIsWADialogOpen}
          ticket={selectedWATicket}
        />
      )}

      {/* Audit Log Dialog */}
      {selectedAuditTicket && (
        <AuditLogDialog
          isOpen={!!selectedAuditTicket}
          onOpenChange={(open) => !open && setSelectedAuditTicket(null)}
          ticketId={selectedAuditTicket.id}
          ticketNumber={selectedAuditTicket.ticketNumber}
        />
      )}

      {/* Edit Ticket Dialog */}
      {ticketToEdit && (
        <EditTicketDialog
          key={ticketToEdit.id}
          isOpen={!!ticketToEdit}
          onOpenChange={(open) => !open && setTicketToEdit(null)}
          ticket={ticketToEdit}
          onSuccess={() => {
            setTicketToEdit(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
