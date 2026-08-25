# 📌 Issue #08: Print Engine (Struk Thermal, Tanda Terima A4, Surat Jalan, Label Alamat)

## 🎯 Deskripsi
Menyediakan modul pencetakan dokumen profesional dengan template CSS `@media print` yang presisi.

---

## 🛠️ Dokumen yang Dibuat:

### 1. Surat Tanda Terima Masuk (Pilihan Struk Thermal 58mm/80mm & Faktur A4/A5):
- **Header:** Logo Best Computel, Alamat Toko, No Telepon/WhatsApp, Jam Operasional.
- **Data:** No RMA/Layanan (`BCTRS26-0312`), Tgl Masuk, Nama Pelanggan, No HP, Jenis & Nama Barang, S/N, Keluhan, Kelengkapan, Estimasi Selesai, Teknisi, Estimasi Biaya, DP, Sisa.
- **Footer:** Syarat & Ketentuan Pengambilan (Wajib bawa nota/No RMA, barang tidak diambil >30 hari bukan tanggung jawab toko, pengecekan saat pengambilan), Tanda Tangan Pelanggan & Penerima.

### 2. Dokumen Surat Jalan Vendor (A4):
- **Header:** Identitas Best Computel & Nomor Surat Jalan (`SJ-BCTRS-260015`).
- **Kepada:** Yth. [Nama Vendor] di [Lokasi/Alamat Vendor].
- **Tabel Daftar Barang:** No, No Layanan, Nama & Seri Barang, Serial Number (S/N), Keluhan/Masalah, Kelengkapan.
- **Kolom Tanda Tangan:** Pengirim (Best Computel), Ekspedisi/Kurir, Penerima (Vendor).

### 3. Label Alamat Pengiriman Paket (Ukuran Label Stiker / A6):
- **Penerima:** Nama Vendor, Alamat Lengkap Vendor, No Telp / PIC Vendor.
- **Pengirim:** Best Computel Service & RMA, Alamat Toko, No Telp.
- No Resi & No Surat Jalan.

---

## 📋 Acceptance Criteria
- [ ] Tombol cetak langsung membuka dialog print browser yang rapi tanpa elemen navigasi website.
- [ ] Tampilan struk thermal 58mm/80mm tidak terpotong dan pas.
- [ ] Surat Jalan A4 tertata rapi dalam format tabel resmi.
- [ ] Label alamat siap cetak untuk ditempel pada kardus paket pengiriman.
