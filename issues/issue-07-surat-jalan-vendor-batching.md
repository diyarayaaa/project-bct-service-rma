# 📌 Issue #07: Surat Jalan & Vendor Shipment Batching

## 🎯 Deskripsi
Fitur pengelompokan (batching) beberapa unit barang (baik Garansi maupun Alih Service) yang akan dikirim ke 1 Vendor yang sama dalam 1 Nomor Surat Jalan (menggantikan fungsi `VLOOKUP` spreadsheet).

---

## 🛠️ Alur Kerja & Spesifikasi

### 1. Batching Selection:
- Menu khusus: **"Pengiriman Vendor / Surat Jalan"**.
- Menampilkan daftar unit yang berstatus `PROSES GARANSI` atau `ALIH SERVICE` yang belum memiliki No Surat Jalan.
- User memfilter berdasarkan Vendor tujuan (Contoh: `PT. ASIA RAYA COM`).
- User memilih / mencentang (checkbox) barang-barang yang akan dikirim (misal: 3 unit).

### 2. Pembuatan Surat Jalan:
- Auto-generate Nomor Surat Jalan: `SJ-BCTRS-[YY][0000]` (Contoh: `SJ-BCTRS-260015`).
- Input: Tanggal Kirim, Ekspedisi/Kurir (JNE, Tiki, Antar Langsung), Nomor Resi Pengiriman, Catatan.
- Submit akan meng-update seluruh tiket yang dipilih dengan `deliveryNoteId` dan `vendorSentDate` yang sama secara serentak (*atomic transaction*).

### 3. Daftar & Detail Surat Jalan:
- Melihat histori surat jalan yang pernah dibuat.
- Melihat status kedatangan barang dari vendor per item dalam surat jalan tersebut.

---

## 📋 Acceptance Criteria
- [ ] Dapat memilih multi-item barang untuk 1 vendor dan men-generate 1 No Surat Jalan bersamaan.
- [ ] Nomor Surat Jalan unik dan otomatis (`SJ-BCTRS-260015`).
- [ ] Data barang di dalam surat jalan ter-link secara relasional.
- [ ] Tersedia tombol cepat untuk mencetak Surat Jalan dan Label Alamat.
