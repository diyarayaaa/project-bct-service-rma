# 📌 Issue #14: Full Data Editing & Master Maintenance

## 🎯 Deskripsi
Membangun modul dan dialog modal pengubahan data (Edit) secara menyeluruh untuk Tiket Servis, Master Customer, Master Vendor, dan Option Presets. Fitur ini memungkinkan pengguna untuk mengubah data dasar seperti Nama Customer (misal dari *ASEP* menjadi *ANDI*), No Telepon, Detail Perangkat, Serial Number, Keluhan, Alamat Vendor, dan informasi master lainnya.

---

## 🛠️ Cakupan Implementasi Fitur Edit

1. **Edit Data Tiket Servis (`/tickets`)**:
   - Menambahkan tombol **Edit Tiket** (ikon pensil 📝) pada setiap baris tabel tiket.
   - Modal Dialog Form Edit Tiket yang mencakup:
     - Nama Customer & Nomor Telepon (pembaruan otomatis ke tabel Customer terkait).
     - Jenis Barang, Nama/Model Perangkat, Serial Number (SN).
     - Keluhan & Daftar Kelengkapan Aksesoris.
     - Estimasi Tanggal Selesai & Estimasi Biaya/DP.
   - Server Action `updateTicketDetailsAction` yang memperbarui database dan mencatat `AuditLog` perubahan data.

2. **Edit Master Customer (`/customers`)**:
   - Menambahkan tombol **Edit** di tabel data Customer.
   - Modal Dialog Edit Customer: Nama Customer & Nomor Telepon.
   - Server Action `updateCustomerAction`.

3. **Edit Master Vendor (`/vendors`)**:
   - Menambahkan tombol **Edit** di tabel Vendor.
   - Modal Dialog Edit Vendor: Nama Vendor, Alias Code, Lokasi (BDG/JKT/OTHER), Alamat Lengkap, Contact Person (PIC), dan Nomor HP.
   - Server Action `updateVendorAction`.

4. **Edit Option Presets (`/presets`)**:
   - Menambahkan tombol **Edit** di tabel Presets.
   - Modal Dialog Edit Preset: Kategori, Label, dan Jenis Barang.
   - Server Action `updatePresetAction`.

---

## 📋 Acceptance Criteria
- [ ] Tombol Edit (ikon 📝/Pencil) tersedia di tabel Tiket, Customer, Vendor, dan Presets.
- [ ] Modal dialog edit muncul dengan data terisi otomatis (*pre-filled*) sesuai baris data yang dipilih.
- [ ] Mengubah Nama Customer (contoh: *ASEP* ➔ *ANDI*) memperbarui data customer secara real-time pada semua tampilan tiket terkait.
- [ ] Perubahan data tiket tercatat secara otomatis di tabel `AuditLog`.
- [ ] Validasi data backend memastikan data yang diubah sesuai skema dan tidak merusak integritas relasi database.
