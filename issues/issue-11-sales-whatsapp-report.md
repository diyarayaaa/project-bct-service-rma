# 📌 Issue #11: Sales WhatsApp Report Generator (`LAPORAN_WA_SALES`)

## 🎯 Deskripsi
Membangun modul generator laporan khusus sales untuk memantau status barang inventaris toko (`STOCK BCT` dan `GHITP`).

---

## 🛠️ Spesifikasi Detail & Target Pengiriman
- **Target Nomor Sales:** `0821-2008-1484` (`6282120081484`).
- **Filter Utama Data:** Hanya mengambil tiket dengan `customer.isInternalStock = true` (atau nama Customer mengandung `STOCK BCT` / `GHITP`).

---

## 🛠️ Struktur 4 Bagian Laporan:

1. **GARANSIAN SELESAI [TGL HARI INI] (STOK BCT/GHITP)**
   - Filter: `pickupDate = Hari Ini` (atau status `SELESAI` pada hari ini).
   - Format menampilkan: `S/N Lama` dan `S/N Baru` (jika unit diganti baru oleh vendor).
2. **GARANSIAN DI VENDOR BDG (STOK BCT/GHITP)**
   - Filter: `status = PROSES_GARANSI`, `vendor.location = BDG`.
3. **GARANSIAN DI VENDOR JKT (STOK BCT/GHITP)**
   - Filter: `status = PROSES_GARANSI`, `vendor.location = JKT`.
4. **GARANSIAN BELUM DIPROSES (STOK BCT/GHITP)**
   - Filter: Unit stock yang baru masuk tetapi belum diproses / belum ada nomor surat jalan / status masih antrian awal.

---

## 📝 Contoh Format Output:
```text
*GARANSIAN SELESAI 24-08-2026 (STOK BCT/GHITP)*

*CCK*
SWITCH HUB TP LINK 8 PORT GIGA TL-SG1008D
├─ S/N Lama: 2259820019511
├─ S/N Baru: 225B12Y016852
└─ Catt: -

*PT. ASIA GLOBAL SUKSESINDO (AGS)*
MOBO VURRION ESSENTIAL H61M-D3H
├─ S/N Lama: VE2025080980476
├─ S/N Baru: VE202620221211
└─ Catt: -

*GARANSIAN DI VENDOR BDG (STOK BCT/GHITP)*
*AGRES ID*
30/07/26
LONGDIMM VISIPRO 8GB DDR4 3200MHZ
├─ S/N: 25310339
├─ Keluhan: BSOD
└─ Catt: -

*GARANSIAN DI VENDOR JKT (STOK BCT/GHITP)*
*PT. ASIA GLOBAL SUKSESINDO (AGS)*
31/07/26
SSD SATA ARMOUR 128GB
├─ S/N: -
├─ Keluhan: CORRUPT/NO DETECTED
└─ Catt: -

--------------------------------------------------
--------------------------------------------------

*GARANSIAN BELUM DIPROSES (STOK BCT/GHITP)*

*SC COMP*
RAM DDR4 8GB
├─ S/N: -
├─ Keluhan: NO DISPLAY
└─ Catt: -
```

---

## 📋 Acceptance Criteria
- [ ] Tombol **"Kirim ke WhatsApp Sales"** yang otomatis membuka chat WA ke `082120081484` dengan isi laporan lengkap.
- [ ] Menampilkan komparasi `S/N Lama` dan `S/N Baru` pada unit yang diganti baru.
- [ ] Tombol **"Salin Format Sales"** untuk kemudahan copy-paste.
- [ ] Filter tanggal untuk melihat arsip laporan sales harian.
