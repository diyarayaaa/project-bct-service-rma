"use client";

import { useState, useTransition } from "react";
import { createDeliveryNoteAction } from "@/actions/delivery-note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FileText,
  Truck,
  History,
  Building,
  Calendar,
  CheckSquare,
  Square,
  Eye,
  Printer,
  ChevronRight,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
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
  status: string;
  vendorId: string | null;
  vendor: Vendor | null;
  deliveryNoteId: string | null;
}

interface DeliveryNote {
  id: string;
  suratJalanNumber: string;
  vendorId: string;
  vendor: Vendor;
  shippingDate: string;
  courierName: string | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  tickets: {
    id: string;
    ticketNumber: string;
    deviceName: string;
    status: string;
    customer: Customer;
  }[];
}

interface ShipmentsClientProps {
  initialVendors: Vendor[];
  initialPendingTickets: Ticket[];
  initialDeliveryNotes: DeliveryNote[];
  nextSuratJalanNumber: string;
}

export default function ShipmentsClient({
  initialVendors,
  initialPendingTickets,
  initialDeliveryNotes,
  nextSuratJalanNumber,
}: ShipmentsClientProps) {
  const [activeTab, setActiveTab] = useState<"CREATE" | "HISTORY">("CREATE");
  const [vendors] = useState<Vendor[]>(initialVendors);
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>(initialPendingTickets);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>(initialDeliveryNotes);
  const [currentSuratJalanNum, setCurrentSuratJalanNum] = useState(nextSuratJalanNumber);

  // Batching filter & selection states
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Dialog details states
  const [activeNote, setActiveNote] = useState<DeliveryNote | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form states
  const [shippingDate, setShippingDate] = useState(new Date().toISOString().slice(0, 10));
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Filter pending tickets based on selected vendor
  const vendorPendingTickets = pendingTickets.filter((t) => t.vendorId === selectedVendorId);

  const toggleSelectTicket = (id: string) => {
    if (selectedTicketIds.includes(id)) {
      setSelectedTicketIds(selectedTicketIds.filter((tid) => tid !== id));
    } else {
      setSelectedTicketIds([...selectedTicketIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTicketIds.length === vendorPendingTickets.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(vendorPendingTickets.map((t) => t.id));
    }
  };

  const handleSubmitSJ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicketIds.length === 0) {
      toast.error("Pilih minimal 1 barang untuk dikirim.");
      return;
    }

    startTransition(async () => {
      const res = await createDeliveryNoteAction(null, {
        suratJalanNumber: currentSuratJalanNum,
        vendorId: selectedVendorId,
        shippingDate,
        courierName,
        trackingNumber,
        notes,
        selectedTicketIds,
      });

      if (res.success && res.data) {
        toast.success("Surat Jalan baru berhasil dibuat!");
        
        // Remove from pending list
        setPendingTickets(pendingTickets.filter((t) => !selectedTicketIds.includes(t.id)));
        
        // Add to history list
        const newNote = res.data as DeliveryNote;
        setDeliveryNotes([newNote, ...deliveryNotes]);

        // Reset inputs
        setSelectedTicketIds([]);
        setSelectedVendorId("");
        setCourierName("");
        setTrackingNumber("");
        setNotes("");

        // Auto increment Surat Jalan number locally
        const numPart = currentSuratJalanNum.replace("SJ-BCTRS-", "");
        const prefix = currentSuratJalanNum.slice(0, 11); // "SJ-BCTRS-26"
        const seq = parseInt(numPart.slice(2), 10);
        if (!isNaN(seq)) {
          setCurrentSuratJalanNum(`${prefix}${String(seq + 1).padStart(4, "0")}`);
        }

        // Switch to history tab
        setActiveTab("HISTORY");
      } else {
        toast.error(res.error || "Gagal membuat Surat Jalan");
      }
    });
  };

  const handleOpenDetail = (note: DeliveryNote) => {
    setActiveNote(note);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pengiriman Vendor & Surat Jalan
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Kelompokkan pengiriman unit ke vendor luar (Batching) dan kelola histori Surat Jalan.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("CREATE")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === "CREATE"
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50 font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          }`}
        >
          <Truck className="h-4 w-4" />
          Buat Surat Jalan (Batching)
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === "HISTORY"
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50 font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          }`}
        >
          <History className="h-4 w-4" />
          Histori Surat Jalan
        </button>
      </div>

      {/* TAB 1: CREATE (BATCHING) */}
      {activeTab === "CREATE" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Column 1 & 2: Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Vendor Selector */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm space-y-3">
              <label htmlFor="vendorSelect" className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Building className="h-4 w-4 text-zinc-500" />
                Pilih Vendor Tujuan
              </label>
              <select
                id="vendorSelect"
                value={selectedVendorId}
                onChange={(e) => {
                  setSelectedVendorId(e.target.value);
                  setSelectedTicketIds([]);
                }}
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">-- Pilih Vendor --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.aliasCode ? `(${v.aliasCode})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* List unit pending */}
            {selectedVendorId && (
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">
                    Daftar Unit Siap Kirim ({vendorPendingTickets.length})
                  </span>
                  {vendorPendingTickets.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {selectedTicketIds.length === vendorPendingTickets.length ? (
                        <>Unselect All</>
                      ) : (
                        <>Select All</>
                      )}
                    </button>
                  )}
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {vendorPendingTickets.length === 0 ? (
                    <div className="p-10 text-center text-zinc-400 text-sm">
                      Tidak ada unit berstatus ALIH SERVICE / PROSES GARANSI yang siap dikirim untuk vendor ini.
                    </div>
                  ) : (
                    vendorPendingTickets.map((ticket) => {
                      const isSelected = selectedTicketIds.includes(ticket.id);
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => toggleSelectTicket(ticket.id)}
                          className="flex items-center gap-4 p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 cursor-pointer transition-colors"
                        >
                          <button type="button" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                            {isSelected ? (
                              <CheckSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                {ticket.ticketNumber}
                              </span>
                              <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                {ticket.status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                              {ticket.deviceName} (SN: {ticket.serialNumber})
                            </div>
                            <div className="text-xs text-zinc-400">
                              Customer: {ticket.customer.name} | Keluhan: {ticket.complaint}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Form Detail */}
          <div className="space-y-4">
            {selectedTicketIds.length > 0 ? (
              <form
                onSubmit={handleSubmitSJ}
                className="p-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm space-y-4 sticky top-6"
              >
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  Detail Surat Jalan
                </h3>

                <div className="text-xs font-medium text-zinc-500">
                  Terpilih: <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedTicketIds.length} unit</span> barang.
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sjNum" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    No Surat Jalan *
                  </label>
                  <Input
                    id="sjNum"
                    type="text"
                    required
                    value={currentSuratJalanNum}
                    onChange={(e) => setCurrentSuratJalanNum(e.target.value.toUpperCase())}
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="shipDate" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Tanggal Kirim *
                  </label>
                  <Input
                    id="shipDate"
                    type="date"
                    required
                    value={shippingDate}
                    onChange={(e) => setShippingDate(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="courier" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      Ekspedisi / Kurir
                    </label>
                    <Input
                      id="courier"
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="JNE / TIKI / Kurir"
                      className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="tracking" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      No Resi
                    </label>
                    <Input
                      id="tracking"
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Resi pengiriman"
                      className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sjNotes" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Catatan
                  </label>
                  <textarea
                    id="sjNotes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan surat jalan..."
                    className="flex min-h-[40px] w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold"
                >
                  {isPending ? "Menyimpan..." : "Buat & Kirim Surat Jalan"}
                </Button>
              </form>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 text-xs flex flex-col items-center justify-center py-20 gap-2">
                <Truck className="h-8 w-8 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                Pilih minimal 1 unit barang di sebelah kiri untuk membuat Surat Jalan baru.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === "HISTORY" && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4">No Surat Jalan</th>
                  <th scope="col" className="px-6 py-4">Vendor</th>
                  <th scope="col" className="px-6 py-4">Tanggal Kirim</th>
                  <th scope="col" className="px-6 py-4">Kurir & Resi</th>
                  <th scope="col" className="px-6 py-4">Qty</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {deliveryNotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-zinc-400">
                      Belum ada histori Surat Jalan yang dibuat.
                    </td>
                  </tr>
                ) : (
                  deliveryNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-zinc-900 dark:text-zinc-50">
                        {note.suratJalanNumber}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-200">
                        {note.vendor.name}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          {new Date(note.shippingDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {note.courierName ? (
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                            <Truck className="h-3 w-3 text-zinc-400" />
                            {note.courierName}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">No Courier</span>
                        )}
                        {note.trackingNumber && (
                          <div className="text-zinc-400 font-mono mt-0.5">{note.trackingNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">
                        {note.tickets.length} Unit
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetail(note)}
                            className="h-8 text-xs font-semibold flex items-center gap-1 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Detail
                          </Button>
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 border border-zinc-200 dark:border-zinc-800"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block bg-zinc-900 text-white rounded-lg shadow-lg py-1 text-[10px] w-28 z-50">
                              <button
                                onClick={() => window.open(`/print/surat-jalan/${note.suratJalanNumber}`, "_blank")}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 font-semibold"
                              >
                                Surat Jalan A4
                              </button>
                              <button
                                onClick={() => window.open(`/print/label/${note.suratJalanNumber}`, "_blank")}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 font-semibold"
                              >
                                Label Alamat A6
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
      )}

      {/* Detail Dialog Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          {activeNote && (
            <>
              <DialogHeader>
                <DialogTitle className="text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-zinc-500" />
                  Detail Surat Jalan - {activeNote.suratJalanNumber}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4 text-sm">
                {/* SJ Info Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Vendor Penerima</div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mt-0.5">{activeNote.vendor.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Tanggal Pengiriman</div>
                    <div className="font-medium text-zinc-700 dark:text-zinc-300 text-xs mt-0.5">
                      {new Date(activeNote.shippingDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Kurir / Ekspedisi</div>
                    <div className="font-medium text-zinc-700 dark:text-zinc-300 text-xs mt-0.5">{activeNote.courierName || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Nomor Resi</div>
                    <div className="font-mono text-zinc-700 dark:text-zinc-300 text-xs mt-0.5">{activeNote.trackingNumber || "-"}</div>
                  </div>
                  {activeNote.notes && (
                    <div className="col-span-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-2 mt-1">
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Catatan</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 italic">&quot;{activeNote.notes}&quot;</div>
                    </div>
                  )}
                </div>

                {/* Items list inside SJ */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
                    Daftar Barang Dikirim ({activeNote.tickets.length} Unit)
                  </h4>
                  <div className="max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800">
                    {activeNote.tickets.map((ticket) => (
                      <div key={ticket.id} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                        <div>
                          <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                            <ChevronRight className="h-3 w-3 text-zinc-400" />
                            {ticket.ticketNumber}
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5 pl-4">
                            {ticket.deviceName} | Customer: {ticket.customer.name}
                          </div>
                        </div>
                        <span className="inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {ticket.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="sm:justify-between gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`/print/surat-jalan/${activeNote.suratJalanNumber}`, "_blank");
                    }}
                    className="border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Cetak Surat Jalan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`/print/label/${activeNote.suratJalanNumber}`, "_blank");
                    }}
                    className="border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5 text-indigo-500" />
                    Cetak Label Alamat
                  </Button>
                </div>
                <Button
                  onClick={() => setIsDetailOpen(false)}
                  className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
