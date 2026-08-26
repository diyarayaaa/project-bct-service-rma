import { z } from "zod";

// Phone validation: Indonesian WhatsApp / Mobile Number format
// Must start with 08, 628, or +628
export const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

export const ticketSchema = z.object({
  ticketNumber: z.string().min(1, "Nomor tiket wajib diisi"),
  entryDate: z.coerce.date().default(() => new Date()),
  serviceType: z.enum(["SERVICE", "GARANSI"]),
  
  // Customer details
  customerName: z.string().min(1, "Nama pelanggan wajib diisi"),
  customerPhone: z.string().refine((val) => phoneRegex.test(val), {
    message: "Format nomor HP Indonesia tidak valid (Contoh: 08123456789 atau 628123456789)",
  }),

  // Device details
  deviceType: z.enum(["LAPTOP", "PC", "PRINTER", "PROJECTOR", "AKSESORIS", "SPAREPART", "OTHER"]),
  deviceName: z.string().min(1, "Nama perangkat wajib diisi"),
  serialNumber: z.string().min(1, "Serial Number wajib diisi (Gunakan '-' jika tidak ada)"),
  complaint: z.string().min(1, "Keluhan wajib diisi"),
  accessories: z.array(z.string()).default([]),
  estimatedCompletionDate: z.coerce.date().nullable().optional(),

  // Technician & Assignment
  technicianId: z.string().min(1, "Teknisi penanggung jawab wajib diisi"),
  notes: z.string().optional().nullable(),

  // Financials
  estimatedCost: z.coerce.number().min(0, "Estimasi biaya tidak boleh kurang dari 0"),
  dpAmount: z.coerce.number().min(0, "DP tidak boleh kurang dari 0"),
});

export type TicketSchemaInput = z.infer<typeof ticketSchema>;

// Update Status Schema with Conditional refinements
export const updateStatusSchema = z.object({
  status: z.enum([
    "PROSES_SERVICE",
    "PENDING_SERVICE",
    "ALIH_SERVICE",
    "PROSES_GARANSI",
    "SELESAI_BELUM_DIAMBIL",
    "SELESAI_DAN_DIAMBIL",
    "GAGAL_SERVICE_GARANSI",
  ]),
  notes: z.string().optional().nullable(),
  
  // Conditionally required when ALIH_SERVICE or PROSES_GARANSI
  vendorId: z.string().optional().nullable(),
  vendorSentDate: z.coerce.date().nullable().optional(),
  vendorReceivedDate: z.coerce.date().nullable().optional(),
  vendorResult: z.enum(["DISERVICE", "DIGANTI_BARU"]).nullable().optional(),
  newSerialNumber: z.string().optional().nullable(),

  // Conditionally required when SELESAI_DAN_DIAMBIL or GAGAL_SERVICE_GARANSI
  finalCost: z.coerce.number().min(0, "Biaya akhir tidak boleh kurang dari 0").optional().nullable(),
  pickupDate: z.coerce.date().nullable().optional(),
}).refine((data) => {
  // If ALIH_SERVICE or PROSES_GARANSI, vendorId is required
  if (data.status === "ALIH_SERVICE" || data.status === "PROSES_GARANSI") {
    return !!data.vendorId;
  }
  return true;
}, {
  message: "Vendor wajib dipilih untuk status Alih Service / Proses Garansi",
  path: ["vendorId"],
}).refine((data) => {
  // If PROSES_GARANSI and vendorResult is DIGANTI_BARU, newSerialNumber is required
  if (data.status === "PROSES_GARANSI" && data.vendorResult === "DIGANTI_BARU") {
    return !!data.newSerialNumber && data.newSerialNumber.trim() !== "";
  }
  return true;
}, {
  message: "Serial Number (SN) baru wajib diisi jika hasil garansi diganti baru",
  path: ["newSerialNumber"],
}).refine((data) => {
  // If SELESAI_DAN_DIAMBIL or GAGAL_SERVICE_GARANSI, pickupDate is required
  if (data.status === "SELESAI_DAN_DIAMBIL" || data.status === "GAGAL_SERVICE_GARANSI") {
    return !!data.pickupDate;
  }
  return true;
}, {
  message: "Tanggal diambil customer wajib diisi",
  path: ["pickupDate"],
});

export type UpdateStatusSchemaInput = z.infer<typeof updateStatusSchema>;
