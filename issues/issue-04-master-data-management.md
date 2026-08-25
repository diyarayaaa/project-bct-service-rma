# 📌 Issue #04: Master Data Management (Vendor, Customer, Preset)

## 🎯 Deskripsi
Membuat antarmuka CRUD (Create, Read, Update, Delete) untuk Vendor/Distributor, Customer, dan Preset Keluhan/Kelengkapan agar data vendor dan preset keluhan baru dapat ditambahkan secara dinamis dan tersimpan permanen.

---

## 🛠️ Fitur & Validasi

### 1. Vendor Management:
- **Form Input:**
  - Nama Vendor (Contoh: `PT. ASIA RAYA COM` atau `ASIA RAYA JKT`)
  - Kode Penanda / Alias (Contoh: `ASIA RAYA`)
  - Lokasi (`BDG` / `JKT` / `OTHER`)
  - Alamat Lengkap (digunakan untuk label cetak pengiriman ekspedisi)
  - Nama Kontak (PIC) & Nomor Telepon
- **Quick Add Vendor:** Modal popup untuk menambah vendor baru secara instan saat teknisi mengisi form servis/garansi.

### 2. Customer Directory:
- Tabel direktori pelanggan + riwayat servis yang pernah dilakukan.
- Switch flag `isInternalStock` untuk `STOCK BCT` dan `GHITP`.
- Quick search berdasarkan Nama atau Nomor HP.

### 3. Preset Keluhan & Kelengkapan:
- Dropdown preset keluhan yang bisa ditambah opsi baru langsung dari form penerimaan (`PresetOption`) dan tersimpan permanen.

---

## 📋 Acceptance Criteria
- [ ] CRUD Vendor berfungsi penuh (termasuk penyimpanan alamat lengkap untuk label cetak pengiriman).
- [ ] Direktori customer dapat mencari nama atau nomor HP dengan responsif.
- [ ] Opsi preset baru yang di-input dari form otomatis tersimpan ke tabel `PresetOption`.
