/**
 * WhatsApp Message Formatter
 *
 * Utility untuk memformat pesan WhatsApp untuk berbagai keperluan:
 * - Notifikasi status service ke customer
 * - Laporan harian ke operational
 * - Laporan ke sales
 *
 * @see Issue #09, #10, #11
 */

/**
 * Format nomor telepon ke format WhatsApp (62xxx)
 * Menghapus karakter non-digit dan mengkonversi awalan 0 ke 62
 */
export function formatPhoneForWA(phone: string): string {
  // Hapus semua karakter non-digit
  let cleaned = phone.replace(/\D/g, "");

  // Konversi awalan 0 ke 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }

  // Pastikan awalan 62
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/**
 * Generate WhatsApp API URL (wa.me link)
 */
export function generateWALink(phone: string, message?: string): string {
  const formattedPhone = formatPhoneForWA(phone);
  const baseUrl = `https://wa.me/${formattedPhone}`;

  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }

  return baseUrl;
}

/**
 * Escape karakter khusus untuk format WhatsApp
 */
export function escapeWAMarkdown(text: string): string {
  return text.replace(/([_*~`])/g, "\\$1");
}
