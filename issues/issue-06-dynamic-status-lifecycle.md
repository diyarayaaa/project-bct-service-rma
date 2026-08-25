# 📌 Issue #06: Dynamic Status Lifecycle & Conditional Workflow

## 🎯 Deskripsi
Mengatur siklus hidup status servis/garansi lengkap dengan logika conditional field (munculnya input tambahan sesuai status yang dipilih).

---

## 🛠️ Matrix Aturan Status & Field Dinamis

| Status | Tipe Layanan | Field Tambahan yang Wajib Muncul | Efek / Catatan Sistem |
| :--- | :--- | :--- | :--- |
| **`PROSES SERVICE`** | SERVICE | - | Masuk ke antrian *Service on Progress* |
| **`PENDING SERVICE`** | SERVICE | Catatan Pending (opsional) | Masuk antrian *Service on Progress* dengan badge warna kuning/oranye (menunggu konfirmasi user/sparepart) |
| **`ALIH SERVICE`** | SERVICE | • No Surat Jalan<br>• Vendor/Distributor<br>• Tgl Kirim ke Vendor<br>• Tgl Datang dari Vendor<br>• Hasil Service/Garansi | Unit dialihkan ke vendor luar. Masuk ke monitoring RMA vendor. |
| **`PROSES GARANSI`** | GARANSI | • No Surat Jalan<br>• Vendor/Distributor<br>• Tgl Kirim ke Vendor<br>• Tgl Datang dari Vendor<br>• Hasil Garansi (`Diservice` / `Diganti baru`)<br>• **SN Baru** (Jika hasil: *Diganti baru*) | Masuk ke monitoring klaim garansi vendor. |
| **`SELESAI BELUM DIAMBIL`** | SERVICE & GARANSI | - | Masuk ke antrian *Barang Belum Diambil* di Dashboard. |
| **`SELESAI & DIAMBIL`** | SERVICE & GARANSI | • Biaya Akhir<br>• Tgl Diambil Customer (`pickupDate`) | Tiket selesai penuh, keluar dari antrian aktif. |
| **`GAGAL SERVICE/GARANSI`**| SERVICE & GARANSI | • Biaya Akhir (bisa 0 / biaya cek)<br>• Tgl Diambil Customer | Tiket ditutup dengan status perbaikan gagal/batal. |

---

## 📋 Acceptance Criteria
- [ ] Dropdown status memicu tampilan form kondisional secara tepat sesuai matrix di atas.
- [ ] Jika Hasil Garansi = `Diganti baru`, field `SN Baru` wajib diisi.
- [ ] Setiap perubahan status tercatat di `AuditLog` secara otomatis.
- [ ] Validasi Zod di backend memastikan field kondisional tidak boleh kosong jika status terkait aktif.
