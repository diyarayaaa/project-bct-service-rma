/**
 * Base Type Definitions
 *
 * Definisi tipe data dasar untuk aplikasi Best Computel Service & RMA.
 * Tipe-tipe ini akan diperluas seiring implementasi fitur.
 */

// ============================================================================
// Vendor Types
// ============================================================================

export interface Vendor {
  id: string;
  name: string;
  aliasCode: string;
  location: string;
  address: string;
  contactPerson: string;
  phone: string;
}

// ============================================================================
// Store Info Types
// ============================================================================

export interface StoreInfo {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  operationalHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  receiptTerms: string[];
}

// ============================================================================
// RMA / Service Ticket Types (Placeholder - Issue #02, #05)
// ============================================================================

export type TicketStatus =
  | "DITERIMA"
  | "DIAGNOSA"
  | "MENUNGGU_KONFIRMASI"
  | "PROSES_SERVIS"
  | "KIRIM_KE_VENDOR"
  | "DI_VENDOR"
  | "KEMBALI_DARI_VENDOR"
  | "SELESAI"
  | "DIAMBIL"
  | "BATAL";

export type ServiceType = "SERVICE" | "RMA";

export type UserRole = "ADMIN" | "TEKNISI" | "KASIR";
