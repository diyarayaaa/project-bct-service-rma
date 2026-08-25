# 📌 Issue #03: Authentication, RBAC, & Database Seeder

## 🎯 Deskripsi
Membuat sistem autentikasi sederhana (Admin, Teknisi, Sales) dan script seeder untuk memasukkan data awal teknisi, vendor, dan preset keluhan.

---

## 🛠️ Spesifikasi Detail

### 1. User / Teknisi Awal:
- `Wandi` (Technician)
- `Satryo` (Technician)
- `Derida` (Technician)
- `Anzar` (Technician)
- `Admin` (Admin)
- `Sales` (Sales)

### 2. Vendor / Distributor Awal:
- `AGRES ID BDG` (Location: `BDG`)
- `ASIA RAYA JKT` (Location: `JKT`)
- `SC COMP JKT` (Location: `JKT`)
- `DTG BANDUNG BDG` (Location: `BDG`)
- `PAK AMIN (ELITE KOMPUTER)` (Location: `BDG`)
- `CCK` (Location: `JKT`)
- `INTERAKSI CIPTA` (Location: `JKT`)
- `PT. ASIA GLOBAL SUKSESINDO (AGS)` (Location: `JKT`)

### 3. Preset Customer Internal:
- `STOCK BCT` (`isInternalStock: true`)
- `GHITP` (`isInternalStock: true`)

### 4. Preset Keluhan Awal (Complaints):
- Mati Total
- Lambat
- BSOD
- Fan Gak Nyala
- Panas Gak Normal
- Corrupt/No Detected
- Keyboard Eror
- Nyala Mati
- Cek Hardware

---

## 📋 Acceptance Criteria
- [ ] Autentikasi berjalan lancar (Session login tersimpan via NextAuth atau cookie-based auth).
- [ ] Script `prisma/seed.ts` berhasil menginput data awal teknisi, vendor, customer internal, dan preset keluhan.
- [ ] Role-based middleware membatasi halaman tertentu sesuai hak akses pengguna.
