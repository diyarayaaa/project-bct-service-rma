"use client";

import { useState, useEffect, useTransition } from "react";
import { createTicketAction } from "@/actions/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  FileText,
  User,
  Phone,
  Laptop,
  CheckCircle,
  Plus,
  Info,
  DollarSign,
  AlertTriangle,
  Printer,
  Share2,
  Calendar,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Technician {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  isInternalStock: boolean;
}

interface PresetOption {
  id: string;
  category: string;
  label: string;
  deviceType: string | null;
}

interface IntakeClientProps {
  initialTicketNumber: string;
  technicians: Technician[];
  customers: Customer[];
  presets: PresetOption[];
}

export default function IntakeClient({
  initialTicketNumber,
  technicians,
  customers,
  presets,
}: IntakeClientProps) {
  const [isPending, startTransition] = useTransition();
  const [ticketNumber, setTicketNumber] = useState(initialTicketNumber);
  
  // Format local date YYYY-MM-DDTHH:MM
  const getLocalISOString = () => {
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
  };
  
  const [entryDate, setEntryDate] = useState(getLocalISOString());
  const [serviceType, setServiceType] = useState<"SERVICE" | "GARANSI">("SERVICE");
  
  // Customer
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Device
  const [deviceType, setDeviceType] = useState<
    "LAPTOP" | "PC" | "PRINTER" | "PROJECTOR" | "AKSESORIS" | "SPAREPART" | "OTHER"
  >("LAPTOP");
  const [deviceName, setDeviceName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  
  // Accessories Checklist
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [customAccessory, setCustomAccessory] = useState("");
  const [extraAccessories, setExtraAccessories] = useState<string[]>([]);

  // Default accessories logic
  const getDefaultsForType = (type: string) => {
    if (type === "LAPTOP") {
      return ["Unit", "Charger", "Tas", "Unit saja", "RAM", "SSD", "BATERAI"];
    }
    if (type === "PC") {
      return ["Tutup case 1", "Tutup case full", "Dus", "RAM", "SSD", "HDD", "VGA", "PSU"];
    }
    return ["Fulldus", "Unit Saja", "Adaptor", "Kabel"];
  };

  const defaultList = getDefaultsForType(deviceType);
  // Merged with database accessories preset options
  const dbAccessories = presets
    .filter((p) => p.category === "ACCESSORY" && (!p.deviceType || p.deviceType === deviceType))
    .map((p) => p.label);

  const combinedAccessories = Array.from(
    new Set([...defaultList, ...dbAccessories, ...extraAccessories])
  );

  // Complaint
  const [complaint, setComplaint] = useState("");
  const [showComplaintSuggestions, setShowComplaintSuggestions] = useState(false);

  // Financials
  const [estimatedCost, setEstimatedCost] = useState<number | "">("");
  const [dpAmount, setDpAmount] = useState<number | "">("");
  const remainingCost = (Number(estimatedCost) || 0) - (Number(dpAmount) || 0);

  // Date
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState("");
  
  // Technician
  const [technicianId, setTechnicianId] = useState("");

  // Other notes
  const [notes, setNotes] = useState("");

  // Success Dialog Modal
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState("");

  // Prefix Customer Name
  const formatNameOnBlur = () => {
    if (!customerName.trim()) return;
    const upper = customerName.toUpperCase().trim();
    const isInternal = upper.includes("STOCK BCT") || upper.includes("GHITP");
    if (isInternal) {
      setCustomerName(upper);
      return;
    }
    if (upper.startsWith("TN/NY.")) {
      setCustomerName(upper);
      return;
    }
    setCustomerName(`TN/NY. ${upper}`);
  };

  // Suggestions search logic for customer name
  const filteredCustomers = customers.filter(
    (c) =>
      customerName &&
      (c.name.toLowerCase().includes(customerName.toLowerCase()) || c.phone.includes(customerName))
  );

  // Filter complaints suggestions
  const complaintPresets = presets.filter((p) => p.category === "COMPLAINT");
  const filteredComplaints = complaintPresets.filter(
    (p) =>
      complaint &&
      p.label.toLowerCase().includes(complaint.toLowerCase()) &&
      p.label.toLowerCase() !== complaint.toLowerCase()
  );

  // Change default accessories when deviceType changes
  useEffect(() => {
    setSelectedAccessories([]);
    setExtraAccessories([]);
  }, [deviceType]);

  const handleSelectCustomer = (c: Customer) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setShowSuggestions(false);
  };

  const handleAddCustomAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAccessory.trim()) return;
    const clean = customAccessory.trim();
    if (!combinedAccessories.includes(clean)) {
      setExtraAccessories([...extraAccessories, clean]);
    }
    if (!selectedAccessories.includes(clean)) {
      setSelectedAccessories([...selectedAccessories, clean]);
    }
    setCustomAccessory("");
  };

  const toggleAccessory = (label: string) => {
    if (selectedAccessories.includes(label)) {
      setSelectedAccessories(selectedAccessories.filter((a) => a !== label));
    } else {
      setSelectedAccessories([...selectedAccessories, label]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Auto format name before submit just to be safe
    formatNameOnBlur();

    const formData = new FormData();
    formData.append("ticketNumber", ticketNumber);
    formData.append("entryDate", entryDate);
    formData.append("serviceType", serviceType);
    formData.append("customerName", customerName);
    formData.append("customerPhone", customerPhone);
    formData.append("deviceType", deviceType);
    formData.append("deviceName", deviceName);
    formData.append("serialNumber", serialNumber);
    formData.append("complaint", complaint);
    formData.append("technicianId", technicianId);
    formData.append("estimatedCompletionDate", estimatedCompletionDate);
    formData.append("estimatedCost", String(estimatedCost || 0));
    formData.append("dpAmount", String(dpAmount || 0));
    formData.append("notes", notes);

    selectedAccessories.forEach((acc) => {
      formData.append("accessories", acc);
    });

    startTransition(async () => {
      const res = await createTicketAction(null, formData);
      if (res.success && res.data) {
        toast.success("Tiket servis baru berhasil didaftarkan");
        setCreatedTicketNumber(res.data.ticketNumber);
        setIsSuccessOpen(true);
      } else {
        toast.error(res.error || "Gagal menyimpan tiket baru");
      }
    });
  };

  const handleResetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setDeviceName("");
    setSerialNumber("");
    setSelectedAccessories([]);
    setExtraAccessories([]);
    setComplaint("");
    setEstimatedCost("");
    setDpAmount("");
    setEstimatedCompletionDate("");
    setTechnicianId("");
    setNotes("");
    setIsSuccessOpen(false);
    
    // Refresh sequential ticket number
    // We can fetch or trigger updates or just increment locally
    const parts = ticketNumber.split("-");
    if (parts.length === 2) {
      const seq = parseInt(parts[1], 10);
      if (!isNaN(seq)) {
        setTicketNumber(`${parts[0]}-${String(seq + 1).padStart(4, "0")}`);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pendaftaran Unit Baru (Intake Form)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-gray-400">
          Daftarkan unit servis atau klaim garansi baru pelanggan Best Computel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Informasi Layanan */}
        <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <FileText className="h-5 w-5 text-zinc-500" />
            1. Informasi Layanan
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Jenis Layanan
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setServiceType("SERVICE")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg border text-center transition-all ${
                    serviceType === "SERVICE"
                      ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border-transparent shadow-sm"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  SERVICE
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType("GARANSI")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg border text-center transition-all ${
                    serviceType === "GARANSI"
                      ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border-transparent shadow-sm"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  GARANSI
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ticketNumber" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Nomor Layanan (Ticket Number) *
              </label>
              <Input
                id="ticketNumber"
                type="text"
                required
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="entryDate" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Tanggal & Waktu Masuk *
              </label>
              <Input
                id="entryDate"
                type="datetime-local"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Informasi Pelanggan */}
        <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <User className="h-5 w-5 text-zinc-500" />
            2. Informasi Pelanggan
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Customer Name input + autocomplete dropdown */}
            <div className="space-y-1.5 relative">
              <label htmlFor="customerName" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Nama Pelanggan *
              </label>
              <Input
                id="customerName"
                type="text"
                required
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Wait brief moment so click event on suggestion list is captured
                  setTimeout(() => {
                    setShowSuggestions(false);
                    formatNameOnBlur();
                  }, 200);
                }}
                placeholder="Contoh: Budi Santoso atau STOCK BCT"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
              
              {showSuggestions && filteredCustomers.length > 0 && (
                <div className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={() => handleSelectCustomer(c)}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between"
                    >
                      <span className="font-semibold text-zinc-950 dark:text-zinc-50">{c.name}</span>
                      <span className="text-zinc-400 font-mono text-[10px]">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="customerPhone" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                No HP / WhatsApp Pelanggan *
              </label>
              <Input
                id="customerPhone"
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="Contoh: 081318489243"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Spesifikasi Barang & Kelengkapan */}
        <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Laptop className="h-5 w-5 text-zinc-500" />
            3. Spesifikasi Barang & Kelengkapan
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="deviceType" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Jenis Barang *
              </label>
              <select
                id="deviceType"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as any)}
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="LAPTOP">LAPTOP</option>
                <option value="PC">PC</option>
                <option value="PRINTER">PRINTER</option>
                <option value="PROJECTOR">PROJECTOR</option>
                <option value="AKSESORIS">AKSESORIS</option>
                <option value="SPAREPART">SPAREPART</option>
                <option value="OTHER">OTHER (Lainnya)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="deviceName" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Nama / Model Barang *
              </label>
              <Input
                id="deviceName"
                type="text"
                required
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value.toUpperCase())}
                placeholder="Contoh: LENOVO IP S145"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="serialNumber" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Serial Number (SN) *
              </label>
              <div className="flex gap-2">
                <Input
                  id="serialNumber"
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                  placeholder="Masukkan SN Unit"
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSerialNumber("-")}
                  className="border-zinc-200 dark:border-zinc-800"
                >
                  Tidak Ada (-)
                </Button>
              </div>
            </div>
          </div>

          {/* Dynamic Checklist Kelengkapan */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Checklist Kelengkapan Unit
            </label>
            <div className="flex flex-wrap gap-2">
              {combinedAccessories.map((label) => {
                const isSelected = selectedAccessories.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleAccessory(label)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      isSelected
                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 border-transparent shadow-sm"
                        : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Add Custom Accessory inline */}
            <div className="flex items-center gap-2 max-w-sm mt-3 pt-1">
              <Input
                type="text"
                placeholder="Tambah kelengkapan lain..."
                value={customAccessory}
                onChange={(e) => setCustomAccessory(e.target.value)}
                className="h-8 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
              <Button
                type="button"
                onClick={handleAddCustomAccessory}
                className="h-8 px-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 shrink-0"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Searchable Preset Complaint */}
          <div className="space-y-1.5 relative pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label htmlFor="complaint" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Keluhan Perangkat *
            </label>
            <Input
              id="complaint"
              type="text"
              required
              value={complaint}
              onChange={(e) => {
                setComplaint(e.target.value);
                setShowComplaintSuggestions(true);
              }}
              onFocus={() => setShowComplaintSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowComplaintSuggestions(false), 200);
              }}
              placeholder="Masukkan keluhan (Contoh: MATI TOTAL, LCD RETAK)"
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
            {showComplaintSuggestions && filteredComplaints.length > 0 && (
              <div className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                {filteredComplaints.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => {
                      setComplaint(c.label);
                      setShowComplaintSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-800 dark:text-zinc-200 font-medium"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Keuangan, Tanggal Estimasi & Penugasan */}
        <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-zinc-500" />
            4. Keuangan, Estimasi & Penugasan
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-1.5">
              <label htmlFor="estimatedCost" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Estimasi Biaya (Rp)
              </label>
              <Input
                id="estimatedCost"
                type="number"
                min={0}
                value={estimatedCost}
                onChange={(e) =>
                  setEstimatedCost(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="0"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dpAmount" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Down Payment / DP (Rp)
              </label>
              <Input
                id="dpAmount"
                type="number"
                min={0}
                value={dpAmount}
                onChange={(e) =>
                  setDpAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="0"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="remainingCost" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Sisa Biaya (Dihitung)
              </label>
              <Input
                id="remainingCost"
                type="text"
                readOnly
                value={remainingCost.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                })}
                className="bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-bold font-mono text-xs text-zinc-900 dark:text-zinc-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="estimatedCompletionDate" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Estimasi Selesai
              </label>
              <Input
                id="estimatedCompletionDate"
                type="date"
                value={estimatedCompletionDate}
                onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="technicianId" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Teknisi Penanggung Jawab *
              </label>
              <select
                id="technicianId"
                required
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">-- Pilih Teknisi --</option>
                {technicians
                  .filter((t) => t.role === "TECHNICIAN")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.username})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="notes" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Catatan Tambahan (Password Win, Bios, Lecet Fisik, dll.)
              </label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Password Windows: 1234, Fisik mulus lecet tipis pemakaian..."
                className="flex min-h-[40px] w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>
        </div>

        {/* Form Action Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-8 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold"
          >
            {isPending ? "Menyimpan Unit..." : "Daftarkan Unit & Simpan"}
          </Button>
        </div>
      </form>

      {/* Success Modal Popup */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <DialogHeader className="flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle className="h-12 w-12 text-emerald-500 animate-bounce" />
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Registrasi Unit Sukses!
            </DialogTitle>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              Tiket servis untuk nomor layanan <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded">{createdTicketNumber}</span> telah berhasil disimpan di database.
            </p>
          </DialogHeader>

          <div className="space-y-2.5 py-4">
            <Button
              onClick={() => {
                toast.info("Fitur Print Tanda Terima sedang disiapkan untuk Issue #08");
              }}
              className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Cetak Tanda Terima (Thermal / A4)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toast.info("Integrasi Direct WA Client sedang disiapkan untuk Issue #09");
              }}
              className="w-full border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Share2 className="h-4 w-4 text-emerald-500" />
              Kirim WA Serah Terima Pelanggan
            </Button>
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResetForm}
              className="w-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Buat Pendaftaran Baru
            </Button>
            <Button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200"
            >
              Ke Halaman Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
