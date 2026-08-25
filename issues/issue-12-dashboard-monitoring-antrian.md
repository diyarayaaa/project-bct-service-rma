# 📌 Issue #12: Dashboard Monitoring & Antrian Kerja Teknisi

## 🎯 Deskripsi
Membangun dashboard utama sebagai pusat kendali operasional harian teknisi dan manajemen, menampilkan status antrian pengerjaan secara realtime.

---

## 🛠️ Komponen Dashboard:

### 1. Statistik Cepat (Summary Cards):
- Total Service Aktif (`PROSES SERVICE` + `PENDING SERVICE`).
- Total Barang Selesai Belum Diambil (`SELESAI_BELUM_DIAMBIL`).
- Total Garansi Aktif di Vendor (`PROSES_GARANSI` + `ALIH_SERVICE`).
- Total Unit Masuk Hari Ini.

### 2. List SERVICE ON PROGRESS:
- Tabel/Kartu antrian servis aktif.
- Highlight warna kuning/oranye untuk unit `PENDING SERVICE` (menandai pengerjaan tertunda/menunggu konfirmasi customer).
- Filter cepat berdasarkan Teknisi (Wandi, Satryo, Derida, Anzar).

### 3. List BARANG BELUM DIAMBIL:
- Memantau perangkat pelanggan yang sudah selesai namun belum diambil (dilengkapi durasi hari sejak status selesai).

### 4. Global Search & Filter Cepat:
- Cari instan berdasarkan: No Layanan (`BCTRS...`), Nama Customer, No HP, Serial Number, atau Nama Perangkat.

---

## 📋 Acceptance Criteria
- [ ] Dashboard responsif di layar desktop PC kasir/admin maupun smartphone/tablet teknisi.
- [ ] Search bar mampu menemukan tiket dalam hitungan milidetik.
- [ ] Status antrian realtime dan akurat.
- [ ] Tersedia shortcut tombol untuk *"Input Tiket Baru"*, *"Buat Surat Jalan"*, dan *"Lihat Laporan WA"*.
