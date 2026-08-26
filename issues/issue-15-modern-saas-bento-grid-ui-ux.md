# 📌 Issue #15: Panduan Transformasi UI/UX: Dashboard Monitoring Operasional SaaS Modern (Bento Grid & Electric Blue)

Dokumen ini berisi panduan komprehensif, spesifikasi desain, dan rekomendasi teknis untuk merombak tampilan web Best Computel (Service & RMA System) menjadi dashboard SaaS modern berbasis tren desain **Bento Grid** dengan skema warna utama **Electric Blue**.

---

## 1. Analisis UI Saat Ini vs Target Modern SaaS

| Komponen UI | Kondisi Dashboard Saat Ini | Target Desain SaaS Modern |
| :--- | :--- | :--- |
| **Layout Keseluruhan** | Dominan warna putih polos, struktur linear konvensional, kurang kontras visual. | Menggunakan struktur **Bento Grid** (card asimetris dengan sudut membulat tinggi) dan efek kedalaman (*soft shadows*). |
| **Sidebar (Navigasi)** | Navigasi vertikal statis dengan teks kecil-tipis dan ikon standar hitam. | **Glassmorphism sidebar** (efek blur semi-transparan), teks semi-bold dengan status aktif berwarna biru tegas. |
| **Statistik Utama (KPI)** | Card informasi terlalu lebar, teks angka tidak menonjol, ikon monoton. | Card asimetris dengan background berwarna biru pudar lembut (*soft tint/pastel blue*) dan indikator performa tren. |
| **Tabel & Konten Utama** | Area kosong (*empty state*) putih bersih dengan teks standar di tengah. | *Empty state* interaktif dengan ilustrasi garis minimalis modern 2D, tombol aksi cepat, dan *micro-interactions*. |

---

## 2. Spesifikasi Skema Warna & Tipografi

Untuk menciptakan nuansa profesional yang premium, gunakan palet warna berbasis **Electric Deep Blue** berikut:

### A. Palet Warna (Tailwind CSS Tokens)
* **Primary / Brand Blue**: `#2563EB` (`Blue 600`) — Digunakan untuk aksi utama, tombol primer, dan status aktif.
* **Secondary / Accent Blue**: `#3B82F6` (`Blue 500`) — Untuk variasi status atau hover element.
* **Background Utama**: `#F8FAFC` (`Slate 50`) — Warna latar belakang aplikasi agar mata tidak cepat lelah.
* **Card Background**: `#FFFFFF` (`Solid White`) dengan border `#E2E8F0` (`Slate 200`).
* **Soft Tint Blue**: `#EFF6FF` (`Blue 50`) — Warna latar belakang card ringkasan atau baris aktif.
* **Text Primary**: `#0F172A` (`Slate 900`) — Untuk judul, angka statis utama, dan komponen tebal.
* **Text Secondary**: `#475569` (`Slate 600`) — Untuk label sub-menu, deskripsi singkat, dan detail data.

### B. Tipografi
* **Font Family**: Gunakan Google Fonts *Plus Jakarta Sans* atau *Inter* untuk keterbacaan data numerik yang optimal.
* **Ukuran Angka KPI**: Naikkan menjadi `text-3xl` atau `text-4xl` dengan ketebalan `font-bold` agar langsung menjadi fokus utama mata.

---

## 3. Rekomendasi Struktur Desain Komponen (Bento Grid)

Ubah tata letak bagian atas (Dashboard Monitoring Operasional) menjadi 4 grid card dengan ukuran dinamis:

1. **Card 1 (Antrian Service Aktif)**:
   * **Ukuran**: Lebar 2 kolom (`col-span-2`).
   * **Visual**: Menggunakan latar belakang gradasi lembut dari `#EFF6FF` ke putih. Angka dibuat besar dengan ikon obeng/kunci pas berwarna biru elektrik di sudut kanan atas.
2. **Card 2 (Selesai Belum Diambil)**:
   * **Ukuran**: Lebar 1 kolom (`col-span-1`).
   * **Visual**: Menggunakan indikator badge melingkar kecil berwarna kuning di pojok teks penunjuk status.
3. **Card 3 (Garansi / Alih Vendor)**:
   * **Ukuran**: Lebar 1 kolom (`col-span-1`).
   * **Visual**: Berikan badge status progres berdesain kapsul (*pills*) di bawah angka utama.
4. **Card 4 (Unit Masuk Hari Ini)**:
   * **Ukuran**: Lebar 2 kolom di baris bawah atau atas yang menyesuaikan rasio visual.

---

## 4. Referensi Potongan Kode (Tailwind CSS + Shadcn UI Style)

Berikut adalah contoh implementasi struktur HTML/CSS modern untuk bagian Card Statistik:

```html
<!-- Grid Wrapper -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
  
  <!-- Card Antrian Service Aktif (Gaya Bento Grid Modern) -->
  <div class="bg-gradient-to-br from-blue-50 to-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 col-span-2 group">
    <div class="flex justify-between items-start">
      <div>
        <p class="text-sm font-medium text-slate-500">Antrian Service Aktif</p>
        <h3 class="text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">0</h3>
      </div>
      <div class="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 text-blue-600">
        <!-- Ikon Obeng / Wrench (Heroicons) -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    </div>
    <div class="mt-4 flex items-center gap-2">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        On Progress & Pending
      </span>
    </div>
  </div>

  <!-- Ulangi struktur serupa untuk Card lainnya dengan ukuran col-span-1 atau col-span-2 -->
</div>
```

---

## 5. Pembaruan Komponen Mikro & Elemen UI Lainnya

* **Tombol Aksi Atas (Header Actions)**:
  Ubah tombol "Input Tiket Baru", "Buat Surat Jalan", dll., menjadi barisan tombol dengan ikon modern minimalis. Berikan efek glowing border transparan atau shadow berwarna biru tajam saat kursor berada di atas tombol primer (`shadow-blue-500/20`).
* **Filter Teknisi**:
  Ganti teks nama teknisi ("Semua", "Anzar", "Dendda", dll.) dengan komponen **Tabs Segmen** layaknya iOS/SaaS modern. Komponen ini memiliki latar belakang abu-abu pudar tipis, dan pilihan yang aktif ditandai dengan kotak putih meluncur (*sliding active background*) bersudut tumpul penuh.
* **Search Bar Tengah**:
  Tambahkan ikon kaca pembesar (*Magnifying Glass*) di dalam kotak input di sebelah kiri teks placeholder. Ubah sudut border dari kotak biasa menjadi lebih membulat penuh (*fully rounded pills*) dengan animasi ketebalan border warna biru saat status *focused*.

---

## 📋 Checklist Implementasi:
- [ ] Implementasi layout Bento Grid dinamis pada `src/app/(dashboard)/dashboard-client.tsx`.
- [ ] Penerapan palet warna *Electric Blue* (`#2563EB` / `#3B82F6`) dan *Slate* pada `globals.css` dan komponen card.
- [ ] Komponen tab segmen (*segmented control*) untuk filter teknisi dengan animasi transisi aktif.
- [ ] Tombol aksi header dengan aksen *soft glow* & *hover effect*.
- [ ] Kotak pencarian (*search bar*) bergaya *pill* dengan *focus ring* biru elektrik.
