# 📌 Issue #02: Database Schema Design & Prisma / Drizzle Migration

## 🎯 Deskripsi
Membuat struktur database relasional menggunakan PostgreSQL dengan Prisma ORM untuk menggantikan struktur flat sheet di Google Sheets, mendukung relasi 1-to-many pada Surat Jalan, histori audit, dan relasi master data.

---

## 🛠️ Spesifikasi Schema (PostgreSQL via Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ServiceType {
  SERVICE
  GARANSI
}

enum ServiceStatus {
  PROSES_SERVICE
  PENDING_SERVICE
  ALIH_SERVICE
  PROSES_GARANSI
  SELESAI_BELUM_DIAMBIL
  SELESAI_DAN_DIAMBIL
  GAGAL_SERVICE_GARANSI
}

enum DeviceType {
  LAPTOP
  PC
  PRINTER
  PROJECTOR
  AKSESORIS
  SPAREPART
  OTHER
}

enum VendorLocation {
  BDG
  JKT
  OTHER
}

enum VendorResult {
  DISERVICE
  DIGANTI_BARU
}

enum UserRole {
  ADMIN
  TECHNICIAN
  SALES
}

model User {
  id           String          @id @default(uuid())
  username     String          @unique
  fullName     String
  role         UserRole        @default(TECHNICIAN)
  isActive     Boolean         @default(true)
  createdAt    DateTime        @default(now())
  tickets      ServiceTicket[] @relation("TechnicianTickets")
  auditLogs    AuditLog[]
}

model Customer {
  id               String          @id @default(uuid())
  name             String          // Contoh: "TN/NY. WANDI ADITYA PUTRA" atau "STOCK BCT"
  phone            String          // Contoh: "081318489243"
  isInternalStock  Boolean         @default(false) // True jika STOCK BCT atau GHITP
  createdAt        DateTime        @default(now())
  tickets          ServiceTicket[]
}

model Vendor {
  id              String          @id @default(uuid())
  name            String          // Contoh: "PT. ASIA RAYA COM"
  aliasCode       String?         // Penanda nama di report: "ASIA RAYA"
  location        VendorLocation  // BDG atau JKT
  address         String?         // Alamat lengkap untuk print label kirim
  contactPerson   String?
  phone           String?
  isActive        Boolean         @default(true)
  deliveryNotes   DeliveryNote[]
  tickets         ServiceTicket[]
}

model DeliveryNote {
  id                String          @id @default(uuid())
  suratJalanNumber  String          @unique // Contoh: "SJ-BCTRS-260015"
  vendorId          String
  vendor            Vendor          @relation(fields: [vendorId], references: [id])
  shippingDate      DateTime        @default(now())
  courierName       String?         // Contoh: "JNE", "Kurir Toko"
  trackingNumber    String?         // No Resi JNE
  notes             String?
  createdAt         DateTime        @default(now())
  tickets           ServiceTicket[]
}

model ServiceTicket {
  id                      String         @id @default(uuid())
  ticketNumber            String         @unique // Contoh: "BCTRS26-0312"
  entryDate               DateTime       @default(now())
  serviceType             ServiceType
  
  // Relasi Customer
  customerId              String
  customer                Customer       @relation(fields: [customerId], references: [id])
  
  // Detail Barang
  deviceType              DeviceType
  deviceName              String         // Contoh: "LENOVO IP S145"
  serialNumber            String         // SN Unit
  complaint               String         // Keluhan
  accessories             String[]       // Array kelengkapan: ["Unit", "Charger", "Tas"]
  estimatedCompletionDate DateTime?
  
  // Teknisi & Status
  technicianId            String
  technician              User           @relation("TechnicianTickets", fields: [technicianId], references: [id])
  status                  ServiceStatus  @default(PROSES_SERVICE)
  notes                   String?        // Password laptop, catatan fisik, dll.
  
  // Keuangan
  estimatedCost           Decimal        @default(0) @db.Decimal(12, 2)
  dpAmount                Decimal        @default(0) @db.Decimal(12, 2)
  remainingCost           Decimal        @default(0) @db.Decimal(12, 2)
  finalCost               Decimal?       @db.Decimal(12, 2)
  
  // Relasi Vendor / Alih Service / Garansi
  deliveryNoteId          String?
  deliveryNote            DeliveryNote?  @relation(fields: [deliveryNoteId], references: [id])
  vendorId                String?
  vendor                  Vendor?        @relation(fields: [vendorId], references: [id])
  vendorSentDate          DateTime?
  vendorReceivedDate      DateTime?
  vendorResult            VendorResult?
  newSerialNumber         String?        // Diisi jika vendorResult == DIGANTI_BARU
  
  pickupDate              DateTime?      // Tanggal diambil customer
  createdAt               DateTime       @default(now())
  updatedAt               DateTime       @updatedAt
  
  auditLogs               AuditLog[]
}

model PresetOption {
  id         String      @id @default(uuid())
  category   String      // "COMPLAINT", "ACCESSORY"
  label      String      // "Mati Total", "BSOD", dll.
  deviceType DeviceType?
  createdAt  DateTime    @default(now())
}

model AuditLog {
  id            String         @id @default(uuid())
  ticketId      String
  ticket        ServiceTicket  @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  userId        String?
  user          User?          @relation(fields: [userId], references: [id])
  action        String         // "CREATE", "STATUS_CHANGE", "UPDATE_VENDOR", "GENERATE_SJ", dll.
  description   String         // "Wandi changed status PROSES SERVICE -> SELESAI"
  previousData  Json?
  newData       Json?
  createdAt     DateTime       @default(now())
}
```

---

## 📋 Acceptance Criteria
- [ ] File `prisma/schema.prisma` dibuat sesuai struktur relasional di atas.
- [ ] Database migration berhasil dijalankan (`npx prisma migrate dev`).
- [ ] Terdapat index pada `ticketNumber`, `suratJalanNumber`, `status`, dan `entryDate`.
