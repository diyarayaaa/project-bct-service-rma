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
