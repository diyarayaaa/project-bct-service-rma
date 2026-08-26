export interface TicketDetailsForWhatsApp {
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
  technician?: {
    fullName: string;
  } | null;
}

/**
 * Format phone number from domestic (e.g. 0813...) to international (e.g. 62813...)
 */
export function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return `62${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("62")) {
    return cleaned;
  }
  return `62${cleaned}`;
}

/**
 * Generate Template 1: Tanda Terima Masuk
 */
export function getReceiptWhatsAppTemplate(ticket: TicketDetailsForWhatsApp): string {
  const formattedDate = new Date(ticket.entryDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedEst = ticket.estimatedCompletionDate
    ? new Date(ticket.estimatedCompletionDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return `Hallo TN/NY. ${ticket.customer.name}
Kami telah menerima perangkat Anda untuk proses ${ticket.serviceType} dengan rincian berikut:
━━━━━━━━━━━━━━━
No RMA : ${ticket.ticketNumber}
Tanggal Masuk : ${formattedDate}
Jenis Barang : ${ticket.deviceType}
Nama Barang : ${ticket.deviceName}
Serial Number : ${ticket.serialNumber}
Keluhan : ${ticket.complaint}
Kelengkapan : ${ticket.accessories.join(", ") || "-"}
Estimasi Selesai : ${formattedEst}
━━━━━━━━━━━━━━━
Mohon simpan pesan ini sebagai bukti serah terima perangkat.
Catatan:
• Pengambilan perangkat wajib menunjukkan No RMA.
• Perangkat yang tidak diambil lebih dari 30 hari setelah konfirmasi selesai bukan menjadi tanggung jawab kami atas segala risiko yang terjadi.
• Mohon melakukan pengecekan perangkat saat pengambilan.

Terima kasih
-${ticket.technician?.fullName || "Best Computel"} Best Computel Service`;
}

/**
 * Generate Template 2: Notifikasi Selesai Diperbaiki
 */
export function getDoneWhatsAppTemplate(ticket: TicketDetailsForWhatsApp): string {
  return `Hallo TN/NY. ${ticket.customer.name}
Saya ${ticket.technician?.fullName || "Best Computel"} dari Best Computel Service, Ingin menginformasikan bahwa perangkat:
━━━━━━━━━━━━━━━
Nama Perangkat : ${ticket.deviceName}
Keluhan : ${ticket.complaint}
━━━━━━━━━━━━━━━
Telah *SELESAI* diperbaiki dan sudah dapat diambil.
Silakan datang sesuai jam operasional toko:
• Senin - Jumat : 09.00 - 17.00
• Sabtu : 09.00 - 15.00
• Minggu dan Tanggal Merah : Libur

Terima kasih.`;
}
