# 📌 Issue #05: Service & RMA Intake Form (Pendaftaran Unit Masuk)

## 🎯 Deskripsi
Membangun form penerimaan unit masuk yang dinamis, cepat, dan otomatis sesuai logika bisnis yang sebelumnya ada di AppSheet.

---

## 🛠️ Logika & Aturan Bisnis Form

1. **Nomor Layanan (`ticketNumber`):**
   - Auto-generate dengan format: `BCTRS[YY]-[0000]` (Contoh: `BCTRS26-0312` untuk urutan 312 tahun 2026).
   - Nilai tetap dapat disesuaikan manual (editable) jika admin/teknisi ingin melompati nomor.
2. **Tanggal & Jam Masuk (`entryDate`):**
   - Default: Tanggal dan jam saat ini (`now()`), dapat diedit jika penginputan susulan.
3. **Jenis Layanan (`serviceType`):**
   - Opsi: `SERVICE` atau `GARANSI`.
4. **Nama Customer (`name`):**
   - Auto-prefix: Jika user mengetik nama biasa, sistem otomatis menambahkan prefix `TN/NY. ` (Contoh: `WANDI ADITYA PUTRA` -> `TN/NY. WANDI ADITYA PUTRA`).
   - Pengecualian: Jika memilih dari daftar customer internal seperti `STOCK BCT` atau `GHITP`, prefix tidak dipaksakan.
5. **No HP (`phone`):**
   - Input nomor WhatsApp (Contoh: `081318489243` atau `6281318489243`), divalidasi format nomor ponsel Indonesia.
6. **Jenis Barang & Kelengkapan Dinamis (`deviceType` & `accessories`):**
   - Pilihan: `Laptop`, `PC`, `Printer`, `Projector`, `Aksesoris`, `Sparepart`, `Other`.
   - **Logika Checklist Kelengkapan:**
     - `Laptop` ➡️ Opsi: *Unit, Charger, Tas, Unit saja, RAM, SSD, BATERAI*.
     - `PC` ➡️ Opsi: *Tutup case 1, Tutup case full, Dus, RAM, SSD, HDD, VGA, PSU*.
     - `Selain Laptop & PC` ➡️ Opsi: *Fulldus, Unit Saja, Adaptor, Kabel*.
     - Dukungan input custom kelengkapan manual.
7. **Nama Barang (`deviceName`):** Seri lengkap (Contoh: `LENOVO IP S145`, `ASUS A1400EA-FHD352`).
8. **Serial Number / SN (`serialNumber`):** Input SN unit, dengan opsi `-` jika tidak ada SN.
9. **Keluhan (`complaint`):** Dropdown searchable dari preset + opsi ketik keluhan baru.
10. **Estimasi Selesai (`estimatedCompletionDate`):** Datepicker estimasi waktu perbaikan.
11. **Teknisi Penanggung Jawab (`technicianId`):** Dropdown nama teknisi (Wandi, Satryo, Derida, Anzar).
12. **Status Awal (`status`):**
    - Default untuk `SERVICE`: `PROSES SERVICE`.
    - Default untuk `GARANSI`: `PROSES GARANSI`.
13. **Keuangan & DP:**
    - `Estimasi Biaya`: Input nominal.
    - `DP (Down Payment)`: Input nominal.
    - `Sisa Biaya`: Dihitung otomatis (`Estimasi Biaya - DP`).
14. **Catatan Tambahan (`notes`):** Password Windows/BIOS, kondisi fisik lecet, dll.

---

## 📋 Acceptance Criteria
- [ ] Nomor layanan ter-generate otomatis secara sekuensial dan unik per tahun (`BCTRS26-0312`).
- [ ] Perubahan `Jenis Barang` langsung mengubah daftar checkbox kelengkapan secara reaktif tanpa lag.
- [ ] Input nama otomatis menerapkan format `TN/NY. `.
- [ ] Perhitungan `Sisa = Estimasi Biaya - DP` berjalan realtime saat user mengetik.
- [ ] Form submit berhasil menyimpan data dan memicu opsi cetak tanda terima / kirim WA serah terima.
