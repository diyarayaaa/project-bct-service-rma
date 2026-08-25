# 📌 Issue #10: Operational RMA WhatsApp Report Generator (`LAPORAN_WA`)

## 🎯 Deskripsi
Membangun modul generator laporan operasional harian untuk tim teknisi/RMA yang membedakan pergerakan barang garansi ke vendor Bandung (`BDG`) dan Jakarta (`JKT`).

---

## 🛠️ Struktur & Logika Format Laporan

Laporan dibagi menjadi 3 blok:
1. **BARANG KE BANDUNG [TGL HARI INI]**
   - Filter: `serviceType = GARANSI` dan `vendorSentDate = Hari Ini` dan `vendor.location = BDG`.
   - Dikelompokkan per **Nama Distributor/Vendor**.
2. **BARANG DI VENDOR BDG**
   - Filter: `customer.isInternalStock = true` (atau nama `STOCK BCT`/`GHITP`), `status = PROSES_GARANSI`, `vendor.location = BDG`.
   - Menampilkan tanggal kirim (`dd/MM/yy`) di atas nama barang.
3. **BARANG DI VENDOR JKT**
   - Filter: `customer.isInternalStock = true`, `status = PROSES_GARANSI`, `vendor.location = JKT`.

---

## 📝 Contoh Format Output yang Dihasilkan:
```text
*BARANG KE BANDUNG 30-07-2026*

*AGRES ID*
LONGDIMM VISIPRO 8GB DDR4 3200MHZ
├─ S/N: 25310339
├─ KELUHAN: BSOD
├─ USER: STOCK BCT
└─ CATT: -

*PAK AMIN (ELITE KOMPUTER)*
ASUS A1400EA-FHD352
├─ S/N: R6N0CV16L81826B
├─ KELUHAN: MATI TOTAL
├─ USER: TN/NY.LINGDA
└─ CATT: CEK HARDWARE

*BARANG DI VENDOR BDG*
*AGRES ID*
30/07/26
LONGDIMM VISIPRO 8GB DDR4 3200MHZ
├─ S/N: 25310339
├─ KELUHAN: BSOD
├─ USER: STOK
└─ CATT: -

*BARANG DI VENDOR JKT*
*ASIA RAYA*
09/06/26
VGA GT730 4GB DDR3 VENOMRX
├─ S/N: GT7304GD325120509
├─ KELUHAN: PANAS GAK NORMAL
├─ USER: STOK
└─ CATT: -
```

---

## 📋 Aturan Formatting Khusus:
- Nama vendor hanya muncul 1 kali per grup barang.
- Penanda `BDG` atau `JKT` pada nama vendor otomatis dibersihkan saat ditampilkan (Contoh: `ASIA RAYA JKT` -> `*ASIA RAYA*`).
- Tidak ada enter kosong antar barang dalam satu vendor; enter hanya diberikan antar vendor yang berbeda.

---

## 📋 Acceptance Criteria
- [ ] Halaman khusus preview laporan `LAPORAN_WA` yang meng-query database secara realtime.
- [ ] Tombol **"Salin Format WA"** (1-click copy) yang menyalin teks berformat persis seperti contoh.
- [ ] Filter tanggal untuk melihat arsip laporan hari-hari sebelumnya.
