# 📌 Issue #13: Audit Trail & Activity Logging

## 🎯 Deskripsi
Mencatat setiap tindakan penting yang dilakukan oleh user/teknisi untuk transparansi, riwayat aktivitas, dan audit operasional toko.

---

## 🛠️ Event yang Wajib Dicatat:
1. Pendaftaran tiket baru (`CREATE`).
2. Perubahan status (Contoh: `Wandi changed status PROSES SERVICE -> SELESAI`).
3. Pengubahan vendor atau keluhan (`Satryo updated complaint`).
4. Pembuatan surat jalan pengiriman (`Wandi generated shipment SJ-BCTRS-260015`).
5. Perubahan biaya akhir, DP, atau estimasi biaya.

---

## 🛠️ Spesifikasi Komponen
- Komponen timeline/tab **"Riwayat / Audit Log"** pada halaman detail setiap tiket.
- Menampilkan:
  - Nama Teknisi / User yang melakukan aksi.
  - Tanggal & Waktu akurat (`DD/MM/YYYY HH:mm`).
  - Label aksi dan ringkasan perubahan (misal: nilai lama `PROSES SERVICE` ➡️ nilai baru `SELESAI & DIAMBIL`).

---

## 📋 Acceptance Criteria
- [ ] Komponen tab **"Riwayat / Audit Log"** tampil pada halaman detail tiket.
- [ ] Log mencatat siapa user yang melakukan, waktu eksekusi, serta nilai sebelum dan sesudah perubahan.
- [ ] Log dibuat otomatis melalui database trigger atau backend middleware/action handler.
