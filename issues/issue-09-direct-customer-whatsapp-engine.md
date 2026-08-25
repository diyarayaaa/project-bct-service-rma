# 📌 Issue #09: Direct Customer WhatsApp Engine

## 🎯 Deskripsi
Fitur pengiriman notifikasi WhatsApp langsung ke nomor pelanggan untuk konfirmasi serah terima awal dan pemberitahuan barang selesai diperbaiki.

---

## 🛠️ Template Pesan Standar

### Template 1: Tanda Terima Masuk
```text
Hallo TN/NY. {NAMA_CUSTOMER}
Kami telah menerima perangkat Anda untuk proses {JENIS_LAYANAN} dengan rincian berikut:
━━━━━━━━━━━━━━━
No RMA : {NO_LAYANAN}
Tanggal Masuk : {TGL_MASUK}
Jenis Barang : {JENIS_BARANG}
Nama Barang : {NAMA_BARANG}
Serial Number : {SERIAL_NUMBER}
Keluhan : {KELUHAN}
Kelengkapan : {KELENGKAPAN}
Estimasi Selesai : {ESTIMASI_SELESAI}
━━━━━━━━━━━━━━━
Mohon simpan pesan ini sebagai bukti serah terima perangkat.
Catatan:
• Pengambilan perangkat wajib menunjukkan No RMA.
• Perangkat yang tidak diambil lebih dari 30 hari setelah konfirmasi selesai bukan menjadi tanggung jawab kami atas segala risiko yang terjadi.
• Mohon melakukan pengecekan perangkat saat pengambilan.
Terima kasih
-{NAMA_TEKNISI} Best Computel Service
```

---

### Template 2: Notifikasi Selesai Diperbaiki
```text
Hallo TN/NY. {NAMA_CUSTOMER}
Saya {NAMA_TEKNISI} dari Best Computel Service, Ingin menginformasikan bahwa perangkat:
━━━━━━━━━━━━━━━
Nama Perangkat : {NAMA_BARANG}
Keluhan : {KELUHAN}
━━━━━━━━━━━━━━━
Telah *SELESAI* diperbaiki dan sudah dapat diambil.
Silakan datang sesuai jam operasional toko:
• Senin - Jumat : 09.00 - 17.00
• Sabtu : 09.00 - 15.00
• Minggu dan Tanggal Merah : Libur
Terima kasih.
```

---

## 🛠️ Metode Eksekusi
1. **Tombol "Kirim WA (Direct wa.me)":** Membuka link `https://wa.me/{PHONE_FORMATTED}?text={ENCODED_MESSAGE}`.
2. **Tombol "Salin Pesan":** Menyalin isi template yang sudah terisi data ke clipboard (1-click copy).
3. **Integrasi Gateway (Opsional jika API key terkonfigurasi):** Kirim otomatis di background via REST API WhatsApp Gateway.

---

## 📋 Acceptance Criteria
- [ ] Format pesan ter-generate 100% presisi sesuai format lama.
- [ ] Nomor telepon otomatis disesuaikan ke format internasional (`0813...` -> `62813...`).
- [ ] Tombol *Direct WhatsApp* dan *Copy Text* berfungsi baik di desktop maupun smartphone.
